import axios from 'axios';
import {AuthInfo} from './context/AuthContext';
import {getPublicEndpoints} from './api/public';
import {getAuthenticatedEndpoints} from './api/authenticated';

const baseURL = process.env.NEXT_PUBLIC_API_URL;

export interface User{
  id: number,
  email: string,
  name: string
}

export interface Exercise {
  name: string;
  description: string;
  snippet: string;
  owner: User;
}

export interface SavedExercise extends Exercise {
  id: number;
  errorMessage?: string;
}

export interface ExerciseOffering {
  exerciseId: number;
  conditionCoverage: boolean;
  mutators: string[];
  minTests?: number;
  hideCode?: boolean;
}

export interface SavedExerciseOffering extends ExerciseOffering {
  id: number;
  inviteCode: string;
  exercise: SavedExercise;
  created: Date;
  users: User[];
  hideCode?: boolean;
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

export interface AttemptRequest {
  userId: number,
  exerciseId: number,
  exerciseOfferingId?: number
};

export interface RunTestRequest {
  exerciseId: number,
  exerciseOfferingId?: number,
  userId: number,
  testCases: (NewTestCase | SavedTestCase)[]
};


export interface AttemptFeedback {
  id: number;
  userId: number;
  testCases: SavedTestCase[];
  coverageOutcomes?: CoverageOutcome[];
  mutationOutcomes?: MutationOutcome[];
  created: Date;
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

export interface Mutation {
  mutatedLines: MutatedLine[];
  addedLines?: MutatedLine[];
  removedLines?: MutatedLine[];
  mutationOutcomes: MutationOutcome[];
  number: number;
  id: number;
  exerciseId: number;
  operator: string;
  equivalent: boolean;
}

export interface MutatedLine {
  lineNo: number;
  mutatedSource: string;
  type?: string;
}

export enum Status {
  KILLED = 'KILLED',
  TIMEOUT = 'TIMEOUT',
  INCOMPETENT = 'INCOMPETENT',
  SURVIVED = 'SURVIVED',
  NONE = 'NONE',
}

const values = Object.values(Status);

export const sortStatus = (o1: Status, o2: Status) =>
  values.indexOf(o1) - values.indexOf(o2);

export interface MutationOutcome {
  id: number;
  exceptionTraceback?: string;
  number: number;
  testsRun: number;
  time: number;
  status: Status;
  mutation: Mutation;
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
  //Mutations
  getMutations(exerciseId: number): Promise<Mutation[]>
  updateMutation(mutation: Mutation): Promise<Mutation>
  // ExerciseOfferings
  createExerciseOffering(exerciseOffering: ExerciseOffering): Promise<SavedExerciseOffering>;
  updateExerciseOffering(exerciseOffering: SavedExerciseOffering): Promise<SavedExerciseOffering>;
  getExerciseOffering(exerciseId: number, exerciseOfferingId: number): Promise<SavedExerciseOffering>;
  getUserAssignments(userId: number): Promise<SavedExerciseOffering[]>;
  getOwnedAssignments(userId: number): Promise<SavedExerciseOffering[]>;
  // Assignments
  getUserAssignment(userId: number, inviteCode: string): Promise<SavedExerciseOffering & { message?: string }>;
  // Test Cases
  deleteTestCase(testCase: SavedTestCase): Promise<number | null>;
  // Misc
  runTests(params: RunTestRequest): Promise<AttemptFeedback>;
  getLatestAttempt(options: AttemptRequest): Promise<AttemptFeedback>;
  getAllLatestAttempts(options: AttemptRequest): Promise<AttemptFeedback[]>;
  getUsers(): Promise<User[]>;
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
