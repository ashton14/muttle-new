import axios from 'axios';
import {AuthInfo} from './context/AuthContext';
import {getPublicEndpoints} from './api/public';
import {getAuthenticatedEndpoints} from './api/authenticated';

const baseURL = process.env.MUTTLE_API_URL;

export interface Exercise {
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

export interface MutatedLine {
  lineNo: number;
  mutatedSource: string;
}

export interface MutationOutcome {
  exception_traceback: string;
  killer: string;
  mutations?: {
    lineno: number;
    operator: string;
    mutatedLines: MutatedLine[];
  }[];
  number: number;
  status: string;
  tests_run: number;
  time: number;
}

export interface SignupInfo {
  email: string;
  password: string;
  name: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

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
