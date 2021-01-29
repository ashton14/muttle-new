import React, {useEffect, useState} from 'react';
import ListGroup from 'react-bootstrap/cjs/ListGroup';
import {getExercises} from '../../api';
import SyntaxHighlighter from 'react-syntax-highlighter';
import ListGroupItem from 'react-bootstrap/cjs/ListGroupItem';

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

            <SyntaxHighlighter language="python" m>
              {exercise.snippet.split(':')[0]}
            </SyntaxHighlighter>
          </div>
          <p>
            <strong>
              {exercise.name}:
            </strong>
            {exercise.description}
          </p>

        </ListGroupItem>
      ));

      setExercises(items);
    });
  }, []);

  return <ListGroup className="w-auto">{exercises}</ListGroup>;
};

export default ExerciseList;
