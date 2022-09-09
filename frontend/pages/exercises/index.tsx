import React, {useEffect, useState} from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';
import Row from 'react-bootstrap/Row';
import Alert from 'react-bootstrap/Alert';
import {useAuthenticatedApi} from '../../lib/context/AuthenticatedApiContext';
import {SavedExercise} from '../../lib/api';

import { HighlighterProps } from '../../components/code/Highlighter';
const Highlighter = dynamic<HighlighterProps>(() => import('../../components/code/Highlighter'), { ssr: false });

const SIGNATURE_REGEX = /(def .+\(.*\).*):/;

enum LoadingStatus {
  LOADING,
  ERROR,
  DONE,
}

interface LoadingState {
  status: LoadingStatus;
  error?: Error;
}

const ExerciseList = () => {
  const router = useRouter();
  const [{status, error}, setLoading] = useState<LoadingState>({
    status: LoadingStatus.LOADING,
  });
  const [exercises, setExercises] = useState<SavedExercise[]>([]);
  const {getExercises} = useAuthenticatedApi();

  useEffect(() => {
    getExercises()
      .then(exercises => {
        setExercises(exercises);
        setLoading({status: LoadingStatus.DONE});
      })
      .catch(err => {
        setLoading({status: LoadingStatus.ERROR, error: err});
      });
  }, [getExercises]);

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

const ExerciseListItem = ({exercise}: {exercise: SavedExercise}) => {
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
};

const ExerciseLoader = () => (
  <div className="d-flex justify-content-center m-2">
    <Row>
      <Spinner animation="border" variant="primary" />
      <div className="mx-2 mt-1 align-middle">Loading Exercises</div>
    </Row>
  </div>
);

const ExerciseListError = ({error}: {error?: Error}) => (
  <Alert variant="danger">
    <Alert.Heading>
      Unable to load Exercises: {error?.message || 'Unknown Error'}
    </Alert.Heading>
    <p>{error?.stack}</p>
  </Alert>
);

export default ExerciseList;
