import React, {useEffect, useState} from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';
import {useAuthenticatedApi} from '../../lib/context/AuthenticatedApiContext';
import {SavedExercise} from '../../lib/api';
import { ExerciseListError, ExerciseLoader, LoadingState, LoadingStatus } from '../../components/exercises/ExerciseList';

const ExerciseListItem = dynamic<{exercise: SavedExercise}>(() => 
  import('../../components/exercises/ExerciseList')
  .then(mod => mod.ExerciseListItem)
)

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

export default ExerciseList;
