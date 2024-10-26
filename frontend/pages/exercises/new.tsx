import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

import { useAuthenticatedApi } from '../../lib/context/AuthenticatedApiContext';

import { ExerciseFormProps } from '../../components/exercises/ExerciseForm';
import dynamic from 'next/dynamic';
const ExerciseForm = dynamic<ExerciseFormProps>(
  () => import('../../components/exercises/ExerciseForm'),
  { ssr: false }
);

const NewExercise = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [snippet, setSnippet] = useState('');
  const [error, setError] = useState('');

  const router = useRouter();
  const { createExercise } = useAuthenticatedApi();
  const { getMutations } = useAuthenticatedApi();


  const disabled = !name || !description || !snippet;

  const submit = async () => {
    const res = await createExercise({ name, description, snippet });
    if (res.errorMessage) {
      setError(res.errorMessage.replace(/\\n/g, '\n'));
    } else {
      const { id } = res;
      
      router.push(`/exercises/${id}/mutations`);
    }
    }
  

  return (
    <Container>
      <ExerciseForm
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        snippet={snippet}
        setSnippet={setSnippet}
        error={error}
      />
      <Button onClick={submit} disabled={disabled}>
        Create Exercise
      </Button>
    </Container>
  );
};


export default NewExercise;
