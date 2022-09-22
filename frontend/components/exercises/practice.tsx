import React from 'react';
import { useRouter } from "next/router";
import { useState } from "react";
import { AttemptFeedback, NewTestCase, SavedExercise, SavedExerciseOffering, SavedTestCase } from "../../lib/api";
import { useAuthenticatedApi } from "../../lib/context/AuthenticatedApiContext";
import ExerciseFooter from "./ExerciseFooter";
import Highlighter from '../code/Highlighter';
import Row from 'react-bootstrap/Row';
import { Button } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import TestCaseTable from '../testCases/TestCaseTable';
import { UserInfo } from '../../lib/context/AuthContext';

const displayTests = (tests: SavedTestCase[]) =>
  tests
    .filter(test => test.visible && !test.fixedId)
    .sort((t1, t2) =>
      t1.passed && !t2.passed ? -1 : !t1.passed && t2.passed ? 1 : 0
    );

const SHOW_ACTUAL = true;

export enum FeedbackType {
  NO_FEEDBACK,
  CODE_COVERAGE,
  MUTATION_ANALYSIS,
  ALL_FEEDBACK,
}

export interface PracticeProps {
  user: UserInfo;
  exercise: SavedExercise;
  exerciseOffering?: SavedExerciseOffering;
  initialTests: SavedTestCase[];
  initialAttemptFeedback?: AttemptFeedback;
};

export default function Practice({ user, exercise, exerciseOffering, initialTests, initialAttemptFeedback }: PracticeProps) {
  const [tests, setTests] = useState<SavedTestCase[]>([]);
  const [newTests, setNewTests] = useState<NewTestCase[]>(displayTests(initialTests));
  const [running, setRunning] = useState<boolean>(false);
  const [attemptFeedback, setAttemptFeedback] = useState(initialAttemptFeedback);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(
    FeedbackType.ALL_FEEDBACK
  );

  const router = useRouter();
  const { id: exerciseId } = exercise;

  const {
    deleteTestCase,
    runTests: runTestCases,
  } = useAuthenticatedApi();

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

  /**
   * Saves and runs the current set of tests for the exercise.
   */
  const runTests = async () => {
    const testsToSave = newTests.filter(({ input, output }) => input || output);
    const testsToUpdate = tests
      .filter(({ passed }) => !passed)
      .map(test => ({ ...test, exerciseId, userId: user.id }));

    setRunning(true);
    const attempt = await runTestCases(exerciseId, user.id, testsToSave.concat(testsToUpdate));
    setTests(displayTests(attempt.testCases));
    setNewTests([]);

    setAttemptFeedback(attempt);
    setRunning(false);
  };

  const { coverageOutcomes, mutationOutcomes } = attemptFeedback || {
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
