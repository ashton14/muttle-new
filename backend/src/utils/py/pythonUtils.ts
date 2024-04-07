import { spawn } from 'child_process';
import { mkdir, mkdtemp, rmdir } from 'fs/promises';
import path, { join } from 'path';
import { Mutant, runMutationAnalysis } from './mutation';
import { writeFiles } from './testRunner';

export const ATTEMPTS_DIR = path.join('usr', 'attempts');

// filenames relative to the exercise root directory
export const SNIPPET_FILENAME = path.join('src', '__init__.py');
export const TESTS_FILENAME = 'tests.py';
export const PYTEST_RESULTS_FILENAME = path.join('reports', 'results.json');

export const PYTHON = 'python3.7';

export const getFunctionName = (snippet: string): string | null => {
  const match = snippet.match(/def (.+)\(.*\).*:/);
  return match && match[1];
};

// TODO: Use write_____Files methods to set this up
export const compileSnippetAndGenerateMutations = async (
  snippet: string
): Promise<Mutant[]> => {
  await mkdir('tmp', { recursive: true });
  const tmpPath = await mkdtemp(join('tmp', 'mut-'));
  await Promise.all([
    mkdir(join(tmpPath, 'src')),
    mkdir(join(tmpPath, 'reports')), // needed for generating mutants
  ]);
  await writeFiles(tmpPath, snippet, []);
  return new Promise((resolve, reject) => {
    try {
      const compile = spawn(PYTHON, [
        '-m',
        'py_compile',
        join(tmpPath, SNIPPET_FILENAME),
      ]);

      let errOutput = '';
      compile.stderr.on('data', chunk => {
        errOutput += chunk;
      });

      compile.on('close', async code => {
        if (code !== 0) {
          rmdir(join(tmpPath), { recursive: true });
          reject(errOutput);
        } else {
          const mutants = await runMutationAnalysis(tmpPath, false);
          rmdir(join(tmpPath), { recursive: true });
          resolve(mutants);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const buildTestSnippet = (
  index: number,
  functionName: string,
  input: string,
  output: string,
  isFloat = false
): string => {
  const expected = isFloat ? `pytest.approx(${output})` : `${output}`;
  return `def test_${index}():\n\tassert ${functionName}(${input}) == ${expected}\n`;
};

export const buildTestsFile = (functionName: string, testSnippets: string[]) =>
  `import pytest\nfrom src import ${functionName}\n\n\n${testSnippets.join(
    '\n'
  )}`;

export const buildDummyTestSnippet = (): string =>
  'def test_dummy():\n\tassert True\n';
