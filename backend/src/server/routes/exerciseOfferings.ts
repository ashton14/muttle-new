import express, { Request, Response } from 'express';
import { prisma } from '../../prisma';
import { Token } from '../../utils/auth';
import { shortId } from '../../utils/utils';

const exerciseOfferings = express.Router({ mergeParams: true });

// Create an exercise offering
exerciseOfferings.post('/', async (req: Request, res: Response) => {
  const inviteCode = await getInviteCode();

  if (!inviteCode) {
    res.sendStatus(503);
    return;
  }

  const requestingUser = req.user as Token;
  if (!requestingUser) {
    res.sendStatus(403);
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: requestingUser.email,
    },
  });

  if (!user) {
    res.sendStatus(403);
    return;
  }

  const { conditionCoverage, mutators, minTests, exerciseId } = req.body;
  try {
    const saved = await prisma.exerciseOffering.create({
      data: {
        inviteCode,
        conditionCoverage,
        minTests: parseInt(minTests),
        mutators,
        owner: {
          connect: {
            id: user.id,
          },
        },
        exercise: {
          connect: {
            id: exerciseId,
          },
        },
      },
      include: {
        exercise: true,
      },
    });
    res.status(200).json(saved);
  } catch (err) {
    res.status(400).json({ message: err });
  }
});

// Get the exercise offering with the given id
exerciseOfferings.get('/:id', async (req: Request, res: Response) => {
  const requestingUser = req.user as Token;
  const exerciseOfferingId = parseInt(req.params.id);

  try {
    const exerciseOffering = await prisma.exerciseOffering.findUnique({
      where: {
        id: exerciseOfferingId,
      },
      include: {
        exercise: true,
        owner: true,
        users: true
      },
    });

    if (
      exerciseOffering &&
      exerciseOffering.owner.id === requestingUser.subject
    ) {
      res.status(200).json(exerciseOffering);
    } else {
      res.status(403).json({ message: 'Cannot access that record.' });
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

exerciseOfferings.put('/:id', async (req: Request, res: Response) => {
  const requestingUser = req.user as Token;
  try {
    const exerciseOffering = await prisma.exerciseOffering.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
      include: {
        owner: true,
      },
    });
    if (exerciseOffering?.owner.id !== requestingUser.subject) {
      res
        .status(403)
        .json({ message: 'Unauthorised to update that exercise offering.' });
    } else {
      const { conditionCoverage, mutators, minTests } = req.body;
      const updatedOffering = {
        conditionCoverage,
        mutators,
        minTests,
      };
      const saved = await prisma.exerciseOffering.update({
        where: {
          id: parseInt(req.params.id),
        },
        data: updatedOffering,
        include: {
          exercise: true,
        },
      });
      res.status(200).json(saved);
    }
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

/**
 * Utility to generate a unique invite code. In the unlikely event
 * that the generated code already exists in the database, try
 * again, a maximum of 5 times. This limit is arbitrarily chosen
 * because I'm not comfortable hitting the DB in a (potentially)
 * infinite loop.
 *
 * @returns A Promise which resolves to the code or null if a code
 *  couldn't be generated in 5 tries.
 */
const getInviteCode = async (): Promise<string | null> => {
  // TODO (Is there a better way to generate URL friendly IDs?)
  for (let i = 0; i < 5; i++) {
    const code = shortId();
    const existing = await prisma.exerciseOffering.findUnique({
      where: {
        inviteCode: code,
      },
    });
    if (!existing) {
      return code;
    }
  }
  return null;
};

// Get the requesting user's latest attempt for the given exercise offering
exerciseOfferings.get(
  '/:id/attempts/latest',
  async (req: Request, res: Response) => {
    const user = req.user as Token;
    if (!user) {
      res.sendStatus(403);
      return;
    }

    const attempt = await prisma.exerciseOffering.latestAttempt(
      user.subject,
      +req.params.id
    );

    res.json(attempt);
  }
);

exerciseOfferings.get(
  '/:id/attempts/allLatest',
  async (req: Request, res: Response) => {
    const requestingUser = req.user as Token;

    const owned = await prisma.user.ownedAssignments(requestingUser.subject);

    if (
      owned.some(
        assignment => assignment.exercise.ownerId === requestingUser.subject
      )
    ) {
      const attempts = await prisma.exerciseOffering.allLatestAttempts(
        +req.params.id
      );

      res.json(attempts);
    } else {
      res.sendStatus(403);
      return;
    }
  }

  // Does the requestingUser own the offering? If not, send back a 403 error message.
  // If it is the owner, **in a single database call** find ALL latest attempts for users
  // who have attempted the exercise.
  // Send all back in a JSON array.
  //
  // Resources:
  //    https://stackoverflow.com/questions/70834547/prisma-client-query-for-latest-values-of-each-user
  //    https://www.prisma.io/docs/orm/prisma-client/queries/aggregation-grouping-summarizing#select-distinct
);

export default exerciseOfferings;
