import axios from 'axios';

const baseURL = 'http://localhost:3000/api/';

export interface ExerciseModel {
  id: number;
  name: string;
  description: string;
  snippet: string;
}

export interface TestCaseModel {
  input: string;
  output: string;
  exerciseId: number;
  visible: boolean;
}

export interface SavedTestCaseModel extends TestCaseModel {
  id: number;
  fixedId?: number;
  passed?: boolean;
}

export const getExercise = (exerciseId: number): Promise<ExerciseModel> =>
  axios.get(`exercises/${exerciseId}`, {baseURL}).then(exercise => {
    return exercise.data;
  });

export const getExercises = (): Promise<ExerciseModel[]> =>
  axios.get('exercises', {baseURL}).then(res => res.data);

export const getTestCases = (exerciseId: number): Promise<SavedTestCaseModel[]> =>
  axios
    .get(`testCases?exerciseId=${exerciseId}`, {baseURL})
    .then(res => res.data);

export const newTestCase = (data: TestCaseModel) =>
  axios.post('testCases', data, {baseURL}).then(res => res.data);

export const newTestCases = (data: TestCaseModel[]) =>
  axios.post('testCases/batch', data, {baseURL}).then(res => res.data);

export const deleteTestCase = (testCaseId: number): Promise<number | null> =>
  axios
    .delete(`testCases/${testCaseId}`, {baseURL})
    .then(res => res.data.affected);

export const runTests = (exerciseId: number): Promise<SavedTestCaseModel[]> =>
  axios.post(`run/${exerciseId}`, {}, {baseURL}).then(res => res.data);
