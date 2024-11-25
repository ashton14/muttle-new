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
  const [loading, setLoading] = useState(true); // Track loading state

  const router = useRouter();
  const inviteCode = router.query.inviteCode as string | undefined; // Safely handle undefined

  const { authInfo: { userInfo: user } } = useAuth();

  const { getUserAssignment, getLatestAttempt } = useAuthenticatedApi();

  useEffect(() => {
    const fetchExerciseOffering = async () => {
      if (user && inviteCode) { // Only run when user and inviteCode are available
        try {
          const fetched = await getUserAssignment(user.id, inviteCode);
          if (!fetched || fetched.message) {
            router.push({ pathname: '/assignments', query: { message: fetched.message } });
          } else {
            const attempt = await getLatestAttempt({
              userId: user.id,
              exerciseId: fetched.exercise.id,
              exerciseOfferingId: fetched.id,
            });

            setExerciseOffering(fetched);
            setAttemptFeedback(attempt);
            setTests(attempt?.testCases || []);
          }
        } catch (error) {
          console.error('Error fetching exercise offering:', error);
        } finally {
          setLoading(false); // Stop loading
        }
      }
    };

    fetchExerciseOffering();
  }, [router, inviteCode, user, getUserAssignment, getLatestAttempt]);

  // Redirect to home if the user is not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!user || loading) {
    return (
      <Container>
        <Spinner animation="border" size="sm" />
      </Container>
    );
  }

  return (
    <Container>
      {exerciseOffering ? (
        <Practice
          user={user}
          exercise={exerciseOffering.exercise}
          exerciseOffering={exerciseOffering}
          initialAttemptFeedback={attemptFeedback}
          initialTests={tests}
        />
      ) : (
        <Spinner animation="border" size="sm" />
      )}
    </Container>
  );
}
