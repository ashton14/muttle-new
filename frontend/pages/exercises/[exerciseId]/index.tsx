import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Row from 'react-bootstrap/Row';
import { Button } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import ExerciseFooter from '../../../components/exercises/ExerciseFooter';
import {
  AttemptFeedback,
  NewTestCase,
  SavedExercise,
  SavedTestCase,
} from '../../../lib/api';
import { useAuthenticatedApi } from '../../../lib/context/AuthenticatedApiContext';
import { Auth, useAuth } from '../../../lib/context/AuthContext';
import { HighlighterProps } from '../../../components/code/Highlighter';
import { TestCasesTableProps } from '../../../components/testCases/TestCaseTable';

const Highlighter = dynamic<HighlighterProps>(
  () => import('../../../components/code/Highlighter'),
  { ssr: false }
);
const TestCaseTable = dynamic<TestCasesTableProps>(
  () => import('../../../components/testCases/TestCaseTable'),
  { ssr: false }
);

const SHOW_ACTUAL = true;

export enum FeedbackType {
  NO_FEEDBACK,
  CODE_COVERAGE,
  MUTATION_ANALYSIS,
  ALL_FEEDBACK,
}

const displayTests = (tests: SavedTestCase[]) =>
  tests
    .filter(test => test.visible && !test.fixedId)
    .sort((t1, t2) =>
      t1.passed && !t2.passed ? -1 : !t1.passed && t2.passed ? 1 : 0
    );

const Exercise = () => {
  const [exercise, setExercise] = useState<SavedExercise>();
  const [tests, setTests] = useState<SavedTestCase[]>([]);
  const [newTests, setNewTests] = useState<NewTestCase[]>([]);
  const [attemptFeedback, setAttemptFeedback] = useState<AttemptFeedback>();
  const [running, setRunning] = useState<boolean>(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(
    FeedbackType.ALL_FEEDBACK
  );

  const router = useRouter();
  const idParam = router.query.exerciseId as string;

  const {
    authInfo: { userInfo: user },
  }: Auth = useAuth();

  const {
    getExercise,
    getTestCases,
    getLatestAttempt,
    deleteTestCase,
    createTestCase,
    runTests: runTestCases,
  } = useAuthenticatedApi();
  const exerciseId = parseInt(idParam);

  useEffect(() => {
    if (user) {
      Promise.all([
        getExercise(exerciseId),
        getTestCases(exerciseId, user.id),
        getLatestAttempt(exerciseId, user.id),
      ]).then(([exercise, tests, attempt]) => {
        if (!exercise) {
          router.push('/exercises');
        }
        setExercise(exercise);
        setTests(displayTests(tests));
        setAttemptFeedback(attempt);
      });
    }
  }, [router, exerciseId, user, getExercise, getTestCases, getLatestAttempt]);

  if (!user) {
    router.push('/');
    return null;
  }

  if (!exercise) {
    return null;
  }

  const createNewTest = () => {
    setNewTests(prevTests =>
      prevTests.concat([
        { input: '', output: '', exerciseId, visible: true, userId: user.id },
      ])
    );
  };

  const deleteNewTest = (index: number) => () =>
    setNewTests(prevTests =>
      prevTests
        .slice(0, index)
        .concat(prevTests.slice(index + 1, prevTests.length))
    );

  const deleteSavedTest = (index: number) => async () => {
    const wasDeleted = await deleteTestCase(tests[index]);
    if (wasDeleted) {
      setTests(prevTests =>
        prevTests
          .slice(0, index)
          .concat(prevTests.slice(index + 1, prevTests.length))
      );
    }
  };

  const editNewTest = (key: string, index: number) => (value: string) =>
    setNewTests(prevTests => {
      const updatedTest = {
        ...prevTests[index],
        [key]: replaceSmartKeys(value),
      };
      return [
        ...prevTests.slice(0, index),
        updatedTest,
        ...prevTests.slice(index + 1, prevTests.length),
      ];
    });

  const editSavedTest = (key: string, index: number) => (value: string) =>
    setTests(prevTests => {
      const updatedTest = {
        ...prevTests[index],
        [key]: replaceSmartKeys(value),
      };
      return [
        ...prevTests.slice(0, index),
        updatedTest,
        ...prevTests.slice(index + 1, prevTests.length),
      ];
    });

  const saveTests = () => {
    const testsToSave = newTests.filter(({ input, output }) => input || output);
    const testsToUpdate = tests
      .filter(({ passed }) => !passed)
      .map(test => ({ ...test, exerciseId, userId: user.id }));

    return Promise.all(testsToSave.concat(testsToUpdate).map(createTestCase));
  };

  const runTests = async () => {
    setRunning(true);
    const attempt = await runTestCases(exerciseId, user.id);
    const tests = await getTestCases(exerciseId, user.id, SHOW_ACTUAL);
    setTests(displayTests(tests));
    setNewTests([]);

    setAttemptFeedback(attempt);
    setRunning(false);
  };

  const { coverageOutcomes, mutationOutcomes } = attemptFeedback || {
    results: [],
    coverageOutcomes: [],
    mutationOutcomes: [],
  };

  const toggleFeedbackType = buttonType => {
    setFeedbackType(
      feedbackType === buttonType ? FeedbackType.ALL_FEEDBACK : buttonType
    );
  };

  return (
    <Container>
      <h1>
        {exercise.name}{' '}
        <Button
          size="sm"
          variant="outline-secondary"
          onClick={() => toggleFeedbackType(FeedbackType.NO_FEEDBACK)}
        >
          NC
        </Button>{' '}
        <Button
          size="sm"
          variant="outline-secondary"
          onClick={() => toggleFeedbackType(FeedbackType.CODE_COVERAGE)}
        >
          CC
        </Button>{' '}
        <Button
          size="sm"
          variant="outline-secondary"
          onClick={() => toggleFeedbackType(FeedbackType.MUTATION_ANALYSIS)}
        >
          MA
        </Button>
      </h1>

      <p>{exercise.description}</p>

      <Highlighter
        value={exercise.snippet}
        options={{
          lineNumbers: true,
          gutters: ['CodeMirror-linenumbers', 'coverage-gutter'],
        }}
        coverageOutcomes={coverageOutcomes}
        mutationOutcomes={mutationOutcomes}
        className="border rounded h-auto mb-4"
        feedbackType={feedbackType}
      />
      <Row>
        <TestCaseTable
          savedTests={tests}
          editSavedTest={editSavedTest}
          deleteSavedTest={deleteSavedTest}
          newTests={newTests}
          createNewTest={createNewTest}
          editNewTest={editNewTest}
          deleteNewTest={deleteNewTest}
          running={running}
        />
      </Row>
      <ExerciseFooter
        disabled={running || (!tests.length && !newTests.length)}
        running={running}
        saveTests={saveTests}
        runTests={runTests}
      />
    </Container>
  );
};

const smartKeyReplacements = new Map<string, string>([
  ['‘', "'"],
  ['’', "'"],
  ['“', '"'],
  ['”', '"'],
]);

const smarkKeysRegex = new RegExp(
  Array.from(smartKeyReplacements.keys()).join('|'),
  'gi'
);

const replaceSmartKeys = (str: string) =>
  str.replace(smarkKeysRegex, smartKey => {
    const replacement = smartKeyReplacements.get(smartKey);
    return replacement !== undefined ? replacement : smartKey;
  });

export default Exercise;
