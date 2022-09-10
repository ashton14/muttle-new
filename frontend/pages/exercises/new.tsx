import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

import ExerciseForm from '../../components/exercises/ExerciseForm';
import { useAuthenticatedApi } from '../../lib/context/AuthenticatedApiContext';

const NewExercise = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [snippet, setSnippet] = useState('');

  const router = useRouter();
  const { createExercise } = useAuthenticatedApi();

  const disabled = !name || !description || !snippet;

  const submit = async () => {
    const { id } = await createExercise({ name, description, snippet });
    router.push(`/exercises/${id}`);
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
