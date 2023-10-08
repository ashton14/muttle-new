import express, { Request, Response } from 'express';
import { prisma } from '../../prisma';
import { Attempt, Exercise, ExerciseOffering, TestCase } from '@prisma/client';

const exerciseTestCases = express.Router({ mergeParams: true });

exerciseTestCases.get('/', async (req: Request, res: Response) => {
  const {
    params: { exerciseId },
    query: { userId, actual }, // TODO: Not really using "actual"
  } = req;

  const testCases = await prisma.testCase.findMany({
    where: {
      exerciseId: parseInt(exerciseId as string),
      userId: parseInt(userId as string),
    },
  });

  return res.json(testCases);
});

// Mark the given test case as invisible
exerciseTestCases.delete('/:id', async (req: Request, res: Response) => {
  const testCase = await prisma.testCase.update({
    where: {
      id: parseInt(req.params.id),
    },
    data: {
      visible: false,
    },
  });
  try {
    res.status(200).json(testCase);
  } catch {
    res.sendStatus(500);
  }
});

exerciseTestCases.get('/:id', async (req: Request, res: Response) =>
  res.json(
    await prisma.testCase.findUnique({ where: { id: parseInt(req.params.id) } })
  )
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
 * @param attempt The {@link Attempt} for which the {@link TestCase} is being saved
 * @returns The saved test case
 */
export async function saveTestCase(
  testCase: TestCase,
  attempt: Attempt & {
    exercise?: Exercise | null;
    exerciseOffering?: ExerciseOffering | null;
  }
): Promise<TestCase> {
  const { id, input, output } = testCase;

  const existing =
    id &&
    (await prisma.testCase.findUnique({
      where: { id },
      include: { attempt: true },
    }));
  if (existing && (existing.input !== input || existing.output !== output)) {
    // An existing test case is being modified.
    const savedNewTest = prisma.testCase.create({
      data: {
        input,
        output,
        exercise: {
          connect: {
            id: attempt.exerciseId || attempt.exerciseOffering?.exerciseId,
          },
        },
        user: { connect: { id: attempt.userId } },
        attempt: { connect: { id: existing.attempt.id } },
        fixedFrom: { connect: { id: existing.id } },
      },
    });
    return savedNewTest;
  } else if (existing) {
    // The test case wasn't changed. Update it to point to the latest attempt.
    return prisma.testCase.update({
      where: { id: existing.id },
      data: { attempt: { connect: { id: attempt.id } } },
    });
  } else {
    // A new test case is being created.
    return prisma.testCase.create({
      data: {
        input,
        output,
        exercise: {
          connect: {
            id: attempt.exerciseId || attempt.exerciseOffering?.exerciseId,
          },
        },
        user: { connect: { id: attempt.userId } },
        attempt: { connect: { id: attempt.id } },
      },
    });
  }
}

export default exerciseTestCases;
