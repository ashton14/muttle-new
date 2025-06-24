/*
 * Utilities for running tests on Python code snippets
 */
import { spawn } from 'child_process';
import { mkdir, writeFile, readFile } from 'fs/promises';
import path from 'path';
import { TestCase } from '@prisma/client';
import {
  ATTEMPTS_DIR,
  SNIPPET_FILENAME,
  TESTS_FILENAME,
  PYTEST_RESULTS_FILENAME,
  buildTestsFile,
  buildTestSnippet,
  getFunctionName,
  buildDummyTestSnippet,
  PYTHON,
} from './pythonUtils';
import { COVERAGE_RESULTS_FILENAME } from './coverage';

import { deleteIfExists } from '../fsUtils';

/**
 * Function to create a workspace for the current test run and necessary subdirectories,
 * returning the workspace root.
 *
 * @param {string} userId - The id of the user associated with the run
 * @param {string} exerciseId - The id of the exercise associate with the run
 * @returns the root director of the workspace
 */
export const createWorkspace = async (
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

export const writeFiles = async (
  rootDir: string,
  snippet: string,
  testCases: Pick<TestCase, 'input' | 'output'>[]
) => {
  const functionName = getFunctionName(snippet);
  if (functionName !== null) {
    return Promise.all([
      writeExerciseFile(path.join(rootDir, SNIPPET_FILENAME), snippet),
      writeTestFile(
        path.join(rootDir, TESTS_FILENAME),
        functionName,
        testCases
      ),
    ]);
  } else {
    return Promise.reject('Snippet must be a python function');
  }
};

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
  testCases: Pick<TestCase, 'input' | 'output'>[]
): Promise<void> => {
  try {
    const testSnippets = testCases.map(({ input, output }, i) => {
      const resultAsNumber = Number(output);
      const isFloat =
        !Number.isNaN(resultAsNumber) && !Number.isSafeInteger(resultAsNumber);

      return buildTestSnippet(i, functionName, input, output, isFloat);
    }) || [buildDummyTestSnippet()];

    await writeFile(filename, buildTestsFile(functionName, testSnippets));
  } catch (err) {
    console.log(`Unable to write tests file: ${filename}`);
    throw err;
  }
};

export const runTests = async (rootDir: string) => {
  const python = spawn(PYTHON, [
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

  return new Promise<{
    allPassed: boolean;
    testResults: TestResult[];
  }>((resolve, reject) => {
    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log('pytest stdout:', data.toString());
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
      console.log('pytest stderr:', data.toString());
    });

    python.on('close', async (code) => {
      console.log(`pytest exited with code: ${code}`);
      console.log('pytest stdout:', stdout);
      console.log('pytest stderr:', stderr);
      
      try {
        const {
          exitcode,
          summary,
          tests: testResults,
        } = await getTestResultData(rootDir);
        if (exitcode === 0 || exitcode === 1) {
          resolve({
            allPassed: summary.passed === summary.total,
            testResults,
          });
        } else {
          reject(`Unable to run test cases. Exit code: ${exitcode}`);
        }
      } catch (error: any) {
        reject(`Error reading test results: ${error.message}`);
      }
    });

    python.on('error', (error) => {
      console.log('pytest spawn error:', error);
      reject(`Failed to spawn pytest: ${error.message}`);
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

export interface TestResult {
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
