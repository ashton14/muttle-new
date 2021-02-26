import React from 'react';
import Form from 'react-bootstrap/Form';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';

interface ExerciseFormProps {
  name?: string;
  setName: (name: string) => void;
  description?: string;
  setDescription: (description: string) => void;
  snippet?: string;
  setSnippet: (name: string) => void;
}

const ExerciseForm = ({
  name,
  setName,
  description,
  setDescription,
  snippet,
  setSnippet,
}: ExerciseFormProps) => {
  return (
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
          isInvalid={!name || !name.length}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Description</Form.Label>
        <Form.Text>Short description of the exercise</Form.Text>
        <Form.Control
          placeholder="What this function does"
          value={description}
          onChange={event => setDescription(event.target.value)}
          isInvalid={!description || !description.length}
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
  );
};

export default ExerciseForm;
