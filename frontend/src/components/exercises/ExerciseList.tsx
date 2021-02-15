import React, {useEffect, useState} from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import {getExercises} from '../../utils/api';
import ListGroupItem from 'react-bootstrap/ListGroupItem';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import SyntaxHighlighter from '../code/SyntaxHighlighter';

const SIGNATURE_REGEX = /(def .+\(.*\).*):/;

const ExerciseList = () => {
  const [exercises, setExercises] = useState<JSX.Element[]>([]);

  useEffect(() => {
    getExercises().then(exercises => {
      const items = exercises.map(exercise => {
        const signatureMatch = exercise.snippet.match(SIGNATURE_REGEX);
        const value = (signatureMatch && signatureMatch[1]) || '';
        return (
          <ListGroupItem action href={`/exercises/${exercise.id}`}>
            <strong>{exercise.name} </strong>
            <div className="h5">
              <SyntaxHighlighter value={value} />
            </div>
            <p>{exercise.description}</p>
          </ListGroupItem>
        );
      });

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
