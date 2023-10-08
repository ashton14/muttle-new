import React from 'react';
import dynamic from 'next/dynamic';
import Button from 'react-bootstrap/Button';
import { InlineEditorProps } from '../code/InlineEditor';

const InlineEditor = dynamic<InlineEditorProps>(() => import('../code/InlineEditor'), { ssr: false });

interface TestCaseProps {
  input: string;
  output: string;

  passed?: boolean | null;
  actual?: string | null;
  errorMessage?: string | null;

  setInput: (input: string) => void;
  setOutput: (output: string) => void;
  deleteTestCase: () => void;
}

/* eslint-disable react/display-name */
const TestCaseRow = React.forwardRef<HTMLInputElement, TestCaseProps>(
  (
    {
      input,
      output,
      passed,
      actual,
      errorMessage,
      setInput,
      setOutput,
      deleteTestCase,
    }: TestCaseProps,
    ref
  ) => {
    let results: JSX.Element;
    if (passed === true) {
      results = <Success />;
    } else if (passed === false && errorMessage) {
      results = <Error errorMessage={errorMessage} />;
    } else if (passed === false) {
      results = <Failure actual={actual} />;
    }
    const readOnly = passed || false;
    return (
      <tr>
        <td>
          <Button size="sm" variant="danger" onClick={deleteTestCase}>
            <i className="bi bi-trash" aria-label="delete" />
          </Button>
        </td>
        <td>
          <InlineEditor
            ref={ref}
            value={input}
            onChange={value => setInput(value)}
            readOnly={readOnly}
            options={{screenReaderLabel: 'test-input'}}
          />
        </td>
        <td>
          <InlineEditor
            value={output}
            onChange={value => setOutput(value)}
            readOnly={readOnly}
            options={{screenReaderLabel: 'test-output'}}
          />
        </td>
        <td>{results}</td>
      </tr>
    );
  }
);

const Success = () => (
  <div className="text-left">
    <i className="text-success bi bi-check-square-fill" aria-hidden="true" />
  </div>
);

const Failure = ({actual}: {actual?: string | null}) => (
  <div className={actual ? 'text-left' : 'text-center'}>
    <i className="text-danger bi bi-x-square-fill" aria-hidden="true" />
    {actual ? <span> Expected: {actual}</span> : null}
  </div>
);

const Error = ({errorMessage}: {errorMessage: string}) => (
  <div className="text-left">
    <i
      className="text-warning fas fa-exclamation-triangle"
      aria-hidden="true"
    />{' '}
    {errorMessage}
  </div>
);

export default TestCaseRow;
