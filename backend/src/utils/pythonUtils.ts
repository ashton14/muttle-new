export const ATTEMPTS_DIR = 'usr/attempts';
export const SNIPPET_FILENAME = 'src/__init__.py';
export const TESTS_FILENAME = 'tests.py';
export const PYTEST_REPORT_FILENAME = '.report.json';

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
