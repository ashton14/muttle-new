import axios, {AxiosRequestConfig} from 'axios';

const baseURL = 'http://localhost:3000/api/';
const config: AxiosRequestConfig = {baseURL};

interface NewExercise {
  name: string;
  description: string;
  snippet: string;
}

export interface SavedExercise extends NewExercise {
  id: number;
}

export interface NewTestCase {
  input: string;
  output: string;
  exerciseId: number;
  visible: boolean;
}

export interface SavedTestCase extends NewTestCase {
  id: number;
  fixedId?: number;
  passed?: boolean;
}

export const newExercise = (data: NewExercise) =>
  axios.post('exercises', data, config).then(res => res.data);

export const getExercise = (exerciseId: number): Promise<SavedExercise> =>
  axios.get(`exercises/${exerciseId}`, config).then(exercise => {
    return exercise.data;
  });

export const getExercises = (): Promise<SavedExercise[]> =>
  axios.get('exercises', config).then(res => res.data);

export const getTestCases = (exerciseId: number): Promise<SavedTestCase[]> =>
  axios.get(`testCases?exerciseId=${exerciseId}`, config).then(res => res.data);

export const newTestCase = (data: NewTestCase) =>
  axios.post('testCases', data, config).then(res => res.data);

export const newTestCases = (data: NewTestCase[]) =>
  axios.post('testCases/batch', data, config).then(res => res.data);

export const deleteTestCase = (testCaseId: number): Promise<number | null> =>
  axios
    .delete(`testCases/${testCaseId}`, config)
    .then(res => res.data.affected);

export const runTests = (exerciseId: number): Promise<SavedTestCase[]> =>
  axios.post(`run/${exerciseId}`, {}, config).then(res => res.data);
