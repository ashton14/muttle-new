import React from 'react';
import Button from 'react-bootstrap/cjs/Button';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';

const GREEN_CHECK = String.fromCodePoint(0x2705);
const CROSS_MARK = String.fromCodePoint(0x274c);

interface TestCaseProps {
  key?: string;
  id?: number;
  input: string;
  setInput: (input: string) => void;
  output: string;
  setOutput: (output: string) => void;
  passed: boolean | null;
  deleteTestCase: () => void;
  errorMessage?: string | null;
}

const TestCase = ({
  input,
  setInput,
  output,
  setOutput,
  passed,
  deleteTestCase,
  errorMessage,
}: TestCaseProps) => {
  let results: string;
  if (errorMessage && !errorMessage.includes('AssertionError')) {
    results = errorMessage;
  } else {
    results = passed === null ? '' : passed ? GREEN_CHECK : CROSS_MARK;
  }

  return (
    <tr>
      <td>
        <Button size="sm" variant="danger" onClick={deleteTestCase}>
          <i className="fas fa-trash-alt" aria-hidden="true" />
        </Button>
      </td>
      <td>
        <AceEditor
          mode="python"
          theme="github"
          onChange={value => setInput(value)}
          name="input-field"
          value={input}
          width="20ch"
          height="2em"
          maxLines={Infinity}
          showGutter={false}
          fontSize={16}
          highlightActiveLine={false}
          readOnly={passed}
        />
      </td>
      <td>
        <AceEditor
          mode="python"
          theme="github"
          onChange={value => setOutput(value)}
          name="input-field"
          value={output}
          width="20ch"
          height="2em"
          maxLines={Infinity}
          showGutter={false}
          fontSize={16}
          highlightActiveLine={false}
          readOnly={passed}
        />
      </td>
      <td
        className={`${
          errorMessage ? 'error-message' : ''
        } align-middle text-center`}
      >
        {results}
      </td>
    </tr>
  );
};

export default TestCase;
