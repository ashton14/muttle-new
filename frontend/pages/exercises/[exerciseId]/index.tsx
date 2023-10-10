import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { PracticeProps } from '../../../components/exercises/practice';
import {
  AttemptFeedback,
  SavedExercise,
  SavedTestCase
} from '../../../lib/api';
import { Auth, useAuth } from '../../../lib/context/AuthContext';
import { useAuthenticatedApi } from '../../../lib/context/AuthenticatedApiContext';

const Practice = dynamic<PracticeProps>(
  () => import('../../../components/exercises/practice'),
  { ssr: false }
);

export enum FeedbackType {
  NO_FEEDBACK,
  CODE_COVERAGE,
  MUTATION_ANALYSIS,
  ALL_FEEDBACK,
}

const Exercise = () => {
  const [exercise, setExercise] = useState<SavedExercise>();
  const [tests, setTests] = useState<SavedTestCase[]>([]);
  const [attemptFeedback, setAttemptFeedback] = useState<AttemptFeedback>();

  const router = useRouter();
  const idParam = router.query.exerciseId as string;

  const { authInfo: { userInfo: user } }: Auth = useAuth();

  const {
    getExercise,
    getLatestAttempt,
  } = useAuthenticatedApi();
  const exerciseId = parseInt(idParam);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const exercise = await getExercise(exerciseId);
        if (!exercise) {
          router.push('/exercises');
        } else {
          const attempt = await getLatestAttempt({ userId: user.id, exerciseId: exercise.id });
          setExercise(exercise);
          setTests(attempt?.testCases || []);
          setAttemptFeedback(attempt);
        }
      }
    }

    fetchData();
  }, [router, exerciseId, user, getExercise, getLatestAttempt]);

  if (!user) {
    router.push('/');
    return null;
  }

  if (!exercise) {
    return null;
  }

  return (
    <Practice
      user={user}
      exercise={exercise}
      initialAttemptFeedback={attemptFeedback}
      initialTests={tests}
    />
  );
};

export default Exercise;
