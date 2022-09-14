import express, { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Exercise } from '../../entity/Exercise';
import { Attempt } from '../../entity/Attempt';
import testCases from './testCases';
import exerciseOfferings from './exerciseOfferings';
import { Token } from '../../utils/auth';

const exercises = express.Router();
exercises.use('/:exerciseId/testCases', testCases);
exercises.use('/:exerciseId/offerings', exerciseOfferings);

exercises.get('/', async (req: Request, res: Response) =>
  res.json(await getRepository(Exercise).find())
);

exercises.get('/:id', async (req: Request, res: Response) =>
  res.json(await getRepository(Exercise).findOne(req.params.id))
);

// What about exercise versions?
exercises.put('/:id', async (req: Request, res: Response) => {
  const exerciseRepo = getRepository(Exercise);
  const exercise = await exerciseRepo.findOne({
    where: {
      id: req.params.id,
    },
    relations: ['owner'],
  });
  const requestingUser = req.user as Token;
  if (exercise?.owner?.email !== requestingUser.email) {
    res.status(403).json({ message: 'Unauthorised to update that exercise.' });
  } else {
    const { name, description, snippet } = req.body;
    try {
      const updatedExercise = { ...exercise, name, description, snippet };
      exerciseRepo.save(updatedExercise);
      res.status(200).json({ ...updatedExercise });
    } catch (err) {
      res.status(400).json({ error: err });
    }
  }
});

exercises.post('/', async (req: Request, res: Response) =>
  res.json(await getRepository(Exercise).save(req.body))
);

exercises.get('/:id/attempts/latest', async (req: Request, res: Response) =>
  res.json(
    await getRepository(Attempt).findOne({
      where: {
        exercise: { id: req.params.id },
        user: { id: req.query.userId },
      },
      order: {
        id: 'DESC',
      },
    })
  )
);

export default exercises;
