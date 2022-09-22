import {Button, Spinner} from 'react-bootstrap';
import Row from 'react-bootstrap/Row';
import React from 'react';
import {SavedTestCase} from '../../lib/api';

interface ExerciseFooterProps {
  disabled: boolean;
  running: boolean;
  runTests(): void;
}

const ExerciseFooter = ({
  disabled,
  running,
  runTests,
}: ExerciseFooterProps) => (
  <Row className="mt-2 d-flex justify-content-center">
    <Button onClick={() => runTests()} disabled={disabled}>
      {running ? (
        <Spinner animation="border" size="sm" />
      ) : (
        <i className="fas fa-rocket" aria-hidden="true" />
      )}{' '}
      Launch!
    </Button>
  </Row>
);

export default ExerciseFooter;
