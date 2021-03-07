import axios, {AxiosRequestConfig} from 'axios';

const baseURL = 'http://localhost:3000/api/';
const config: AxiosRequestConfig = {baseURL};

interface Exercise {
  name: string;
  description: string;
  snippet: string;
}

export interface SavedExercise extends Exercise {
  id: number;
}

export interface NewTestCase {
  input: string;
  output: string;
  exerciseId: number;
  visible: boolean;
  userId: number;
}

export interface SavedTestCase extends NewTestCase {
  id: number;
  fixedId?: number;
  passed?: boolean;
  errorMessage?: string;
}

export interface CoverageOutcome {
  id: number;
  exerciseId: number;
  userId: number;
  lineNo: number;
  lineCovered: boolean;
  conditions: number;
  conditionsCovered: number;
}

export interface User {
  id: number;
  sessionId: string;
}

export const getUserBySessionId = async (sessionId: string): Promise<User> => {
  const encodedSessionId = encodeURI(sessionId);
  return axios
    .get(`users?sessionId=${encodedSessionId}`, config)
    .then(user => user.data);
};

export const createUser = (sessionId: string): Promise<User> =>
  axios.post('users/', {sessionId}, config).then(user => user.data);

export const createExercise = (data: Exercise) =>
  axios.post('exercises', data, config).then(res => res.data);

export const updateExercise = (exerciseId: number, data: SavedExercise) =>
  axios.put(`exercises/${exerciseId}`, data, config);

export const getExercise = (exerciseId: number): Promise<SavedExercise> =>
  axios.get(`exercises/${exerciseId}`, config).then(exercise => {
    return exercise.data;
  });

export const getExercises = (): Promise<SavedExercise[]> =>
  axios.get('exercises', config).then(res => res.data);

export const getTestCases = (
  exerciseId: number,
  userId: number
): Promise<SavedTestCase[]> =>
  axios
    .get(`exercises/${exerciseId}/testCases?userId=${userId}`, config)
    .then(res => res.data);

export const createTestCase = (data: NewTestCase) =>
  axios
    .post(`exercises/${data.exerciseId}/testCases`, data, config)
    .then(res => res.data);

export const createTestCases = (data: NewTestCase[]) =>
  axios.post('testCases/batch', data, config).then(res => res.data);

export const deleteTestCase = (
  testCase: SavedTestCase
): Promise<number | null> =>
  axios
    .delete(`exercises/${testCase.exerciseId}/testCases/${testCase.id}`, config)
    .then(res => res.data);

export const runTests = (
  exerciseId: number,
  userId: number
): Promise<{
  updatedTestCases: SavedTestCase[];
  coverageOutcomes: CoverageOutcome[];
}> => axios.post(`run/${exerciseId}`, {userId}, config).then(res => res.data);

export const getCoverageOutcomes = (
  exerciseId: number,
  userId: number
): Promise<CoverageOutcome[]> =>
  axios
    .get(`exercises/${exerciseId}/coverageOutcomes?userId=${userId}`, config)
    .then(res => res.data);
