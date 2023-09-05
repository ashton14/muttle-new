import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { AttemptFeedback, SavedExerciseOffering, SavedTestCase } from '../../lib/api';
import { useAuth } from '../../lib/context/AuthContext';
import { useAuthenticatedApi } from '../../lib/context/AuthenticatedApiContext';

import { PracticeProps } from '../../components/exercises/practice';
import dynamic from 'next/dynamic';
import { Container, Spinner } from 'react-bootstrap';
const Practice = dynamic<PracticeProps>(
  () => import('../../components/exercises/practice'),
  { ssr: false }
);

/**
 * A page displaying a given ExerciseOffering to which the user has
 * been assigned.
 */
export default function Assignment() {
  const [exerciseOffering, setExerciseOffering] = useState<SavedExerciseOffering>();
  const [tests, setTests] = useState<SavedTestCase[]>([]);
  const [attemptFeedback, setAttemptFeedback] = useState<AttemptFeedback>();

  const router = useRouter();
  const inviteCode = router.query.inviteCode as string;

  const { authInfo: { userInfo: user } } = useAuth();

  const { getUserAssignment, getLatestAttempt } = useAuthenticatedApi();

  useEffect(() => {
    const fetchExerciseOffering = async () => {
      if (user) {
        const fetched = await getUserAssignment(user?.id, inviteCode);
        if (!fetched || fetched.message) {
          router.push({ pathname: '/assignments', query: { message: fetched.message }});
        } else {
          const attempt = await getLatestAttempt({
            userId: user.id,
            exerciseId: fetched.exercise.id,
            exerciseOfferingId: fetched.id
          });

          setExerciseOffering(fetched);
          setAttemptFeedback(attempt);
          setTests(attempt.testCases || []);
        }
      }
    };

    fetchExerciseOffering();
  }, [router, inviteCode, user, getUserAssignment, getLatestAttempt]);

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <Container>
    {
      exerciseOffering ? 
      (<Practice
        user={user}
        exercise={exerciseOffering.exercise}
        exerciseOffering={exerciseOffering}
        initialAttemptFeedback={attemptFeedback}
        initialTests={tests}
      />) :
      (
        <Spinner animation="border" size="sm" />
      )
    }
    </Container>
  );
};
