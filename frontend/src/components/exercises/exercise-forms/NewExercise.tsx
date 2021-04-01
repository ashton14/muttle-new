import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

import ExerciseForm from './ExerciseForm';
import {createExercise} from '../../../lib/api';

const NewExercise = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [snippet, setSnippet] = useState('');

  const disabled = !name || !description || !snippet;

  const history = useHistory();

  const submit = async () => {
    const {id} = await createExercise({name, description, snippet});
    history.push(`/exercises/${id}`);
  };

  return (
    <Container>
      <ExerciseForm
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        snippet={snippet}
        setSnippet={setSnippet}
      />
      <Button onClick={submit} disabled={disabled}>
        Create Exercise
      </Button>
    </Container>
  );
};

export default NewExercise;
