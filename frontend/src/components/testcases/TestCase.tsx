import React from 'react';
import Button from 'react-bootstrap/cjs/Button';
import Form from 'react-bootstrap/Form';

const GREEN_CHECK = String.fromCodePoint(0x2705);
const CROSS_MARK = String.fromCodePoint(0x274c);

interface TestCaseProps {
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
  if (errorMessage) {
    results = errorMessage;
  } else {
    results = passed ? GREEN_CHECK : CROSS_MARK;
  }

  return (
    <tr>
      <td>
        <Button size="sm" variant="danger" onClick={deleteTestCase}>
          <i className="fas fa-trash-alt" aria-hidden="true" />
        </Button>
      </td>
      <td>
        <Form.Control
          size="sm"
          value={input}
          onChange={event => setInput(event.target.value)}
          readOnly={passed}
        />
      </td>
      <td>
        <Form.Control
          size="sm"
          value={output}
          onChange={event => setOutput(event.target.value)}
          readOnly={passed}
        />
      </td>
      <td className={`${errorMessage ? 'error-message' : ''} text-center`}>
        {results}
      </td>
    </tr>
  );
};

export default TestCase;
