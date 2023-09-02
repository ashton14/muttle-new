import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Container } from 'react-bootstrap';
import ExerciseOfferingForm from '../../../../../components/exercises/offerings/ExerciseOfferingForm';
import { SavedExercise, SavedExerciseOffering } from '../../../../../lib/api';
import { useAuth } from '../../../../../lib/context/AuthContext';
import { useAuthenticatedApi } from '../../../../../lib/context/AuthenticatedApiContext';
import { inviteLinkFromCode } from '../../../../../lib/helper';

const EditExerciseOffering = () => {
  const [conditionCoverage, setConditionCoverage] = useState(false);
  const [mutationCoverage, setMutationCoverage] = useState(false);
  const [mutators, setMutators] = useState<string[]>([]);
  const [minTests, setMinTests] = useState<number>(0);
  const [exercise, setExercise] = useState<SavedExercise | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [offering, setOffering] = useState<SavedExerciseOffering>();

  const router = useRouter(); 
  const exerciseId = parseInt(router.query.exerciseId as string);
  const offeringId = parseInt(router.query.offeringId as string);

  const { getExerciseOffering, updateExerciseOffering } = useAuthenticatedApi();

  useEffect(() => {
    const fetchOffering = async () => {
      try {
        const fetched = await getExerciseOffering(exerciseId, offeringId);
        const {
          conditionCoverage,
          mutators,
          minTests,
          exercise,
          inviteCode
        } = fetched;
        setConditionCoverage(conditionCoverage);
        setMutationCoverage(mutators.length > 0 ? true : false);
        setMutators(mutators);
        setMinTests(minTests || 1);
        setInviteCode(inviteCode)
        setExercise(exercise);
        setOffering(fetched);
      } catch (err) {
        if (err.response.status === 403) {
          router.push({pathname: '/exercises', query: {message: err.response.data.message}});
        }
      }
    }
    
    fetchOffering();
  }, [getExerciseOffering, exerciseId, offeringId, router])

  useEffect(() => {
    if (!mutationCoverage) {
      setMutators([]);
    }
  }, [mutationCoverage])

  const submit = async () => {
    if (offering) {
      await updateExerciseOffering({
        ...offering,
        conditionCoverage,
        mutators,
        minTests
      });
    }
  }

  const enabled =
    conditionCoverage || (mutationCoverage && mutators.length);
  const inviteLink = inviteLinkFromCode(inviteCode);

  return (
    <Container>
      {exercise ? (
        <>
          <h1>
            This assignment is based on the exercise{' '}
            <Link href={`/exercises/${exerciseId}`}>
              {`X${exercise.id}: ${exercise.name}`}
            </Link>
          </h1>
          {inviteCode ? (
            <Alert variant="success">
              Share the following link with your students to distribute this assignment. 
              <br />
              <Link href={`/assignments/${inviteCode}`}>
                {inviteLink}
              </Link>
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
            Update Assignment
          </Button>
        </>
      ) : (
        <Alert variant="danger">Exercise not found</Alert>
      )}
    </Container>
  );
}

export default EditExerciseOffering;
