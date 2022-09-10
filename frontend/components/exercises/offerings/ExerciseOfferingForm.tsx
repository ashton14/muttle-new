import React from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';
import MutationOperatorChoice from './MutationOperatorChoice';

interface OfferingFormProps {
  exerciseId?: number,
  exerciseName?: string,
  withConditionCoverage?: boolean,
  setWithConditionCoverage: Function,
  withMutationCoverage?: boolean,
  setWithMutationCoverage: Function,
  mutationOperators?: string[],
  setMutationOperators: Function,
  minTests?: number,
  setMinTests: Function
}

export default function ExerciseOfferingForm({
  exerciseId,
  exerciseName,
  withConditionCoverage,
  setWithConditionCoverage,
  withMutationCoverage,
  setWithMutationCoverage,
  mutationOperators,
  setMutationOperators,
  minTests,
  setMinTests
}: OfferingFormProps) {
  return (
    <>
      <Container>
        <Form>
          <Form.Group>
            <h5>Choose feedback types</h5>
            <small className="form-hint">
              Select at least one type of feedback.
            </small>
            <Form.Check
              label="Condition Coverage"
              checked={withConditionCoverage}
              onChange={event => setWithConditionCoverage(event.target.checked)}
            />
            <Form.Check type="checkbox">
              <Form.Check.Input
                type="checkbox"
                checked={withMutationCoverage}
                onChange={event => setWithMutationCoverage(event.target.checked)}
                />
              <Form.Check.Label>Mutation coverage</Form.Check.Label>{' '}
              <small className="form-hint">
              {`You'll be asked to choose specific mutation operators.`}
              </small>
            </Form.Check>
            {
              withMutationCoverage ? (
                <MutationOperatorChoice
                  mutationOperators={mutationOperators}
                  setMutationOperators={setMutationOperators}
                />
              ) : '' 
            }
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label md={3}>Minimum required tests</Form.Label>
            <Form.Control
              type="number"
              min={0}
              placeholder="Blank for no minimum"
              className="w-50"
              defaultValue={minTests}
              onChange={event => setMinTests(event.target.value)}
            />
            <small className="form-hint">
              How many tests are required before feedback (other than pass/fail status) is shown?
            </small>
          </Form.Group>
        </Form>
      </Container>
    </>
  )
};
