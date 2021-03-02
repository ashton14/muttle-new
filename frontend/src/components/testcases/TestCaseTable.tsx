import React, {useEffect, useRef} from 'react';
import {Col, Table} from 'react-bootstrap';
import TestCaseRow from './TestCaseRow';
import {NewTestCase, SavedTestCase} from '../../lib/api';
import TestCaseTableHeader from './TestCaseTableHeader';
import NewTestRow from './NewTestRow';
import ReactAce from 'react-ace';

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
  const reactAceRef = useRef<ReactAce>(null);

  useEffect(() => {
    const {current} = reactAceRef;
    current && current.refEditor.focus();
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
      ref={i === newTests.length - 1 ? reactAceRef : undefined}
      key={`newTest-${i}`}
      setInput={editNewTest('input', i)}
      setOutput={editNewTest('output', i)}
      deleteTestCase={deleteNewTest(i)}
    />
  ));

  return (
    <Col className="d-flex flex-column border-right">
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
