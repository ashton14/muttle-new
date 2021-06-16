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
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface SavedUser extends User {
  id: number;
  sessionId: string;
}

export interface SignupInfo {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}
