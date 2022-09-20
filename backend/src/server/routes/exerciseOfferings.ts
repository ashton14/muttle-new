import express, { Request, Response } from 'express';
import { getManager, getRepository } from 'typeorm';
import { Attempt } from '../../entity/Attempt';
import { Exercise } from '../../entity/Exercise';
import { ExerciseOffering } from '../../entity/ExerciseOffering';
import { User } from '../../entity/User';
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

  const user = await getRepository(User).findOne({
    where: {
      email: requestingUser.email,
    },
  });

  if (!user) {
    res.sendStatus(403);
    return;
  }

  const { conditionCoverage, mutators, exerciseId } = req.body;
  const exercise = await getRepository(Exercise).findOne({
    where: {
      id: exerciseId,
    },
  });

  const exerciseOffering = {
    conditionCoverage,
    mutators,
    inviteCode,
    exercise,
    owner: user,
  };

  try {
    const saved = await getRepository(ExerciseOffering).save(exerciseOffering);
    res.status(200).json(saved);
  } catch (err) {
    res.status(400).json({ message: err });
  }
});

exerciseOfferings.get('/:id', async (req: Request, res: Response) => {
  const requestingUser = req.user as Token;
  const exerciseOfferingId = parseInt(req.params.id);

  try {
    const exerciseOffering = await getRepository(ExerciseOffering).findOne({
      where: {
        id: exerciseOfferingId,
      },
      relations: ['owner', 'exercise'],
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
  const exerciseOfferingRepo = getRepository(ExerciseOffering);
  try {
    const exerciseOffering = await exerciseOfferingRepo.findOne({
      where: {
        id: req.params.id,
      },
      relations: ['owner'],
    });
    if (exerciseOffering?.owner.id !== requestingUser.subject) {
      res
        .status(403)
        .json({ message: 'Unauthorised to update that exercise offering. ' });
    } else {
      const { conditionCoverage, mutators, minTests } = req.body;
      const updatedOffering = {
        ...exerciseOffering,
        conditionCoverage,
        mutators,
        minTests,
      };
      exerciseOfferingRepo.save(updatedOffering);
      res.status(200).json({ ...updatedOffering });
    }
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

/**
 * True to generate a unique invite code. In the unlikely event
 * that the generated code already exists in the database, try
 * again, a maximum of 5 times. This limit is arbitrarily chosen
 * because I'm not uncomfortable hitting the DB in a (potentially)
 * infinite loop.
 *
 * @returns A Promise which resolves to the code or null if a code
 *  couldn't be generated in 5 tries.
 */
const getInviteCode = async (): Promise<string | null> => {
  // TODO (Is there a better way to generate URL friendly IDs?)
  const manager = getManager();
  let attempts = 0;
  while (attempts < 5) {
    const code = shortId();
    const existing = await manager.query(
      `SELECT EXISTS(SELECT 1 FROM "ExerciseOffering" WHERE "inviteCode" = '${code}') AS "exists"`
    );
    if (!existing[0].exists) {
      return code;
    } else {
      attempts = attempts + 1;
    }
  }
  return null;
};

exerciseOfferings.get(
  '/:id/attempts/latest',
  async (req: Request, res: Response) => {
    const user = req.user as Token;
    if (!user) {
      res.sendStatus(403);
      return;
    }

    res.json(
      await getRepository(Attempt).findOne({
        where: {
          exerciseOffering: { id: req.params.id },
          user: { id: user.subject },
        },
        relations: ['testCases'],
        order: {
          id: 'DESC',
        },
      })
    );
  }
);

export default exerciseOfferings;
