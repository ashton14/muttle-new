import express, { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { ExerciseOffering } from '../../entity/ExerciseOffering';
import { Token } from '../../utils/auth';

const users = express.Router();

users.get('/:id/exerciseOfferings', async (req: Request, res: Response) => {
  const requestingUser = req.user as Token;
  const userId = parseInt(req.params.id);
  if (!requestingUser || requestingUser.subject !== userId) {
    res.sendStatus(403);
    return;
  }

  try {
    const exerciseOfferings = await getRepository(ExerciseOffering).find({
      where: {
        owner: {
          id: userId,
        },
      },
      relations: ['exercise'],
    });

    res.json(exerciseOfferings);
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

export default users;
