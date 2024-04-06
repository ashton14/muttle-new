import express, { Request, Response } from 'express';
import { prisma } from '../../prisma';
import { Token } from '../../utils/auth';

const users = express.Router();

users.get('/:id/ownedAssignments', async (req: Request, res: Response) => {
  const requestingUser = req.user as Token;
  const userId = +req.params.id;
  if (!requestingUser || requestingUser.subject !== userId) {
    res.sendStatus(403);
    return;
  }

  try {
    const exerciseOfferings = await prisma.user.ownedAssignments(userId);
    res.json(exerciseOfferings);
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

users.get('/:id/assignments', async (req: Request, res: Response) => {
  const requestingUser = req.user as Token;
  const userId = +req.params.id;
  if (!requestingUser || requestingUser.subject !== userId) {
    res.sendStatus(403);
    return;
  }

  try {
    const exerciseOfferings = await prisma.exerciseOffering.assignedToUser(
      userId
    );
    res.json(exerciseOfferings);
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
    const userId = +req.params.id;
    const inviteCode = req.params.inviteCode;

    if (userId !== requestingUser.subject) {
      res
        .status(403)
        .json({ message: 'Something wrong with the authentication.' });
      return;
    }

    try {
      const exerciseOffering =
        await prisma.exerciseOffering.getOrCreateAssignment(userId, inviteCode);
      if (!exerciseOffering) {
        res.status(400).json({
          message: `There is no assignment with the invite code ${inviteCode}.`,
        });
        return;
      } else {
        res.status(200).json(exerciseOffering);
      }
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  }
);

export default users;
