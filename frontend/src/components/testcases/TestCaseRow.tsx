import React from 'react';
import Button from 'react-bootstrap/Button';
import AceEditor from 'react-ace';

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
    let results;
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
            <i className="fas fa-trash-alt" aria-label="delete" />
          </Button>
        </td>
        <td>
          <AceEditor
            aria-label="test-input"
            ref={ref}
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
            readOnly={readOnly}
          />
        </td>
        <td>
          <AceEditor
            aria-label="test-output"
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
            readOnly={readOnly}
          />
        </td>
        <td>{results}</td>
      </tr>
    );
  }
);

const Success = () => (
  <div className="text-center">
    <i className="text-success fas fa-check-square" aria-hidden="true" />
  </div>
);

const Failure = ({actual}: {actual?: string | null}) => (
  <div className={actual ? 'text-left' : 'text-center'}>
    <i className="text-danger fas fa-ban" aria-hidden="true" />
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
