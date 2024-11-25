import React from 'react';
import Table from 'react-bootstrap/Table';

interface Score {
  student: string;
  tests: number;
  codeCoverage: string; // e.g., "85%"
  mutationCoverage: string; // e.g., "90%"
  date: string;
}

interface ScoresTableProps {
  scores: Score[];
}

const ScoresTable: React.FC<ScoresTableProps> = ({ scores }) => {
  return (
      <Table striped bordered hover>
      <thead>
        <tr>
          <th>Student</th>
          <th>Number of Tests</th>
          <th>Code Coverage</th>
          <th>Mutation Coverage</th>
          <th>Latest Attempt</th>
        </tr>
      </thead>
      <tbody>
        {scores.map((score, index) => (
          <tr key={index}>
            <td>{score.student}</td>
            <td>{score.tests}</td>
            <td>{score.codeCoverage}</td>
            <td>{score.mutationCoverage}</td>
            <td>{score.date}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default ScoresTable;
