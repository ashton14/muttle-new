import React from 'react';
import Form from 'react-bootstrap/Form';
import CodeEditor from '../../code/CodeEditor';

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
          required
          placeholder="Function"
          value={name}
          onChange={event => setName(event.target.value)}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Description</Form.Label>
        <Form.Text>Short description of the exercise</Form.Text>
        <Form.Control
          required
          as="textarea"
          placeholder="What this function does"
          value={description}
          onChange={event => setDescription(event.target.value)}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Code</Form.Label>
        <CodeEditor value={snippet} onChange={value => setSnippet(value)} />
      </Form.Group>
    </Form>
  );
};

export default ExerciseForm;
