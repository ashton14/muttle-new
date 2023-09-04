import express, { Request, Response } from 'express';
import { getRepository, IsNull } from 'typeorm';
import { Exercise } from '../../entity/Exercise';
import { Attempt } from '../../entity/Attempt';
import testCases from './testCases';
import exerciseOfferings from './exerciseOfferings';
import { Token } from '../../utils/auth';
import { writeFile, mkdtemp, stat, mkdir, access, rmdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { spawn } from 'child_process';
import { SNIPPET_FILENAME } from '../../utils/pythonUtils';

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

exercises.post('/', async (req: Request, res: Response) => {
  // Check if the snippet is valid Python code.
  const { snippet } = req.body;
  try {
    await mkdir('tmp', { recursive: true });
    const tmpPath = await mkdtemp(join('tmp', 'mut-'));
    await mkdir(join(tmpPath, 'src'));
    await writeFile(join(tmpPath, SNIPPET_FILENAME), snippet);
    const compile = spawn('python3.7', [
      '-m',
      'py_compile',
      join(tmpPath, SNIPPET_FILENAME),
    ]);

    let errOutput = '';
    compile.stderr.on('data', chunk => {
      errOutput += chunk;
    });

    compile.on('close', async code => {
      rmdir(join(tmpPath), { recursive: true });
      if (code === 1) {
        res.status(400).json({ errorMessage: errOutput });
      } else {
        res.json(await getRepository(Exercise).save(req.body));
      }
    });
  } catch (err) {
    res.status(500).json({ errorMessage: 'An error occurred.' });
    console.error(err);
  }
});

exercises.get('/:id/attempts/latest', async (req: Request, res: Response) => {
  const user = req.user as Token;
  if (!user) {
    res.sendStatus(403);
    return;
  }

  const attempt = await getRepository(Attempt).findOne({
    where: {
      exercise: { id: req.params.id },
      exerciseOffering: IsNull(),
      user: { id: user.subject },
    },
    relations: ['testCases'],
    order: {
      created: 'DESC',
    },
  });
  if (attempt) {
    attempt.testCases = attempt?.testCases.filter(t => !t.fixedId);
  }
  res.json(attempt);
});

export default exercises;
