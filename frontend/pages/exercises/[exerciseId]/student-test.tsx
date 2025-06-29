import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { SavedExercise } from '../../../lib/api';
import { Auth, useAuth } from '../../../lib/context/AuthContext';
import { useAuthenticatedApi } from '../../../lib/context/AuthenticatedApiContext';

const StudentTest = () => {
  const [exercise, setExercise] = useState<SavedExercise>();
  const [functionInput, setFunctionInput] = useState('');
  const [expectedValue, setExpectedValue] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const idParam = router.query.exerciseId as string;

  const { authInfo: { userInfo: user } }: Auth = useAuth();

  const {
    getExercise,
  } = useAuthenticatedApi();
  
  const exerciseId = parseInt(idParam);

  useEffect(() => {
    const message = localStorage.getItem('alertMessage');
    if (message) {
      setAlertMessage(message);
      localStorage.removeItem('alertMessage');
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!idParam || isNaN(parseInt(idParam))) {
        return;
      }

      if (user) {
        try {
          const exercise = await getExercise(exerciseId);
          if (!exercise) {
            router.push('/exercises');
          } else {
            setExercise(exercise);
          }
        } catch (error) {
          console.error('Error fetching exercise:', error);
          router.push('/exercises');
        }
      }
    };

    fetchData();
  }, [router, exerciseId, user, getExercise]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would typically submit the test case
      // For now, we'll just show a success message
      setAlertMessage('Test case submitted successfully!');
      
      // Clear form
      setFunctionInput('');
      setExpectedValue('');
    } catch (error) {
      setAlertMessage('Error submitting test case. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    router.push('/');
    return null;
  }

  if (!exercise) {
    return (
      <Container>
        <div className="d-flex justify-content-center m-4">
          <div>Loading exercise...</div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {alertMessage && (
        <Alert 
          variant={alertMessage.includes('Error') ? 'danger' : 'success'}
          dismissible
          onClose={() => setAlertMessage('')}
        >
          {alertMessage}
        </Alert>
      )}

      <Card>
        <Card.Header>
          <h2>{exercise.name}</h2>
        </Card.Header>
        <Card.Body>
          <Card.Text>
            <strong>Description:</strong>
            <br />
            {exercise.description}
          </Card.Text>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label><strong>Function Input:</strong></Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={functionInput}
                onChange={(e) => setFunctionInput(e.target.value)}
                placeholder="Enter the input values for the function (e.g., 5, 3)"
                required
              />
              <Form.Text className="text-muted">
                Enter the input parameters that will be passed to the function
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label><strong>Expected Output:</strong></Form.Label>
              <Form.Control
                type="text"
                value={expectedValue}
                onChange={(e) => setExpectedValue(e.target.value)}
                placeholder="Enter the expected output value"
                required
              />
              <Form.Text className="text-muted">
                Enter the expected result when the function is called with the given input
              </Form.Text>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button 
                type="submit" 
                variant="primary" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Test Case'}
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => router.push(`/exercises/${exerciseId}`)}
              >
                Back to Exercise
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default StudentTest; 