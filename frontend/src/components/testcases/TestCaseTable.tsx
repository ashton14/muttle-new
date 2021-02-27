import React from 'react';
import {Table} from 'react-bootstrap';

interface TestCasesTableProps {
  children?: React.Component[];
}

const TestCaseTable = ({children}: TestCasesTableProps) => {
  return (
    <Table className=" text-left w-auto" responsive="l" size="l">
      <thead>
        <tr className=" text-center w-auto">
          <th></th>
          <th>Input</th>
          <th>Output</th>
          <th>Results</th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </Table>
  );
};

export default TestCaseTable;
