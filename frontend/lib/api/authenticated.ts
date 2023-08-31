import { AxiosInstance } from 'axios';
import {
  AuthenticatedApi,
  AttemptFeedback,
  Exercise,
  ExerciseOffering,
  NewTestCase,
  SavedExercise,
  SavedTestCase,
  SavedExerciseOffering,
  AttemptRequest,
  RunTestRequest,
} from '../api';

export const getAuthenticatedEndpoints = (
  api: AxiosInstance
): AuthenticatedApi => ({
  createExercise: createExercise(api),
  getExercise: getExercise(api),
  getExercises: getExercises(api),
  createExerciseOffering: createExerciseOffering(api),
  updateExerciseOffering: updateExerciseOffering(api),
  getExerciseOffering: getExerciseOffering(api),
  getUserAssignments: getUserAssignments(api),
  getUserAssignment: getUserAssignment(api),
  getOwnedAssignments: getOwnedAssignments(api),
  updateExercise: updateExercise(api),
  getTestCases: getTestCases(api),
  deleteTestCase: deleteTestCase(api),
  runTests: runTests(api),
  getLatestAttempt: getLatestAttempt(api),
});

const createExercise =
  (api: AxiosInstance) =>
  (data: Exercise): Promise<SavedExercise> =>
    api.post('exercises', data).then(res => res.data);

const updateExercise =
  (api: AxiosInstance) =>
  (exerciseId: number, data: SavedExercise): Promise<SavedExercise> =>
    api.put(`exercises/${exerciseId}`, data).then(res => res.data);

const getExercise =
  (api: AxiosInstance) =>
  (exerciseId: number): Promise<SavedExercise> =>
    api.get(`exercises/${exerciseId}`).then(exercise => {
      return exercise.data;
    });

const getExercises = (api: AxiosInstance) => (): Promise<SavedExercise[]> =>
  api.get('exercises').then(res => res.data);

const getTestCases =
  (api: AxiosInstance) =>
  (
    exerciseId: number,
    userId: number,
    attemptId: number,
    actual = false
  ): Promise<SavedTestCase[]> =>
    api
      .get(`exercises/${exerciseId}/testCases`, { params: { userId, actual } })
      .then(res => res.data);

// NOT USED
const createTestCase =
  (api: AxiosInstance) =>
  (testCase: NewTestCase): Promise<SavedTestCase> =>
    api
      .post(`exercises/${testCase.exerciseId}/testCases`, testCase)
      .then(res => res.data);

const deleteTestCase =
  (api: AxiosInstance) =>
  (testCase: SavedTestCase): Promise<number | null> =>
    api
      .delete(`exercises/${testCase.exerciseId}/testCases/${testCase.id}`)
      .then(res => res.data);

const getExerciseOffering = 
    (api: AxiosInstance) =>
    (exerciseId: number, exerciseOfferingId: number): Promise<SavedExerciseOffering> =>
      api.get(`exercises/${exerciseId}/offerings/${exerciseOfferingId}`)
        .then(res => res.data);

const createExerciseOffering =
  (api: AxiosInstance) =>
  (data: ExerciseOffering): Promise<SavedExerciseOffering> =>
    api
      .post(`exercises/${data.exerciseId}/offerings`, data)
      .then(res => res.data);

const updateExerciseOffering =
    (api: AxiosInstance) =>
    (data: SavedExerciseOffering): Promise<SavedExerciseOffering> =>
      api
        .put(`exercises/${data.exerciseId}/offerings/${data.id}`, data)
        .then(res => res.data);

const getUserAssignments = 
    (api: AxiosInstance) =>
    (userId: number): Promise<SavedExerciseOffering[]> =>
      api.get(`users/${userId}/assignments`).then(res => res.data);

const getOwnedAssignments =
    (api: AxiosInstance) =>
    (userId: number): Promise<SavedExerciseOffering[]> =>
      api.get(`users/${userId}/ownedAssignments`).then(res => res.data);

const runTests =
  (api: AxiosInstance) =>
  ({ exerciseId, exerciseOfferingId, userId, testCases }: RunTestRequest):
    Promise<AttemptFeedback> =>
    api.post(`run/${exerciseId}`, { userId, exerciseOfferingId, testCases }).then(res => res.data);

const getUserAssignment =
    (api: AxiosInstance) => 
    (userId: number, inviteCode: string): Promise<SavedExerciseOffering> =>
        api.put(`/users/${userId}/assignments/${inviteCode}`)
          .then(res => res.data);

const getLatestAttempt =
  (api: AxiosInstance) =>
  ({userId, exerciseId, exerciseOfferingId}: AttemptRequest): Promise<AttemptFeedback> => {
    if (exerciseId && exerciseOfferingId) {
      return api.get(`exercises/${exerciseId}/offerings/${exerciseOfferingId}/attempts/latest`)
        .then(res => res.data)
    } else if (exerciseId) {
      return api
        .get(`exercises/${exerciseId}/attempts/latest?userId=${userId}`)
        .then(res => res.data);
    } else {
      return Promise.resolve({} as AttemptFeedback);
    }
  }
