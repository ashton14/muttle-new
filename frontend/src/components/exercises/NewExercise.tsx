import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

import ExerciseForm from './ExerciseForm';
import {createExercise} from '../../utils/api';

const NewExercise = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [snippet, setSnippet] = useState('');
  const [validated, setValidated] = useState(false);

  const disabled = !name || !description || !snippet;

  const history = useHistory();

  const submit = async () => {
    const savedExercise = await createExercise({name, description, snippet});
    history.push(`/exercises/${savedExercise.id}`);
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
      <Button onClick={submit}>Create Exercise</Button>
    </Container>
  );
};

export default NewExercise;
