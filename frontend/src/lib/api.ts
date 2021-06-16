import axios from 'axios';
import {AuthInfo} from './context/AuthContext';
import {
  AttemptFeedback,
  Exercise,
  NewTestCase,
  SavedExercise,
  SavedTestCase,
  SignupInfo,
  UserCredentials,
} from './models';
import {getPublicEndpoints} from './api/public';
import {getAuthenticatedEndpoints} from './api/authenticated';

const backendPort = 3000;
const {protocol, hostname} = window.location;
const baseURL = `${protocol}//${hostname}:${backendPort}/api/`;

/**
 * Describes the public API, accessible without user authentication.
 */
export interface PublicApi {
  signup(info: SignupInfo): Promise<AuthInfo>;
  login(credentials: UserCredentials): Promise<AuthInfo>;
}

/**
 * Gets an object with all the publicly accessible routes, configured with the
 * appropriate base URL.
 *
 * @returns object with all public endpoints.
 */
export const getPublicApi = (): PublicApi =>
  getPublicEndpoints(axios.create({baseURL}));

/**
 * Describes the authenticated API, accessible only after authentication.
 */
export interface AuthenticatedApi {
  // Exercises
  createExercise(exercise: Exercise): Promise<SavedExercise>;
  getExercise(exerciseId: number): Promise<SavedExercise>;
  getExercises(): Promise<SavedExercise[]>;
  updateExercise(
    exerciseId: number,
    exercise: SavedExercise
  ): Promise<SavedExercise>;
  // Test Cases
  getTestCases(
    exerciseId: number,
    userId: number,
    actual?: boolean
  ): Promise<SavedTestCase[]>;
  createTestCase(testCase: NewTestCase): Promise<SavedTestCase>;
  deleteTestCase(testCase: SavedTestCase): Promise<number | null>;
  // Misc
  runTests(exerciseId: number, userId: number): Promise<AttemptFeedback>;
  getLatestAttempt(
    exerciseId: number,
    userId: number
  ): Promise<AttemptFeedback>;
}

/**
 * Returns the configured, authenticated API with the given JWT token attached
 * to the authorization header.
 *
 * @param {string} token -
 * @returns object with all authenticated endpoints.
 */
export const getAuthenticatedApi = (token: string): AuthenticatedApi => {
  const api = axios.create({baseURL});

  api.interceptors.request.use(({headers, ...rest}) => {
    const headersWithAuth = {
      ...headers,
      Authorization: `Bearer ${token}`,
    };

    return {
      ...rest,
      headers: headersWithAuth,
    };
  });

  return getAuthenticatedEndpoints(api);
};
