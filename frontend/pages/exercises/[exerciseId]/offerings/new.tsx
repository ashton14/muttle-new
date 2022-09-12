import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ExerciseOfferingForm from '../../../../components/exercises/offerings/ExerciseOfferingForm';
import { useAuthenticatedApi } from '../../../../lib/context/AuthenticatedApiContext';
import { Alert, Button, Container } from 'react-bootstrap';
import Link from 'next/link';
import { SavedExercise } from '../../../../lib/api';

export default function NewExerciseOfferingForm() {
  const [conditionCoverage, setConditionCoverage] = useState(false);
  const [mutationCoverage, setMutationCoverage] = useState(false);
  const [mutators, setMutators] = useState<string[]>([]);
  const [minTests, setMinTests] = useState<number | undefined>(undefined);
  const [exercise, setExercise] = useState<SavedExercise | null>(null);
  const [inviteLink, setInviteLink] = useState('');

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
    const savedOffering = await createExerciseOffering({
      exerciseId,
      withConditionCoverage: conditionCoverage,
      mutationOperators: mutators,
      minTests,
    });
    const inviteLink = `${window.location.host}/assignment/${savedOffering.inviteCode}`;
    setInviteLink(inviteLink);
  };

  const enabled =
    conditionCoverage || (mutationCoverage && mutators.length);

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
          {inviteLink ? (
            <Alert variant="success">
              Assignment created successfully. Share the following invite link
              with your students.
              <br />
              <a href={inviteLink}>{inviteLink}</a>
            </Alert>
          ) : (
            <p>{`After creating the assignment, you'll be given an invite link to share with your students.`}</p>
          )}
          <ExerciseOfferingForm
            withConditionCoverage={conditionCoverage}
            setWithConditionCoverage={setConditionCoverage}
            withMutationCoverage={mutationCoverage}
            setWithMutationCoverage={setMutationCoverage}
            mutationOperators={mutators}
            setMutationOperators={setMutators}
            minTests={minTests}
            setMinTests={setMinTests}
          />
          <Button onClick={submit} disabled={!enabled}>
            Create Assignment
          </Button>
        </>
      ) : (
        <Alert variant="danger">Exercise not found</Alert>
      )}
    </Container>
  );
}
