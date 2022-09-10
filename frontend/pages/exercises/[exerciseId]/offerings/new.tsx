import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ExerciseOfferingForm from '../../../../components/exercises/offerings/ExerciseOfferingForm';
import { useAuthenticatedApi } from '../../../../lib/context/AuthenticatedApiContext';
import { Alert, Button, Container } from 'react-bootstrap';
import Link from 'next/link';
import { SavedExercise } from '../../../../lib/api';

export default function NewExerciseOfferingForm() {
  const [withConditionCoverage, setWithConditionCoverage] = useState(false);
  const [withMutationCoverage, setWithMutationCoverage] = useState(false);
  const [mutationOperators, setMutationOperators] = useState<string[]>([]);
  const [minTests, setMinTests] = useState<number | undefined>(undefined);
  const [exercise, setExercise] = useState<SavedExercise | null>(null);

  const router = useRouter();
  const exerciseId = parseInt(router.query.exerciseId as string);

  const { getExercise } = useAuthenticatedApi();

  useEffect(() => {
    const fetchExercise = async () => {
      const exercise = await getExercise(exerciseId);
      setExercise(exercise);
    };

    fetchExercise();
  }, [exerciseId, getExercise]);

  const { createExerciseOffering } = useAuthenticatedApi();

  const submit = async () => {
    await createExerciseOffering({
      exerciseId,
      withConditionCoverage,
      mutationOperators,
      minTests
    });
  };

  const enabled =
    withConditionCoverage || (withMutationCoverage && mutationOperators.length);

  return (
    <Container>
      {exercise ? (
        <>
          <h1>
            Creating an assignment based on{' '}
            <Link href={`/exercises/${exerciseId}`}>
              {`X${exerciseId}: ${exercise.name}`}
            </Link>
          </h1>
          <p>{`After creating the assignment, you'll be given an invite link to share with your students.`}</p>
          <ExerciseOfferingForm
            withConditionCoverage={withConditionCoverage}
            setWithConditionCoverage={setWithConditionCoverage}
            withMutationCoverage={withMutationCoverage}
            setWithMutationCoverage={setWithMutationCoverage}
            mutationOperators={mutationOperators}
            setMutationOperators={setMutationOperators}
            minTests={minTests}
            setMinTests={setMinTests}
          />
          <Button onClick={submit} disabled={!enabled} variant="success">
            Create Assignment
          </Button>
        </>
      ) : (
        <Alert variant="danger">Exercise not found</Alert>
      )}
    </Container>
  );
}
