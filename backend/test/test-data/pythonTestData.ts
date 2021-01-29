const TEST_FUNCTION = 'test_function';

const NUMERIC_INPUT_OUTPUT_EXPECTED = `\tdef test_0(self):
\t\tself.assertEqual(test_function(123), 456)
`;

export const TEST_NUMERIC_INPUT_OUTPUT = {
  index: 0,
  functionName: TEST_FUNCTION,
  input: '123',
  output: '456',
  expected: NUMERIC_INPUT_OUTPUT_EXPECTED,
};

const STRING_INPUT_OUTPUT_EXPECTED = `\tdef test_2319(self):
\t\tself.assertEqual(test_function("an input string"), "an output string")
`;

export const TEST_STRING_INPUT_OUTPUT = {
  index: 2319,
  functionName: TEST_FUNCTION,
  input: '"an input string"',
  output: '"an output string"',
  expected: STRING_INPUT_OUTPUT_EXPECTED,
};
