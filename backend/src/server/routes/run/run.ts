import express, {Request, Response} from 'express';
import {getManager, getRepository} from 'typeorm';
import {Exercise} from '../../../entity/Exercise';
import {spawn} from 'child_process';

import {
  ATTEMPTS_DIR,
  buildTestsFile,
  buildTestSnippet,
  getFunctionName,
  PYTEST_RESULTS_FILENAME,
  SNIPPET_FILENAME,
  TESTS_FILENAME,
} from '../../../utils/pythonUtils';

import {TestCase} from '../../../entity/TestCase';
import {deleteIfExists} from '../../../utils/fsUtils';
import {
  getMutationData,
  MUTATION_RESULTS_FILENAME,
  runMutationAnalysis,
} from './mutation';
import {COVERAGE_RESULTS_FILENAME, getCoverageData} from './coverage';
import _ from 'lodash';
import {User} from '../../../entity/User';
import {mkdir, readFile, writeFile} from 'fs/promises';
import path from 'path';

const run = express.Router();

run.post('/:id', async (req: Request, res: Response) => {
  try {
    const {
      body: {userId},
      params: {id: exerciseId},
    } = req;

    const entityManager = getManager();
    const user = entityManager.create(User, {id: userId});

    const exercise = await entityManager
      .createQueryBuilder(Exercise, 'exercise')
      .where('exercise.id = :exerciseId', {exerciseId})
      .leftJoinAndSelect(
        'exercise.testCases',
        'testCase',
        'testCase.userId = :userId',
        {userId}
      )
      .getOne();

    if (exercise) {
      // Only run failing tests that have not yet been fixed
      const testCases = exercise.testCases.filter(
        test => test.visible && !test.fixedId
      );

      const functionName = getFunctionName(exercise.snippet) || '';
      if (!functionName) {
        // TODO - better error handling? Validate during creation and populate field?
        res.sendStatus(500);
      }

      const rootDir = await createWorkspace(userId, exerciseId);
      await writeFiles(rootDir, functionName, exercise.snippet, testCases);

      const allPassed = await runTests(rootDir, testCases);

      if (allPassed) {
        await runMutationAnalysis(rootDir);

        const [coverageOutcomes, mutants] = await Promise.all([
          getCoverageData(rootDir, user, exercise),
          getMutationData(rootDir),
        ]);

        res.json({coverageOutcomes, mutants});
      } else {
        res.json({});
      }
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  } finally {
    // console.log('Deleting files...');
    // await deleteIfExists(SNIPPET_FILENAME);
    // await deleteIfExists(TESTS_FILENAME);
    // await deleteIfExists(PYTEST_RESULTS_FILENAME);
    // await deleteIfExists(MUTATION_RESULTS_FILENAME);
    // await deleteIfExists(COVERAGE_RESULTS_FILENAME);
    // console.log('Files deleted.');
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
  exerciseId: string
): Promise<string> => {
  const rootDir = path.join(ATTEMPTS_DIR, userId.toString(), exerciseId);
  await Promise.all([
    mkdir(path.join(rootDir, 'src'), {recursive: true}),
    mkdir(path.join(rootDir, 'reports'), {recursive: true}),
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
    const testSnippets = testCases.map(({input, output}, i) => {
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
    const python = spawn('pytest', [
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

    python.on('close', async () => {
      try {
        const testResults = await getTestResultData(rootDir);
        await updateTestCases(testCases, testResults);
        resolve(_.every(testResults, isPassed));
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

interface TestResult {
  outcome: string;
  call: {
    outcome: string;
    crash?: {
      message: string;
    };
  };
}

const getTestResultData = async (rootDir: string): Promise<TestResult[]> => {
  try {
    const resultsData = await readFile(
      path.join(rootDir, PYTEST_RESULTS_FILENAME),
      'utf-8'
    );
    return JSON.parse(resultsData).tests;
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
      const {passed, actual, errorMessage} = parseResult(testResults[i]);

      return testRepo.merge(test, {
        passed,
        actual,
        errorMessage,
      });
    });

    await testRepo.save(updatedTestCases);
  } catch (err) {
    console.log('Unable to update test cases');
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

  return {passed, actual, errorMessage};
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
