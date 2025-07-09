import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ExerciseOfferingForm from '../../../../components/exercises/offerings/ExerciseOfferingForm';
import { useAuthenticatedApi } from '../../../../lib/context/AuthenticatedApiContext';
import { Alert, Button, Container } from 'react-bootstrap';
import Link from 'next/link';
import { SavedExercise } from '../../../../lib/api';
import { inviteLinkFromCode } from '../../../../lib/helper';

export default function NewExerciseOfferingForm() {
  const [conditionCoverage, setConditionCoverage] = useState(false);
  const [mutationCoverage, setMutationCoverage] = useState(false);
  const [mutators, setMutators] = useState<string[]>([]);
  const [minTests, setMinTests] = useState<number>(0);
  const [hideCode, setHideCode] = useState(false);
  const [exercise, setExercise] = useState<SavedExercise | null>(null);
  const [inviteCode, setInviteCode] = useState('');

  const router = useRouter();
  const exerciseId = parseInt(router.query.exerciseId as string);

  const { getExercise, createExerciseOffering } = useAuthenticatedApi();

  useEffect(() => {
    const fetchExercise = async () => {
      const exercise = await getExercise(exerciseId);
      setExercise(exercise);
    };

    fetchExercise();
  }, [exerciseId, getExercise]);

  const submit = async () => {
    console.log('Submitting with hideCode:', hideCode, 'type:', typeof hideCode);
    
    const savedOffering = await createExerciseOffering({
      exerciseId,
      conditionCoverage,
      mutators,
      minTests,
      hideCode,
    });
    setInviteCode(savedOffering.inviteCode);
  };

  const enabled =
    conditionCoverage || (mutationCoverage && mutators.length);
  const inviteLink = inviteLinkFromCode(inviteCode);

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
          {inviteCode ? (
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
            hideCode={hideCode}
            setHideCode={setHideCode}
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
