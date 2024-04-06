import express, { Request, Response } from 'express';
import { spawn } from 'child_process';

import {
  ATTEMPTS_DIR,
  buildTestsFile,
  buildTestSnippet,
  getFunctionName,
  PYTEST_RESULTS_FILENAME,
  SNIPPET_FILENAME,
  TESTS_FILENAME,
} from '../../../utils/pythonUtils';

import { deleteIfExists } from '../../../utils/fsUtils';
import {
  getMutationData,
  MUTATION_RESULTS_FILENAME,
  runMutationAnalysis,
} from './mutation';
import { COVERAGE_RESULTS_FILENAME, getCoverageData } from './coverage';
import { prisma } from '../../../prisma';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import {
  Attempt,
  Exercise,
  ExerciseOffering,
  MutationOutcome,
  TestCase,
} from '@prisma/client';
import { saveTestCase } from '../testCases';

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

      // Save incoming test cases. After saving, the returned list
      // should only have test cases that should be run and displayed.
      const savedTestCases: TestCase[] = await Promise.all(
        testCases.map((t: TestCase) => saveTestCase(t, attempt))
      );

      // Ready to run tests.
      const functionName = getFunctionName(exercise.snippet) || '';
      if (!functionName) {
        // TODO - better error handling? Validate during creation and populate field?
        res.sendStatus(500);
      }

      const rootDir = await createWorkspace(userId, exerciseId);
      await writeFiles(rootDir, functionName, exercise.snippet, testCases);

      const allPassed = await runTests(rootDir, savedTestCases);

      const updatedTestCases = await prisma.testCase.findMany({
        where: { attemptId: attempt.id },
      });

      if (allPassed) {
        const mutatedSources = await runMutationAnalysis(rootDir);
        const mutationOutcomes = await getMutationData(rootDir);
        const coverageOutcomes = await getCoverageData(rootDir);

        // Add the mutatedLine field to the `mutations` in `mutationOutcomes`
        const mutationOutcomesWithLines = mutationOutcomes
          .map(outcome => {
            const mutant = mutatedSources.find(
              m => m.number === outcome.number
            );
            if (mutant) {
              return {
                ...outcome,
                mutatedLines: { create: mutant.addedLines },
              };
            } else {
              return {} as MutationOutcome;
            }
          })
          .filter(m => m !== null);

        const savedAttempt = await prisma.attempt.update({
          where: { id: attempt.id },
          data: {
            coverageOutcomes: { create: coverageOutcomes },
            mutationOutcomes: { create: mutationOutcomesWithLines },
          },
          include: {
            coverageOutcomes: true,
            mutationOutcomes: {
              include: {
                mutatedLines: true,
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

//TODO: Move these into fsUtils
/**
 * Function to create a workspace for the current test run and necessary subdirectories,
 * returning the workspace root.
 *
 * @param {string} userId - The id of the user associated with the run
 * @param {string} exerciseId - The id of the exercise associate with the run
 * @returns the root director of the workspace
 */
const createWorkspace = async (
  userId: number,
  exerciseId: number
): Promise<string> => {
  const rootDir = path.join(
    ATTEMPTS_DIR,
    userId.toString(),
    exerciseId.toString()
  );
  await Promise.all([
    mkdir(path.join(rootDir, 'src'), { recursive: true }),
    mkdir(path.join(rootDir, 'reports'), { recursive: true }),
  ]);

  return rootDir;
};

const writeFiles = async (
  rootDir: string,
  functionName: string,
  snippet: string,
  testCases: TestCase[]
) =>
  Promise.all([
    writeExerciseFile(path.join(rootDir, SNIPPET_FILENAME), snippet),
    writeTestFile(path.join(rootDir, TESTS_FILENAME), functionName, testCases),
  ]);

const writeExerciseFile = async (
  filename: string,
  snippet: string
): Promise<void> => {
  try {
    await writeFile(filename, snippet);
  } catch (err: any) {
    console.log(`Unable to write exercise file: ${filename}`);
    console.log(err.stack);
    throw err;
  }
};

const writeTestFile = async (
  filename: string,
  functionName: string,
  testCases: TestCase[]
): Promise<void> => {
  try {
    const testSnippets = testCases.map(({ input, output }, i) => {
      const resultAsNumber = Number(output);
      const isFloat =
        !Number.isNaN(resultAsNumber) && !Number.isSafeInteger(resultAsNumber);

      return buildTestSnippet(i, functionName, input, output, isFloat);
    });

    await writeFile(filename, buildTestsFile(functionName, testSnippets));
  } catch (err) {
    console.log(`Unable to write tests file: ${filename}`);
    throw err;
  }
};

const runTests = async (rootDir: string, testCases: TestCase[]) => {
  const python = spawn('python3.7', [
    '-m',
    'pytest',
    path.join(rootDir, TESTS_FILENAME),
    `--cov=${path.join(rootDir, 'src')}`,
    '--cov-branch',
    '--cov-report',
    `xml:${path.join(rootDir, COVERAGE_RESULTS_FILENAME)}`,
    '--json-report',
    `--json-report-file=${path.join(rootDir, PYTEST_RESULTS_FILENAME)}`,
    '--json-report-omit',
    'keywords',
    'collectors',
  ]);

  return new Promise<boolean>((resolve, reject) => {
    python.on('close', async () => {
      try {
        const { exitcode, summary, tests } = await getTestResultData(rootDir);
        if (exitcode === 0 || exitcode === 1) {
          await updateTestCases(testCases, tests);
          resolve(summary.passed === summary.total);
        } else {
          reject('Unable to run test cases.');
        }
      } catch (error: any) {
        reject(error);
      }
    });
  });
};

interface TestReport {
  exitcode: number;
  tests: TestResult[];
  summary: {
    passed: number;
    failed: number;
    total: number;
    collected: number;
  };
}

const getTestResultData = async (rootDir: string): Promise<TestReport> => {
  try {
    const resultsData = await readFile(
      path.join(rootDir, PYTEST_RESULTS_FILENAME),
      'utf-8'
    );
    return JSON.parse(resultsData);
  } catch (err) {
    console.log(`Unable to read test results file: ${PYTEST_RESULTS_FILENAME}`);
    throw err;
  }
};

enum TestOutcome {
  PASSED = 'passed',
  FAILED = 'failed',
  ERROR = 'error',
}

interface TestResult {
  outcome: string;
  call: {
    outcome: string;
    crash?: {
      message: string;
    };
    traceback?: {
      message: string;
    }[];
  };
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
