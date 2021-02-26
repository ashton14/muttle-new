import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

import ExerciseForm from './ExerciseForm';
import {newExercise} from '../../api';

const NewExercise = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [snippet, setSnippet] = useState('');

  const history = useHistory();

  const submit = async () => {
    const savedExercise = await newExercise({name, description, snippet});
    history.push(`/exercises/${savedExercise.id}`);
  };

  // onSubmit={event => event.preventDefault() || (name.length && description.length && snippet.length) ? submit()}
  return (
    <Container>
      <ExerciseForm
        setName={setName}
        setDescription={setDescription}
        setSnippet={setSnippet}
      />
      <Button onClick={submit}>Create Exercise</Button>
    </Container>
  );
};

export default NewExercise;
