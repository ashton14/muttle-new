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
} from '../api';

export const getAuthenticatedEndpoints = (
  api: AxiosInstance
): AuthenticatedApi => ({
  createExercise: createExercise(api),
  getExercise: getExercise(api),
  getExercises: getExercises(api),
  createExerciseOffering: createExerciseOffering(api),
  getUserExerciseOfferings: getUserExerciseOfferings(api),
  updateExercise: updateExercise(api),
  getTestCases: getTestCases(api),
  createTestCase: createTestCase(api),
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
    actual = false
  ): Promise<SavedTestCase[]> =>
    api
      .get(`exercises/${exerciseId}/testCases`, { params: { userId, actual } })
      .then(res => res.data);

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

const createExerciseOffering =
  (api: AxiosInstance) =>
  (data: ExerciseOffering): Promise<SavedExerciseOffering> =>
    api
      .post(`exercises/${data.exerciseId}/offerings`, data)
      .then(res => res.data);

const getUserExerciseOfferings = 
    (api: AxiosInstance) =>
    (userId: number): Promise<SavedExerciseOffering[]> =>
      api.get(`users/${userId}/exerciseOfferings`).then(res => res.data);

const runTests =
  (api: AxiosInstance) =>
  (exerciseId: number, userId: number): Promise<AttemptFeedback> =>
    api.post(`run/${exerciseId}`, { userId }).then(res => res.data);

const getLatestAttempt =
  (api: AxiosInstance) =>
  (exerciseId: number, userId: number): Promise<AttemptFeedback> =>
    api
      .get(`exercises/${exerciseId}/attempts/latest?userId=${userId}`)
      .then(res => res.data);
