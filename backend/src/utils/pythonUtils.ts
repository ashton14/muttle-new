import { spawn } from 'child_process';
import { mkdir, mkdtemp, rmdir, writeFile } from 'fs/promises';
import path, { join } from 'path';
// TODO - check filename locations and usages
export const ATTEMPTS_DIR = path.join('usr', 'attempts');

// filenames relative to the run directory
export const SNIPPET_FILENAME = path.join('src', '__init__.py');
export const TESTS_FILENAME = 'tests.py';
export const PYTEST_RESULTS_FILENAME = path.join('reports', 'results.json');

export const getFunctionName = (snippet: string): string | null => {
  const match = snippet.match(/def (.+)\(.*\).*:/);
  return match && match[1];
};

export const tryCompile = async (snippet: string): Promise<string> => {
  await mkdir('tmp', { recursive: true });
  const tmpPath = await mkdtemp(join('tmp', 'mut-'));
  await mkdir(join(tmpPath, 'src'));
  await writeFile(join(tmpPath, SNIPPET_FILENAME), snippet);
  return new Promise((resolve, reject) => {
    try {
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
        if (code !== 0) {
          resolve(errOutput);
        } else {
          resolve('');
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
