import React, {useState, useEffect} from 'react';
import { useRouter } from 'next/router';
import {Button, Container} from 'react-bootstrap';

import ExerciseForm from '../../../components/exercises/ExerciseForm';
import {useAuthenticatedApi} from '../../../lib/context/AuthenticatedApiContext';

const EditExercise = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [snippet, setSnippet] = useState('');

  const router = useRouter();
  const idParam = router.query.exerciseId as string;
  const exerciseId = parseInt(idParam);

  const {getExercise, updateExercise} = useAuthenticatedApi();

  useEffect(() => {
    const fetchExercise = async () => {
      const {name, description, snippet} = await getExercise(exerciseId);
      setName(name);
      setDescription(description);
      setSnippet(snippet);
    };

    fetchExercise();
  }, [exerciseId, getExercise]);

  const submit = async () => {
    try {
      await updateExercise(exerciseId, {
        id: exerciseId,
        name,
        description,
        snippet,
      });
      router.push(`/exercises/${exerciseId}`);
    } catch (e) {
      if (e.response.status === 403) {
        router.push({pathname: '/exercises', query: {message: e.response.data.message}});
      } else {
        console.error(e);
      }
    }
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
      <Button onClick={submit}>Update Exercise</Button>
    </Container>
  );
};

export default EditExercise;
