import React, {useEffect, useRef} from 'react';
import {Col, Table} from 'react-bootstrap';
import TestCaseRow from './TestCaseRow';
import {NewTestCase, SavedTestCase} from '../../lib/api';
import TestCaseTableHeader from './TestCaseTableHeader';
import NewTestRow from './NewTestRow';
import {Controlled as CodeMirror} from 'react-codemirror2';
import codemirror from 'codemirror';

interface TestCasesTableProps {
  savedTests: SavedTestCase[];
  editSavedTest(field: string, index: number): (value: string) => void;
  deleteSavedTest(index: number): () => void;
  newTests: NewTestCase[];
  createNewTest(): void;
  editNewTest(key: string, index: number): (value: string) => void;
  deleteNewTest(index: number): () => void;
  running: boolean;
}

const TestCaseTable = ({
  savedTests,
  editSavedTest,
  deleteSavedTest,
  newTests,
  createNewTest,
  editNewTest,
  deleteNewTest,
  running,
}: TestCasesTableProps) => {
  const codeMirrorRef = useRef<CodeMirror & {editor: codemirror.Editor}>(null);

  useEffect(() => {
    const {current} = codeMirrorRef;
    current && current.editor.focus();
  }, [newTests.length]);

  const savedTestRows = savedTests.map((test, i) => (
    <TestCaseRow
      {...test}
      key={`test-${i}`}
      setInput={editSavedTest('input', i)}
      setOutput={editSavedTest('output', i)}
      deleteTestCase={deleteSavedTest(i)}
    />
  ));

  const newTestRows = newTests.map((test, i) => (
    <TestCaseRow
      {...test}
      ref={i === newTests.length - 1 ? codeMirrorRef : undefined}
      key={`newTest-${i}`}
      setInput={editNewTest('input', i)}
      setOutput={editNewTest('output', i)}
      deleteTestCase={deleteNewTest(i)}
    />
  ));

  return (
    <Col className="d-flex flex-column">
      <div className="h5">Test Cases</div>
      <Table className="text-left" responsive="sm" size="sm">
        <TestCaseTableHeader />
        <tbody>
          {savedTestRows}
          {newTestRows}
          <NewTestRow disabled={running} createNewTest={createNewTest} />
        </tbody>
      </Table>
    </Col>
  );
};

export default TestCaseTable;
