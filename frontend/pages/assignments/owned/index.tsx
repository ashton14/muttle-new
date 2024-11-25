import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { LoadingState, LoadingStatus } from '../../../components/exercises/ExerciseList';
import { SavedExercise, SavedExerciseOffering } from '../../../lib/api';
import { useAuth } from '../../../lib/context/AuthContext';
import { useAuthenticatedApi } from '../../../lib/context/AuthenticatedApiContext';
import ExerciseOfferingList from '../../../components/exercises/offerings/ExerciseOfferingList';
import { Button, Container } from 'react-bootstrap';
import { useRouter } from 'next/router';

/**
 * A page a containing the ExerciseOfferings that are 
 * OWNED by the current user. That is, ExerciseOfferings that were
 * created by the user.
 */
const OwnedAssignments = () => {
  const [loadingState, setLoading] = useState<LoadingState>({
    status: LoadingStatus.LOADING,
  });

  const [exercises, setExercises] = useState<SavedExercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<number>();
  const [exerciseOfferings, setExerciseOfferings] = useState<SavedExerciseOffering[]>([]);
  const { getOwnedAssignments, getExercises } = useAuthenticatedApi();
  const { authInfo: { userInfo } } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (userInfo) {
      const fetchExercises = async () => {
        const exercises = await getExercises();
        setExercises(exercises);
      }
      fetchExercises();

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

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(event.target.value); 
    setSelectedExercise(selectedId); 
  };

  return (
    <>
      <Container>
        <h1>Owned Exercises</h1>
        {/* Dropdown and Button aligned horizontally */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          <select
            id="exerciseDropdown"
            value={selectedExercise || ''}
            onChange={handleChange}
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
          >
            <option value="" disabled>
              Choose an exercise
            </option>
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.id} - {exercise.name}
              </option>
            ))}
          </select>
          <Button
            onClick={() => router.push(`/exercises/${selectedExercise}/offerings/new`)}
            disabled={!selectedExercise}
            style={{
              flexShrink: 0,
              padding: '10px 20px',
              backgroundColor: selectedExercise ? '#007bff' : '#6c757d',
              borderColor: selectedExercise ? '#007bff' : '#6c757d',
              cursor: selectedExercise ? 'pointer' : 'not-allowed',
            }}
          >
            New Assignment
          </Button>
        </div>

        {exerciseOfferings.length ? (
          <>
            <p>
              A list of exercises you own assigned.
              You can copy the invite code and share it with your students.
            </p>

            <ExerciseOfferingList
              exerciseOfferings={exerciseOfferings}
              loadingState={loadingState}
              owned
            />
          </>
        ) : (
          <p>You do not own any assignments.</p>
        )}
      </Container>
    </>
  );
}

export default OwnedAssignments;
