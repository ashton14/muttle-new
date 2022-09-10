import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ExerciseOfferingForm from '../../../../components/exercises/offerings/ExerciseOfferingForm';
import { useAuthenticatedApi } from '../../../../lib/context/AuthenticatedApiContext';
import { Alert, Container } from 'react-bootstrap';
import Link from 'next/link';
import { SavedExercise } from '../../../../lib/api';

export default function NewExerciseForm() {
  const [withConditionCoverage, setWithConditionCoverage] = useState(false);
  const [withMutationCoverage, setWithMutationCoverage] = useState(false);
  const [mutationOperators, setMutationOperators] = useState<string[]>([]);
  const [exercise, setExercise] = useState<SavedExercise | null>(null);

  const router = useRouter();
  const exerciseId = parseInt(router.query.exerciseId as string);

  const { getExercise } = useAuthenticatedApi();

  useEffect(() => {
    const fetchExercise = async () => {
      const exercise = await getExercise(exerciseId);
      setExercise(exercise);
    }

    fetchExercise();
  }, [])

  return (
    <Container>
      {exercise ? (
        <>
          <h1>
            Creating an assignment based on {' '}
            <Link href={`/exercises/${exerciseId}`}>
              {`X${exerciseId}: ${exercise.name}`}
            </Link>
          </h1>
          <p>After creating it, you'll be given an invite link to share with your students.</p>
          <ExerciseOfferingForm
            withConditionCoverage={withConditionCoverage}
            setWithConditionCoverage={setWithConditionCoverage}
            withMutationCoverage={withMutationCoverage}
            setWithMutationCoverage={setWithMutationCoverage}
            mutationOperators={mutationOperators}
            setMutationOperators={setMutationOperators}
          />
        </> ) : (
          <Alert variant='danger'>Exercise not found</Alert>
        )}
      </Container>
  );
};
