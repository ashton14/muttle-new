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
    const res = await updateExercise(exerciseId, {
      id: exerciseId,
      name,
      description,
      snippet,
    });
    if (res.status === 200) {
      history.push(`/exercises/${exerciseId}`);
    } else if (res.data.error) {
      console.error(res.data.error);
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
