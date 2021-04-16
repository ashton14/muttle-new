import axios, {AxiosRequestConfig} from 'axios';

const backendPort = 3000;
const {protocol, hostname} = window.location;
const baseURL = `${protocol}//${hostname}:${backendPort}/api/`;

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
  actual?: string;
  errorMessage?: string;
}

export interface AttemptFeedback {
  results: SavedTestCase[];
  coverageOutcomes?: CoverageOutcome[];
  mutationOutcomes?: MutationOutcome[];
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

export interface MutationOutcome {
  exception_traceback: string;
  killer: string;
  mutations?: {
    lineno: number;
    operator: string;
  }[];
  number: number;
  status: string;
  tests_run: number;
  time: number;
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

export const createExercise = (data: Exercise): Promise<SavedExercise> =>
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
  userId: number,
  actual = false
): Promise<SavedTestCase[]> =>
  axios
    .get(`exercises/${exerciseId}/testCases`, {
      ...config,
      params: {userId, actual},
    })
    .then(res => res.data);

export const createTestCase = (data: NewTestCase): Promise<SavedTestCase> =>
  axios
    .post(`exercises/${data.exerciseId}/testCases`, data, config)
    .then(res => res.data);

export const createTestCases = (
  data: NewTestCase[]
): Promise<SavedTestCase[]> =>
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
): Promise<AttemptFeedback> =>
  axios.post(`run/${exerciseId}`, {userId}, config).then(res => res.data);

export const getLatestAttempt = (
  exerciseId: number,
  userId: number
): Promise<AttemptFeedback> =>
  axios
    .get(`exercises/${exerciseId}/attempts/latest?userId=${userId}`, config)
    .then(res => res.data);
