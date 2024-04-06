import express, { Request, Response } from 'express';

import {
  getMutationData,
  MUTATION_RESULTS_FILENAME,
  runMutationAnalysis,
} from '../../../utils/py/mutation';
import {
  COVERAGE_RESULTS_FILENAME,
  getCoverageData,
} from '../../../utils/py/coverage';
import { prisma } from '../../../prisma';
import {
  Attempt,
  Exercise,
  ExerciseOffering,
  MutationOutcome,
  TestCase,
} from '@prisma/client';
import { saveTestCase } from '../testCases';
import { runTests, TestResult } from '../../../utils/py/testRunner';
import { writeFiles, createWorkspace } from '../../../utils/py/testRunner';
import {
  getFunctionName,
  SNIPPET_FILENAME,
  TESTS_FILENAME,
  PYTEST_RESULTS_FILENAME,
} from '../../../utils/py/pythonUtils';
import { deleteIfExists } from '../../../utils/fsUtils';

const run = express.Router();

run.post('/:id', async (req: Request, res: Response) => {
  try {
    const {
      body: { userId, testCases, exerciseOfferingId },
    } = req;

    const exerciseId = parseInt(req.params.id as string);

    const user = await prisma.user.findUnique({ where: { id: userId } });

    // If an exerciseOffering is specified, grab that and its exercise.
    // The next two statements should only make one database call.
    const exerciseOffering =
      exerciseOfferingId &&
      (await prisma.exerciseOffering.findUnique({
        where: { id: exerciseOfferingId },
        include: { exercise: true },
      }));

    const exercise =
      exerciseOffering?.exercise ||
      (await prisma.exercise.findUnique({
        where: { id: exerciseId },
      }));

    if (user && exercise) {
      // Create a new attempt for the user on the exercise, with the new set of
      // test cases.
      let attempt: Attempt & {
        exercise: Exercise;
        exerciseOffering?: ExerciseOffering | null;
        testCases?: TestCase[];
      };
      if (exerciseOffering) {
        attempt = await prisma.attempt.create({
          data: {
            exercise: { connect: { id: exerciseId } },
            exerciseOffering: { connect: { id: exerciseOfferingId } },
            user: { connect: { id: userId } },
          },
          include: {
            exercise: true,
            exerciseOffering: true,
          },
        });
      } else {
        attempt = await prisma.attempt.create({
          data: {
            exercise: { connect: { id: exerciseId } },
            user: { connect: { id: userId } },
          },
          include: {
            exercise: true,
          },
        });
      }

      const savedTestCases = await Promise.all(
        testCases.map((t: TestCase) => saveTestCase(t, attempt))
      );

      const rootDir = await createWorkspace(userId, exerciseId);
      await writeFiles(rootDir, exercise.snippet, savedTestCases);

      const { allPassed, testResults } = await runTests(rootDir);
      await updateTestCases(testCases, testResults);

      const updatedTestCases = await prisma.testCase.findMany({
        where: { attemptId: attempt.id },
      });

      if (allPassed) {
        const mutatedSources = await runMutationAnalysis(rootDir);
        const mutationOutcomes = await getMutationData(rootDir);
        const coverageOutcomes = await getCoverageData(rootDir);

        // Add the mutatedLine field to the `mutations` in `mutationOutcomes`
        // const mutationOutcomesWithLines = mutationOutcomes
        //   .map(outcome => {
        //     const mutant = mutatedSources.find(
        //       m => m.number === outcome.number
        //     );
        //     if (mutant) {
        //       return {
        //         ...outcome,
        //         mutatedLines: { create: mutant.addedLines },
        //       };
        //     } else {
        //       return {} as MutationOutcome;
        //     }
        //   })
        //   .filter(m => m !== null);

        const savedAttempt = await prisma.attempt.update({
          where: { id: attempt.id },
          data: {
            coverageOutcomes: { create: coverageOutcomes },
            // mutationOutcomes: { create: mutationOutcomes },
          },
          include: {
            coverageOutcomes: true,
            mutationOutcomes: {
              include: {
                mutation: true,
              },
            },
            testCases: true,
          },
        });

        res.json(savedAttempt);
      } else {
        attempt.testCases = updatedTestCases;
        res.json(attempt);
      }
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    res.sendStatus(500);
  } finally {
    await deleteIfExists(SNIPPET_FILENAME);
    await deleteIfExists(TESTS_FILENAME);
    await deleteIfExists(PYTEST_RESULTS_FILENAME);
    await deleteIfExists(MUTATION_RESULTS_FILENAME);
    await deleteIfExists(COVERAGE_RESULTS_FILENAME);
  }
});

enum TestOutcome {
  PASSED = 'passed',
  FAILED = 'failed',
  ERROR = 'error',
}

const updateTestCases = async (
  testCases: TestCase[],
  testResults: TestResult[]
): Promise<void> => {
  try {
    // Using a regular for loop because forEach doesn't wait for async functions.
    for (let i = 0; i < testCases.length; i++) {
      const test = testCases[i];
      const { passed, actual, errorMessage } = parseResult(testResults[i]);

      await prisma.testCase.update({
        where: { id: test.id },
        data: {
          passed,
          actual,
          errorMessage,
        },
      });
    }
  } catch (err: any) {
    console.log('Unable to update test cases');
    console.log(err.stack);
    throw err;
  }
};

const parseResult = (result: TestResult) => {
  const outcome = getOutcome(result);

  let passed: boolean,
    actual: string | undefined,
    errorMessage: string | undefined;
  switch (outcome) {
    case TestOutcome.PASSED:
      passed = true;
      actual = result.outcome;
      break;
    case TestOutcome.FAILED:
      passed = false;
      actual = getActual(result);
      break;
    case TestOutcome.ERROR:
      passed = false;
      errorMessage = getErrorMessage(result);
      break;
  }

  return { passed, actual, errorMessage };
};

const getOutcome = (result: TestResult): TestOutcome => {
  if (isPassed(result)) {
    return TestOutcome.PASSED;
  }
  if (isFailure(result)) {
    return TestOutcome.FAILED;
  }
  return TestOutcome.ERROR;
};

const isPassed = (result: TestResult) => result.outcome === 'passed';
const isFailure = (result: TestResult) =>
  result.outcome === 'failed' &&
  result.call.traceback?.length &&
  result.call.traceback[0].message === 'AssertionError';
const getActual = (result: TestResult) =>
  result.call.crash?.message.split(' ')[1];
const getErrorMessage = (result: TestResult) => result.call.crash?.message;

export default run;
