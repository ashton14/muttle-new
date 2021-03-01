import React, {useEffect, useState} from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import {getExercises} from '../../utils/api';
import SyntaxHighlighter from 'react-syntax-highlighter';
import ListGroupItem from 'react-bootstrap/ListGroupItem';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

const SIGNATURE_REGEX = /def .+\(.*\).*:/;

const ExerciseList = () => {
  const [exercises, setExercises] = useState<JSX.Element[]>([]);

  useEffect(() => {
    getExercises().then(exercises => {
      const items = exercises.map(exercise => (
        <ListGroupItem
          className="w-auto"
          key={exercise.id}
          action
          href={`/exercises/${exercise.id}`}
        >
          <div className="h5">
            <SyntaxHighlighter language="python">
              {exercise.snippet.match(SIGNATURE_REGEX)}
            </SyntaxHighlighter>
          </div>
          <p>
            <strong>{exercise.name}: </strong>
            {exercise.description}
          </p>
        </ListGroupItem>
      ));

      setExercises(items);
    });
  }, []);

  return (
    <Container>
      <ListGroup className="w-auto">{exercises}</ListGroup>
      <Button action href="/exercises/new">
        <i className="fas fa-plus-square" aria-hidden="true" /> New Exercise
      </Button>
    </Container>
  );
};

export default ExerciseList;
