import path from 'path';
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

export const buildTestSnippet = (
  index: number,
  functionName: string,
  input: string,
  output: string,
  isFloat = false
): string => {
  const assertionType = isFloat
    ? 'npt.assert_approx_equal'
    : 'self.assertEqual';
  const precision = isFloat ? ', 4' : '';
  return `\tdef test_${index}(self):\n\t\t${assertionType}(${functionName}(${input}), ${output}${precision})\n`;
};

export const buildTestsFile = (functionName: string, testSnippets: string[]) =>
  `import unittest\nimport numpy.testing as npt\nfrom src import ${functionName}\n\nclass Test${functionName}(unittest.TestCase):\n${testSnippets.join(
    '\n'
  )}`;
