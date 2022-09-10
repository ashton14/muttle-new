import express, { Request, Response } from 'express';
import { getManager, getRepository } from 'typeorm';
import { Exercise } from '../../entity/Exercise';
import { TestCase } from '../../entity/TestCase';
import { User } from '../../entity/User';

const exerciseTestCases = express.Router({ mergeParams: true });

exerciseTestCases.post('/', async (req: Request, res: Response) => {
  const entityManager = getManager();
  const { id, input, output, exerciseId, userId } = req.body;

  const exercise = entityManager.create(Exercise, { id: exerciseId });
  const user = entityManager.create(User, { id: userId });
  const newTest = { input, output, exercise, user };

  try {
    if (id) {
      const existing = await entityManager.findOne(TestCase, id);
      if (
        existing &&
        (existing.input !== input || existing.output !== output)
      ) {
        const savedNewTest = (await entityManager.save(
          TestCase,
          newTest
        )) as TestCase;

        const updated = entityManager.merge(TestCase, existing, {
          fixedId: savedNewTest.id,
        });
        await entityManager.save(TestCase, updated);
      }
    } else {
      await entityManager.save(TestCase, newTest);
    }
    res.sendStatus(200);
  } catch (err) {
    console.log(err.stack); // TODO - Implement better error handling
    res.sendStatus(500);
  }
});

// TODO - Needs to be fixed with new model for inserting (
exerciseTestCases.post('/batch', async (req: Request, res: Response) => {
  const exerciseRepo = getRepository(Exercise);
  const testCases = req.body.map(
    ({
      input,
      output,
      exerciseId,
      fixedId,
    }: TestCase & { exerciseId: number }) => ({
      input,
      output,
      fixedId,
      exercise: exerciseRepo.create({ id: exerciseId }),
    })
  );
  res.json(await getManager().save(TestCase, testCases));
});

exerciseTestCases.get('/', async (req: Request, res: Response) => {
  const {
    params: { exerciseId },
    query: { userId, actual },
  } = req;

  const testCases = await getManager().find(TestCase, {
    where: {
      exercise: { id: exerciseId },
      user: { id: userId },
    },
  });

  if (actual !== 'true') {
    testCases.forEach(test => delete test.actual);
  }

  return res.json(testCases);
});

exerciseTestCases.delete('/:id', async (req: Request, res: Response) => {
  const entityManager = getManager();
  const testCase = entityManager.create(TestCase, {
    id: parseInt(req.params.id),
    visible: false,
  });
  try {
    await entityManager.save(testCase);
    res.status(200).json(testCase);
  } catch {
    res.sendStatus(500);
  }
});

exerciseTestCases.get('/:id', async (req: Request, res: Response) =>
  res.json(await getManager().findOne(TestCase, req.params.id))
);

export default exerciseTestCases;
