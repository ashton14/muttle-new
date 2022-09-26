import express, { Request, Response } from 'express';
import { getManager, getRepository } from 'typeorm';
import { Exercise } from '../../../entity/Exercise';
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

import { TestCase } from '../../../entity/TestCase';
import { deleteIfExists } from '../../../utils/fsUtils';
import {
  getMutationData,
  MUTATION_RESULTS_FILENAME,
  runMutationAnalysis,
} from './mutation';
import { COVERAGE_RESULTS_FILENAME, getCoverageData } from './coverage';
import { User } from '../../../entity/User';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { Attempt } from '../../../entity/Attempt';
import { saveTestCase } from '../testCases';
import { ExerciseOffering } from '../../../entity/ExerciseOffering';

const run = express.Router();

run.post('/:id', async (req: Request, res: Response) => {
  try {
    const {
      body: { userId, testCases, exerciseOfferingId },
    } = req;

    const exerciseId = parseInt(req.params.id as string);

    const entityManager = getManager();
    const user = entityManager.create(User, { id: userId });

    // If an exerciseOffering is specified, grab that and its exercise.
    // The next two statements should only make one database call.
    const exerciseOffering =
      exerciseOfferingId &&
      (await entityManager.findOne(ExerciseOffering, {
        where: {
          id: exerciseOfferingId,
        },
        relations: ['exercise'],
      }));

    const exercise =
      exerciseOffering?.exercise ||
      (await entityManager.findOne(Exercise, {
        where: { id: exerciseId },
      }));

    if (user && exercise) {
      // Save incoming test cases. After saving, the returned list
      // should only have test cases that should be run and displayed.
      const savedTestCases: TestCase[] = await Promise.all(
        testCases.map((t: TestCase) => saveTestCase(t, exerciseId, userId))
      );

      // Create a new attempt for the user on the exercise, with the new set of
      // test cases.
      const attempt = entityManager.create(Attempt, {
        user,
        exercise,
        exerciseOffering,
        testCases: savedTestCases,
      });

      // Ready to run tests.
      const functionName = getFunctionName(exercise.snippet) || '';
      if (!functionName) {
        // TODO - better error handling? Validate during creation and populate field?
        res.sendStatus(500);
      }

      const rootDir = await createWorkspace(userId, exerciseId);
      await writeFiles(rootDir, functionName, exercise.snippet, testCases);

      const allPassed = await runTests(rootDir, savedTestCases);

      if (allPassed) {
        const mutatedSources = await runMutationAnalysis(rootDir);
        const [coverageOutcomes, mutationOutcomes] = await Promise.all([
          getCoverageData(rootDir),
          getMutationData(rootDir),
        ]);

        // Add the mutatedLine field to the `mutations` in `mutationOutcomes
        mutationOutcomes.forEach(outcome => {
          const mutant = mutatedSources.find(m => m.number === outcome.number);
          // TODO What to do if this is false? Can that happen?
          if (mutant) {
            outcome.mutatedLines = mutant.addedLines;
            outcome.operator = mutant.operator;
          }
        });

        const savedAttempt = await entityManager.save(
          Attempt,
          entityManager.merge(Attempt, attempt, {
            coverageOutcomes,
            mutationOutcomes,
          })
        );

        res.json({ ...savedAttempt });
      } else {
        const savedAttempt = entityManager.merge(Attempt, attempt, {
          testCases: savedTestCases,
        });
        res.json({ ...savedAttempt });
      }
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  } finally {
    await deleteIfExists(SNIPPET_FILENAME);
    await deleteIfExists(TESTS_FILENAME);
    await deleteIfExists(PYTEST_RESULTS_FILENAME);
    await deleteIfExists(MUTATION_RESULTS_FILENAME);
    await deleteIfExists(COVERAGE_RESULTS_FILENAME);
  }
});

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
  } catch (err) {
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

const runTests = (rootDir: string, testCases: TestCase[]) => {
  return new Promise<boolean>((resolve, reject) => {
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

    python.stderr.on('data', chunk => console.log(chunk.toString()));
    python.stdout.on('data', chunk => console.log(chunk.toString()));

    python.on('close', async () => {
      try {
        const { exitcode, summary, tests } = await getTestResultData(rootDir);
        if (exitcode === 0 || exitcode === 1) {
          await updateTestCases(testCases, tests);
          resolve(summary.passed === summary.total);
        } else {
          reject('Unable to run test cases');
        }
      } catch (err) {
        reject(err);
      }
    });

    python.on('error', (err: Error) => {
      console.log(err);
      reject(err);
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

interface TestResult {
  outcome: string;
  call: {
    outcome: string;
    crash?: {
      message: string;
    };
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

const updateTestCases = async (
  testCases: TestCase[],
  testResults: TestResult[]
) => {
  try {
    const testRepo = getRepository(TestCase);
    const updatedTestCases = testCases.map((test, i) => {
      const { passed, actual, errorMessage } = parseResult(testResults[i]);

      return testRepo.merge(test, {
        passed,
        actual,
        errorMessage,
      });
    });

    await testRepo.save(updatedTestCases);
  } catch (err) {
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
  result.call.crash?.message.startsWith('AssertionError');
const getActual = (result: TestResult) =>
  result.call.crash?.message.split(' ')[1];
const getErrorMessage = (result: TestResult) => result.call.crash?.message;

export default run;
