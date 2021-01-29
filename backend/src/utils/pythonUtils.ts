export const SNIPPET_FILENAME = 'usr/src/__init__.py';
export const TESTS_FILENAME = 'usr/tests.py';
export const PYTEST_REPORT_FILENAME = '.report.json';

export const getFunctionName = (snippet: string): string | null => {
  const match = snippet.match(/def (.+)\(.*\):/);
  return match && match[1];
};

export const buildTestSnippet = (
  index: number,
  functionName: string,
  input: string,
  output: string
): string =>
  `\tdef test_${index}(self):\n\t\tself.assertEqual(${functionName}(${input}), ${output})\n`;

export const buildTestsFile = (functionName: string, testSnippets: string[]) =>
  `import unittest\nfrom src import ${functionName}\n\nclass Test${functionName}(unittest.TestCase):\n${testSnippets.join(
    '\n'
  )}`;
