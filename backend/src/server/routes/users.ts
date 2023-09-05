import express, { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { ExerciseOffering } from '../../entity/ExerciseOffering';
import { User } from '../../entity/User';
import { Token } from '../../utils/auth';

const users = express.Router();

users.get('/:id/ownedAssignments', async (req: Request, res: Response) => {
  const requestingUser = req.user as Token;
  const userId = parseInt(req.params.id);
  if (!requestingUser || requestingUser.subject !== userId) {
    res.sendStatus(403);
    return;
  }

  try {
    const exerciseOfferings = await User.ownedAssignments(userId);
    res.json(exerciseOfferings);
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

users.get('/:id/assignments', async (req: Request, res: Response) => {
  const requestingUser = req.user as Token;
  const userId = parseInt(req.params.id);
  if (!requestingUser || requestingUser.subject !== userId) {
    res.sendStatus(403);
    return;
  }

  try {
    const user = await getRepository(User).findOneOrFail({
      where: {
        id: userId,
      },
      relations: ['exerciseOfferings'],
    });

    res.json(user.exerciseOfferings);
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// Get (or create and get) an assignment for the given user using the
// inviteCode. If no ExerciseOffering with the specified inviteCode exist
// return an error.
users.put(
  '/:id/assignments/:inviteCode',
  async (req: Request, res: Response) => {
    const requestingUser = req.user as Token;
    const userRepo = getRepository(User);
    const exerciseOfferingRepo = getRepository(ExerciseOffering);
    const userId = +req.params.id;
    const inviteCode = req.params.inviteCode;

    if (userId !== requestingUser.subject) {
      res
        .status(403)
        .json({ message: 'Something wrong with the authentication.' });
      return;
    }

    try {
      const exerciseOffering = await exerciseOfferingRepo.findOne({
        where: {
          inviteCode,
        },
      });

      const user = await userRepo.findOne({
        where: {
          id: userId,
        },
        relations: ['exerciseOfferings'],
      });

      if (!user) {
        res.status(401).json({
          message: 'Error with authentication.',
        });
        return;
      }

      if (!exerciseOffering) {
        res.status(400).json({
          message: 'There is no assignment with that invite code.',
        });
        return;
      }

      // We have a user and an exerciseOffering
      if (user.exerciseOfferings.includes(exerciseOffering)) {
        res.status(200).json(exerciseOffering);
      } else {
        user.exerciseOfferings.push(exerciseOffering);
        userRepo.save(user);
        res.status(200).json(exerciseOffering);
      }
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  }
);

export default users;
