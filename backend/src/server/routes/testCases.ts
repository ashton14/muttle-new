import express, { Request, Response } from 'express';
import { getManager } from 'typeorm';
import { Exercise } from '../../entity/Exercise';
import { TestCase } from '../../entity/TestCase';
import { User } from '../../entity/User';

const exerciseTestCases = express.Router({ mergeParams: true });

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

/**
 * Saves the specified TestCase for the Exercise with the given id and the User
 * with the given id.
 *
 * If the specified {@link TestCase} already existed (i.e., if it has an id),
 * a new test case is created, and the existing {@link TestCase}'s fixedId
 * points to the new {@link TestCase}.
 *
 * @param testCase The {@link TestCase} to save
 * @param exerciseId The id for the Exercise
 * @param userId The id for the User
 * @returns The saved test case
 */
export async function saveTestCase(
  testCase: TestCase,
  exerciseId: number,
  userId: number
): Promise<TestCase> {
  const { id, input, output } = testCase;
  const entityManager = getManager();
  const exercise = entityManager.create(Exercise, { id: exerciseId });
  const user = entityManager.create(User, { id: userId });
  const newTest = { input, output, exercise, user };

  const existing = id && (await entityManager.findOne(TestCase, id));
  if (existing && (existing.input !== input || existing.output !== output)) {
    const savedNewTest = (await entityManager.save(
      TestCase,
      newTest
    )) as TestCase;

    const updated = entityManager.merge(TestCase, existing, {
      fixedId: savedNewTest.id,
    });
    await entityManager.save(TestCase, updated);
    return Promise.resolve(savedNewTest as TestCase);
  } else {
    return entityManager.save(TestCase, newTest) as Promise<TestCase>;
  }
}

export default exerciseTestCases;
