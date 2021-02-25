import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import AceEditor from 'react-ace';

import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools"

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
      <Form>
        <Form.Group>
          <Form.Label>Name</Form.Label>
          <Form.Text>
            Name of the exercise (separate from function name)
          </Form.Text>
          <Form.Control
            placeholder="Function"
            value={name}
            onChange={event => setName(event.target.value)}
            isInvalid={!name.length}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Description</Form.Label>
          <Form.Text>Short description of the exercise</Form.Text>
          <Form.Control
            placeholder="What this function does"
            value={description}
            onChange={event => setDescription(event.target.value)}
            isInvalid={!description.length}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Code</Form.Label>
          <AceEditor
            mode="python"
            theme="github"
            onChange={value => setSnippet(value)}
            name="code-editor"
            value={snippet}
            wrapEnabled={true}
            fontSize={14}
          />
        </Form.Group>
      </Form>
      <Button onClick={submit}>Create Exercise</Button>
    </Container>
  );
};

export default NewExercise;
