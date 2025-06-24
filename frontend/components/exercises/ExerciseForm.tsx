import dynamic from 'next/dynamic';
import React from 'react';
import Form from 'react-bootstrap/Form';
import { CodeEditorProps } from '../code/CodeEditor';
import Highlighter from '../code/Highlighter';

const CodeEditor = dynamic<CodeEditorProps>(() => import('../code/CodeEditor'), { ssr: false });

export interface ExerciseFormProps {
  name?: string;
  setName: (name: string) => void;
  description?: string;
  setDescription: (description: string) => void;
  snippet?: string;
  setSnippet: (name: string) => void;
  error?: string
}

const ExerciseForm = ({
  name,
  setName,
  description,
  setDescription,
  snippet,
  setSnippet,
  error,
}: ExerciseFormProps) => {
  function errDisplay() {
    return error === undefined ? '' :
      error.split('\n').slice(1).join('\n');
  }

  return (
    <>
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
          <CodeEditor value={snippet || ''} onChange={value => setSnippet(value)} />
          {
            error ? (
              <Form.Text className='text-danger'>
                Error creating exercise. Please fix the error and try again.
              </Form.Text>
            ) : ''
          }
        </Form.Group>
        {
          error ?
          (
            <Highlighter value={errDisplay()} />
          ) : ''
        }
      </Form>
    </>
  );
};

export default ExerciseForm;
