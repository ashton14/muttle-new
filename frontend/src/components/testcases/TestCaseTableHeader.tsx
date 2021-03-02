import React from 'react';

const TestCaseTableHeader = () => (
  <thead>
    <tr>
      <th />
      <th>Input</th>
      <th>Output</th>
      <th className="text-center">Results</th>
    </tr>
  </thead>
);

export default React.memo(TestCaseTableHeader);
