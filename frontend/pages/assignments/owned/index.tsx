import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { LoadingState, LoadingStatus } from '../../../components/exercises/ExerciseList';
import { SavedExerciseOffering } from '../../../lib/api';
import { useAuth } from '../../../lib/context/AuthContext';
import { useAuthenticatedApi } from '../../../lib/context/AuthenticatedApiContext';
import ExerciseOfferingList from '../../../components/exercises/offerings/ExerciseOfferingList';

/**
 * A page a containing the ExerciseOfferings that are 
 * OWNED by the current user. That is, ExerciseOfferings that were
 * created by the user.
 */
const OwnedAssignments = () => {
  const [loadingState, setLoading] = useState<LoadingState>({
    status: LoadingStatus.LOADING,
  });

  const [exerciseOfferings, setExerciseOfferings] = useState<SavedExerciseOffering[]>([]);
  const { getOwnedAssignments } = useAuthenticatedApi();
  const { authInfo: { userInfo } } = useAuth();

  useEffect(() => {
    if (userInfo) {
      getOwnedAssignments(userInfo.id)
        .then(exerciseOfferings => {
          setExerciseOfferings(exerciseOfferings);
          setLoading({ status: LoadingStatus.DONE });
        })
        .catch(err => {
          setLoading({ status: LoadingStatus.ERROR, error: err });
        });
    }
  }, [getOwnedAssignments, userInfo]);

  return <ExerciseOfferingList
    exerciseOfferings={exerciseOfferings}
    loadingState={loadingState}/>
}

export default OwnedAssignments;
