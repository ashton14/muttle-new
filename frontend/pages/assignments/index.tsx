import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { LoadingState, LoadingStatus } from '../../components/exercises/ExerciseList';
import { SavedExerciseOffering } from '../../lib/api';
import { useAuth } from '../../lib/context/AuthContext';
import { useAuthenticatedApi } from '../../lib/context/AuthenticatedApiContext';
import ExerciseOfferingList from '../../components/exercises/offerings/ExerciseOfferingList';
import { Container } from 'react-bootstrap';

/**
 * A page a containing the ExerciseOfferings that have been
 * "assigned" to the current user. That is, ExerciseOfferings to which
 * the user has been invited.
 */
const Assignments = () => {
  const [loadingState, setLoading] = useState<LoadingState>({
    status: LoadingStatus.LOADING,
  });

  const [exerciseOfferings, setExerciseOfferings] = useState<SavedExerciseOffering[]>([]);
  const { getUserAssignments } = useAuthenticatedApi();
  const { authInfo: { userInfo } } = useAuth();

  useEffect(() => {
    if (userInfo) {
      getUserAssignments(userInfo.id)
        .then(exerciseOfferings => {
          setExerciseOfferings(exerciseOfferings);
          setLoading({ status: LoadingStatus.DONE });
        })
        .catch(err => {
          setLoading({ status: LoadingStatus.ERROR, error: err });
        });
    }
  }, [getUserAssignments, userInfo]);

  return (
    <Container>
      <h1>Assignments</h1>
      {
        exerciseOfferings.length ?
        (
          <>
          <p>
            A list of exercises assigned to you.
            Your instructor will see your results when you work on the exercise.
          </p>
          <ExerciseOfferingList
            exerciseOfferings={exerciseOfferings}
            loadingState={loadingState}
            owned={false} />
          </>
        ) : (
          <p>
            You have not been assigned any exercises as yet.
          </p>
        )
      }
    </Container>
  )
}

export default Assignments;
