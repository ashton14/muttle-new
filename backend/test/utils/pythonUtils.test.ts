import {buildTestSnippet, getFunctionName} from '../../src/utils/pythonUtils';
import {
  TEST_NUMERIC_INPUT_OUTPUT,
  TEST_STRING_INPUT_OUTPUT,
} from '../test-data/pythonTestData';

describe('Python utils', () => {
  describe('getFunctionName', () => {
    const TEST_BODY = '\n\tandallthecodethatfollows';

    it('extracts well-formed function name', () => {
      const snippet = `def my_function():${TEST_BODY}`;
      const expected = 'my_function';
      expect(getFunctionName(snippet)).toEqual(expected);
    });

    it('extracts well-formed function name w/ parameters', () => {
      const snippet = `def my_function(param1, param2):${TEST_BODY}`;
      const expected = 'my_function';
      expect(getFunctionName(snippet)).toEqual(expected);
    });

    it('returns null for function missing parentheses', () => {
      const snippet = `def my_function_without_parentheses:${TEST_BODY}`;
      expect(getFunctionName(snippet)).toBeNull();
    });

    it('returns null for function  missing "def"', () => {
      const snippet = `my_function_without_def():${TEST_BODY}`;
      expect(getFunctionName(snippet)).toBeNull();
    });

    it('returns null for function  missing colon"', () => {
      const snippet = `def my_function_without_colon()${TEST_BODY}`;
      expect(getFunctionName(snippet)).toBeNull();
    });
  });

  describe('buildTestSnippet', () => {
    it('builds snippet from normal numeric input/output', () => {
      const {
        index,
        functionName,
        input,
        output,
        expected,
      } = TEST_NUMERIC_INPUT_OUTPUT;
      expect(buildTestSnippet(index, functionName, input, output)).toEqual(
        expected
      );
    });

    it('builds snippet from normal string input/output', () => {
      const {
        index,
        functionName,
        input,
        output,
        expected,
      } = TEST_STRING_INPUT_OUTPUT;
      expect(buildTestSnippet(index, functionName, input, output)).toEqual(
        expected
      );
    });
  });

  describe('build test file', () => {
    // TODO - write unit tests for buildTestFile
  });
});
