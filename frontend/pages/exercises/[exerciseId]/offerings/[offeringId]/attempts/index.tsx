import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Container } from 'react-bootstrap';
import ExerciseOfferingForm from '../../../../../../components/exercises/offerings/ExerciseOfferingForm';
import { SavedExercise, SavedExerciseOffering } from '../../../../../../lib/api';
import { useAuth } from '../../../../../../lib/context/AuthContext';
import { useAuthenticatedApi } from '../../../../../../lib/context/AuthenticatedApiContext';
import { inviteLinkFromCode } from '../../../../../../lib/helper';

const ViewOfferingAttempts = () => {
  const [exercise, setExercise] = useState<SavedExercise | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [offering, setOffering] = useState<SavedExerciseOffering>();

  const router = useRouter(); 
  const exerciseId = parseInt(router.query.exerciseId as string);
  const offeringId = parseInt(router.query.offeringId as string);

  const { getExerciseOffering, getLatestAttempt } = useAuthenticatedApi();

  useEffect(() => {
    
  }, [router])

  const inviteLink = inviteLinkFromCode(inviteCode);

  return (
    <Container>
      {exercise ? (
        <>
          <h1>
            This assignment is based on the exercise{' '}
            <Link href={`/exercises/${exerciseId}`}>
              {`X${exerciseId}: ${exercise.name}`}
            </Link>
          </h1>
          {inviteCode ? (
            <Alert variant="success">
              Assignment link
              <br />
              <Link href={`/assignments/${inviteCode}`}>
                {inviteLink}
              </Link>
            </Alert>
          ) : (
            <p>{`After creating the assignment, you'll be given an invite link to share with your students.`}</p>
          )}
          
        </>
      ) : (
        <Alert variant="danger">Exercise not found</Alert>
      )}
    </Container>
  );
}

export default ViewOfferingAttempts;