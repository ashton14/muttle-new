import express, { Request, Response } from 'express';
import { getManager, getRepository } from 'typeorm';
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

  const exerciseOffering: ExerciseOffering = {
    ...req.body,
    inviteCode,
    owner: user,
  };

  try {
    const saved = await getRepository(ExerciseOffering).save(exerciseOffering);
    res.status(200).json(saved);
  } catch (err) {
    res.status(400).json({ message: err });
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

export default exerciseOfferings;
