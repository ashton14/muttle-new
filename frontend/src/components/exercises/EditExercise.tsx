import React, {useState, useEffect} from 'react';
import {useHistory} from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

import ExerciseForm from './ExerciseForm';
import {getExercise, updateExercise} from '../../api';

const EditExercise = ({match: {params}}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [snippet, setSnippet] = useState('');

  const history = useHistory();

  const {exerciseId} = params;

  useEffect(() => {
    const fetchExercise = async () => {
      const {name, description, snippet} = await getExercise(exerciseId);
      setName(name);
      setDescription(description);
      setSnippet(snippet);
    };

    fetchExercise();
  }, [exerciseId]);

  const submit = async () => {
    const res = await updateExercise(exerciseId, {name, description, snippet});
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
