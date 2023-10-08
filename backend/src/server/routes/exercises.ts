import express, { Request, Response } from 'express';
import { prisma } from '../../prisma';
import testCases from './testCases';
import exerciseOfferings from './exerciseOfferings';
import { Token } from '../../utils/auth';
import { tryCompile } from '../../utils/pythonUtils';

const exercises = express.Router();
exercises.use('/:exerciseId/testCases', testCases);
exercises.use('/:exerciseId/offerings', exerciseOfferings);

exercises.get('/', async (req: Request, res: Response) => {
  const exercises = await prisma.exercise.findMany();
  res.json(exercises);
});

exercises.get('/:id', async (req: Request, res: Response) =>
  res.json(
    await prisma.exercise.findUnique({
      where: { id: +req.params.id },
    })
  )
);

// What about exercise versions?
exercises.put('/:id', async (req: Request, res: Response) => {
  const exercise = await prisma.exercise.findUnique({
    where: {
      id: +req.params.id,
    },
    include: { owner: true },
  });
  const requestingUser = req.user as Token;
  if (exercise?.owner?.email !== requestingUser.email) {
    res.status(403).json({ message: 'Unauthorised to update that exercise.' });
  } else {
    const { name, description, snippet, mutations } = req.body;
    try {
      const updatedExercise = {
        name,
        description,
        snippet,
        mutations,
      };
      await prisma.exercise.update({
        where: { id: +req.params.id },
        data: updatedExercise,
      });
      res.status(200).json({ exercise });
    } catch (err) {
      res.status(400).json({ error: err });
    }
  }
});

exercises.put('/:id/mutations', async (req: Request, res: Response) => {
  const exercise = await prisma.exercise.findUnique({
    where: {
      id: +req.params.id,
    },
    include: { owner: true },
  });
  const requestingUser = req.user as Token;
  if (exercise?.owner?.email !== requestingUser.email) {
    res.status(403).json({ message: 'Unauthorised to update that exercise.' });
  } else {
    // TODO: Generate all mutations and send them to the client.
    res.status(501).json({ message: 'This endpoint is not yet implemented.' });
  }
});

// Create an exercise if the code snippet compiles.
exercises.post('/', async (req: Request, res: Response) => {
  const { snippet } = req.body;
  try {
    const error = await tryCompile(snippet);
    if (error.length) {
      res.status(400).json({ errorMessage: error });
    } else {
      const exercise = await prisma.exercise.create(req.body);
      res.json(exercise);
    }
  } catch (err) {
    res.status(500).json({ errorMessage: 'An error occurred.' });
  }
});

exercises.get('/:id/attempts/latest', async (req: Request, res: Response) => {
  const user = req.user as Token;
  if (!user) {
    res.sendStatus(403);
    return;
  }

  const attempt = await prisma.attempt.findFirst({
    where: {
      exercise: { id: +req.params.id },
      exerciseOffering: null,
      user: { id: user.subject },
    },
    include: {
      testCases: true,
      coverageOutcomes: true,
      mutationOutcomes: {
        include: { mutatedLines: true },
      },
    },
    orderBy: { id: 'desc' },
  });

  if (attempt) {
    attempt.testCases = attempt?.testCases.filter(t => !t.fixedId);
  }
  res.json(attempt);
});

export default exercises;
