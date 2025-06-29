import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Alert, Button, Container, ListGroup, Row, Spinner } from 'react-bootstrap';
import { SavedExercise, SavedExerciseOffering } from '../../lib/api';

import { HighlighterProps } from '../../components/code/Highlighter';
import { useRouter } from 'next/router';
const Highlighter = dynamic<HighlighterProps>(() => import('../../components/code/Highlighter'), { ssr: false });

const SIGNATURE_REGEX = /(def .+\(.*\).*):/;

export enum LoadingStatus {
  LOADING,
  ERROR,
  DONE,
}

export interface LoadingState {
  status: LoadingStatus;
  error?: Error;
}

interface ExerciseListProps {
  exercises: (SavedExercise | SavedExerciseOffering)[]
}

export const ExerciseList = ({ exercises }: ExerciseListProps) => {
  const [{status, error}, setLoading] = useState<LoadingState>({
    status: LoadingStatus.LOADING,
  });

  const router = useRouter();

  switch (status) {
    case LoadingStatus.LOADING:
      return <ExerciseLoader />;
    case LoadingStatus.ERROR:
      return <ExerciseListError error={error} />;
    case LoadingStatus.DONE:
      return (
        <Container>
          {router?.query?.message ? (
            <Alert variant="danger">{router.query.message}</Alert>
          ) : (
            ''
          )}
          <ListGroup className="w-auto my-2">
            {exercises.map(exercise => (
              <ExerciseListItem key={exercise.id} exercise={exercise} />
            ))}
          </ListGroup>
          <Button href="/exercises/new">
            <i className="fas fa-plus-square" aria-hidden="true" /> New Exercise
          </Button>
        </Container>
      );
  }
};

export const ExerciseOfferingListItem = ({ exerciseOffering }: { exerciseOffering: SavedExerciseOffering }) => {
  const exercise = exerciseOffering.exercise;
  const signatureMatch = exercise.snippet.match(SIGNATURE_REGEX);
  const value = (signatureMatch && signatureMatch[1]) || '';
  return (
    <ListGroup.Item className="py-1" action href={`/exercises/${exercise.id}`}>
      <div className="font-weight-bold">{exercise.name}</div>
      <div className="h5">
        <Highlighter value={value} />
      </div>
      <div>{exercise.description}</div>
    </ListGroup.Item>
  );
}

export const ExerciseListItem = ({exercise}: {exercise: SavedExercise}) => {
  const router = useRouter();
  const signatureMatch = exercise.snippet.match(SIGNATURE_REGEX);
  const value = (signatureMatch && signatureMatch[1]) || '';
  
  const handleStudentTest = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/exercises/${exercise.id}/student-test`);
  };

  return (
    <ListGroup.Item className="py-1" action href={`/exercises/${exercise.id}`}>
      <div className="font-weight-bold">{exercise.name}</div>
      <div className="h5">
        <Highlighter value={value} />
      </div>
      <div>{exercise.description}</div>
      <div className="mt-2">
        <Button 
          size="sm" 
          variant="outline-primary" 
          onClick={handleStudentTest}
        >
          Student Test
        </Button>
      </div>
    </ListGroup.Item>
  );
};

export const ExerciseLoader = () => (
  <div className="d-flex justify-content-center m-2">
    <Row>
      <Spinner animation="border" variant="primary" />
      <div className="mx-2 mt-1 align-middle">Loading Exercises</div>
    </Row>
  </div>
);

export const ExerciseListError = ({error}: {error?: Error}) => (
  <Alert variant="danger">
    <Alert.Heading>
      Unable to load Exercises: {error?.message || 'Unknown Error'}
    </Alert.Heading>
    <p>{error?.stack}</p>
  </Alert>
);
