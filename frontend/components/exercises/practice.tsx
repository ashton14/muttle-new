import React from 'react';
import { useState } from "react";
import { AttemptFeedback, NewTestCase, SavedExercise, SavedExerciseOffering, SavedTestCase } from "../../lib/api";
import { useAuthenticatedApi } from "../../lib/context/AuthenticatedApiContext";
import ExerciseFooter from "./ExerciseFooter";
import Highlighter from '../code/Highlighter';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import TestCaseTable from '../testCases/TestCaseTable';
import { UserInfo } from '../../lib/context/AuthContext';

const displayTests = (tests: SavedTestCase[]) =>
  tests.filter(test => test.visible && !test.fixedId)
    .sort((t1, t2) =>
      t1.passed && !t2.passed ? -1 : !t1.passed && t2.passed ? 1 : 0
    );

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
  const { id: exerciseId } = exercise;
  const minTests = exerciseOffering?.minTests ? exerciseOffering.minTests : 1 ;
  const operatorsToShow = exerciseOffering?.mutators ? exerciseOffering.mutators : undefined;
  const showMutationFeedback = operatorsToShow ? operatorsToShow.length > 0 : true;
  const showCodeCovFeedback = exerciseOffering?.conditionCoverage ? exerciseOffering.conditionCoverage : true;

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
   * Verifies the minimum number of tests have been met.
   */
  const checkTests = () => {
    const testsToSave = newTests.filter(({ input, output }) => input || output);
    if (tests.length + testsToSave.length < minTests) {
      return false;
    }
    return true;
  }

  /**
   * Saves and runs the current set of tests for the exercise.
   */
  const runTests = async () => {
    console.log('exercise offering: ', exerciseOffering)

    //runs this function then runTests from authenticated.ts.
    //Uses exerciseOffering prop from Practice component but value is not supplied
    //when Practice component is created in index.tsx

    const testsToSave = newTests.filter(({ input, output }) => input || output);
    const testsToUpdate = tests
      .map(test => ({ ...test, exerciseId, userId: user.id }));

    setRunning(true);
    const attempt = await runTestCases({
      exerciseId,
      userId: user.id,
      exerciseOfferingId: exerciseOffering?.id,
      testCases: testsToSave.concat(testsToUpdate)
    });
    setTests(displayTests(attempt.testCases));
    setNewTests([]);

    setAttemptFeedback(attempt);
    setRunning(false);
  };

  const coverageOutcomes = attemptFeedback?.coverageOutcomes || [];
  const mutationOutcomes = attemptFeedback?.mutationOutcomes || [];

  const filteredMutationOutcomes = operatorsToShow == undefined ?
    mutationOutcomes : 
    mutationOutcomes.filter(o => operatorsToShow.includes(o.operator));

  return (
    <Container>
      <h1>
        {exercise.name}{' '}
      </h1>

      <p>{exercise.description}</p>
      <Highlighter
        value={exercise.snippet}
        options={{
          lineNumbers: true,
          gutters: ['CodeMirror-linenumbers', 'coverage-gutter'],
        }}
        coverageOutcomes={showCodeCovFeedback ? coverageOutcomes : []}
        mutationOutcomes={showMutationFeedback ? filteredMutationOutcomes : []}
        className="border rounded h-auto mb-4"
        exerciseOffering={exerciseOffering}
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
      {!checkTests() ? <>Minimum Tests: {minTests}</> : <></>}
      <ExerciseFooter
        disabled={running || (!tests.length && !newTests.length) || !checkTests()}
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
