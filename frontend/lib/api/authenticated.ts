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
  MutatedLine,
  Mutation,
  User
} from '../api';

export const getAuthenticatedEndpoints = (
  api: AxiosInstance
): AuthenticatedApi => ({
  createExercise: createExercise(api),
  getExercise: getExercise(api),
  getExercises: getExercises(api),
  getMutations: getMutations(api),
  updateMutation: updateMutation(api),
  createExerciseOffering: createExerciseOffering(api),
  updateExerciseOffering: updateExerciseOffering(api),
  getExerciseOffering: getExerciseOffering(api),
  getUsers: getUsers(api),
  getUserAssignments: getUserAssignments(api),
  getUserAssignment: getUserAssignment(api),
  getOwnedAssignments: getOwnedAssignments(api),
  updateExercise: updateExercise(api),
  deleteTestCase: deleteTestCase(api),
  runTests: runTests(api),
  getLatestAttempt: getLatestAttempt(api),
  getAllLatestAttempts: getAllLatestAttempts(api)
});

const createExercise =
  (api: AxiosInstance) =>
  (data: Exercise): Promise<SavedExercise> =>
    api.post('exercises', data)
    .then(res => res.data)
    .catch(err => {
    if (err.response) {
      // If response exists, handle the response error
      console.error('Error response:', err.response.data);
      return err.response.data;
    } else if (err.request) {
      // The request was made but no response was received
      console.error('No response received:', err.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', err.message);
    }
    // Optionally, you can return or throw a more general error message
    return { error: 'Something went wrong. Please try again later.' };
  });


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

const getMutations =
  (api: AxiosInstance) =>
    (exerciseId: number): Promise<Mutation[]> =>
      api.get(`exercises/${exerciseId}/mutations`).then(res => {
        return res.data;
      });

const updateMutation =
  (api: AxiosInstance) =>
    (data: Mutation): Promise <Mutation> =>
    api.put(`exercises/${data.exerciseId}/mutations/${data.id}`, data)
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
  async ({ exerciseId, exerciseOfferingId, userId, testCases }: RunTestRequest): Promise<AttemptFeedback> => {
    console.log('Running tests with the following parameters:');
    console.log('exerciseId:', exerciseId);
    console.log('exerciseOfferingId:', exerciseOfferingId);
    console.log('userId:', userId);
    console.log('testCases:', testCases);
    
    try {
      const response = await api.post(`run/${exerciseId}`, { userId, exerciseOfferingId, testCases });
      console.log('Response from API:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error during API call:', error);
      throw error; // Rethrow to handle it later if needed
    }
  };

  // (api: AxiosInstance) =>
  // ({ exerciseId, exerciseOfferingId, userId, testCases }: RunTestRequest):
  //   Promise<AttemptFeedback> => 
  //   api.post(`run/${exerciseId}`, { userId, exerciseOfferingId, testCases }).then(res => res.data);

const getUserAssignment =
    (api: AxiosInstance) => 
    (userId: number, inviteCode: string): Promise<SavedExerciseOffering & { message?: string }> =>
        api.put(`/users/${userId}/assignments/${inviteCode}`)
          .then(res => res.data)
          .catch(err => err.response.data);

const getLatestAttempt =
  (api: AxiosInstance) =>
  async ({userId, exerciseId, exerciseOfferingId}: AttemptRequest): Promise<AttemptFeedback> => {
    if (exerciseId && exerciseOfferingId) {
      console.log(exerciseId, exerciseOfferingId)
      return api.get(`exercises/${exerciseId}/offerings/${exerciseOfferingId}/attempts/latest`)
        .then(res => {
    console.log('API Response:', res.data); // Log the response data
    return res.data; // Return the data as before
  });
    } else if (exerciseId) {
      return api
        .get(`exercises/${exerciseId}/attempts/latest?userId=${userId}`)
        .then(res => res.data);
    } else {
      return Promise.resolve({} as AttemptFeedback);
    }
    }
  
const getAllLatestAttempts =
  (api: AxiosInstance) =>
  async ({userId, exerciseId, exerciseOfferingId}: AttemptRequest ): Promise<AttemptFeedback[]> => {
    if (exerciseId && exerciseOfferingId) {
      return api
        .get(`exercises/${exerciseId}/offerings/${exerciseOfferingId}/attempts/allLatest`)
        .then(res => res.data);
    } else {
      return Promise.resolve({} as AttemptFeedback[]);
    }
  };


const getUsers = (api: AxiosInstance) => (): Promise<User[]> =>
        api.get(`users`).then(res => res.data).catch(err => err.response.data);  
          

