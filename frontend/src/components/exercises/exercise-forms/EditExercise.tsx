import React, {useState, useEffect} from 'react';
import {useHistory, useParams} from 'react-router-dom';
import {Button, Container} from 'react-bootstrap';

import ExerciseForm from './ExerciseForm';
import {useAuthenticatedApi} from '../../../lib/context/AuthenticatedApiContext';

interface RouteParams {
  exerciseId: string;
}

const EditExercise = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [snippet, setSnippet] = useState('');

  const history = useHistory();
  const {exerciseId: idString} = useParams<RouteParams>();
  const exerciseId = parseInt(idString);

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
      history.push(`/exercises/${exerciseId}`);
    } catch (e) {
      if (e.response.status === 403) {
        history.push('/exercises', {message: e.response.data.message});
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
