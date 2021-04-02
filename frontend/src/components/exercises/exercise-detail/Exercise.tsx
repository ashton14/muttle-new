import React, {useEffect, useState, useContext} from 'react';
import {useHistory, useParams} from 'react-router-dom';
import {UserContext} from '../../app/App';

import {
  CoverageOutcome,
  createTestCase,
  deleteTestCase,
  getCoverageOutcomes,
  getExercise,
  getMutationOutcomes,
  getTestCases,
  MutationOutcome,
  NewTestCase,
  runTests as runTestCases,
  SavedExercise,
  SavedTestCase,
  User,
} from '../../../lib/api';
import TestCaseTable from '../../testcases/TestCaseTable';
import Container from 'react-bootstrap/Container';
import Highlighter from '../../code/Highlighter';
import Row from 'react-bootstrap/Row';
import FeedbackTable from '../../feedback/FeedbackTable';
import ExerciseFooter from './ExerciseFooter';

const SHOW_ACTUAL = true;

interface RouteParams {
  exerciseId: string;
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
  const [coverageOutcomes, setCoverageOutcomes] = useState<CoverageOutcome[]>(
    []
  );
  const [mutationOutcomes, setMutationOutcomes] = useState<MutationOutcome[]>(
    []
  );
  const [running, setRunning] = useState<boolean>(false);

  const history = useHistory();
  const {exerciseId: idString} = useParams<RouteParams>();
  const exerciseId = parseInt(idString);

  const user: User = useContext(UserContext);

  useEffect(() => {
    if (user) {
      Promise.all([
        getExercise(exerciseId),
        getTestCases(exerciseId, user.id),
        getCoverageOutcomes(exerciseId, user.id),
        getMutationOutcomes(exerciseId, user.id),
      ]).then(([exercise, tests, coverageOutcomes, mutationOutcomes]) => {
        if (!exercise) {
          history.push('/exercises');
        }
        setExercise(exercise);
        setTests(displayTests(tests));
        setCoverageOutcomes(coverageOutcomes);
        setMutationOutcomes(mutationOutcomes);
      });
    } else {
      return;
    }
  }, [history, exerciseId, user]);

  if (!exercise) {
    return <div />;
  }

  const createNewTest = () => {
    setNewTests(prevTests =>
      prevTests.concat([
        {input: '', output: '', exerciseId, visible: true, userId: user.id},
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
      const updatedTest = {...prevTests[index], [key]: replaceSmartKeys(value)};
      return [
        ...prevTests.slice(0, index),
        updatedTest,
        ...prevTests.slice(index + 1, prevTests.length),
      ];
    });

  const editSavedTest = (key: string, index: number) => (value: string) =>
    setTests(prevTests => {
      const updatedTest = {...prevTests[index], [key]: replaceSmartKeys(value)};
      return [
        ...prevTests.slice(0, index),
        updatedTest,
        ...prevTests.slice(index + 1, prevTests.length),
      ];
    });

  const saveTests = () => {
    const testsToSave = newTests.filter(({input, output}) => input || output);
    const testsToUpdate = tests
      .filter(({passed}) => !passed)
      .map(test => ({...test, exerciseId, userId: user.id}));

    return Promise.all(testsToSave.concat(testsToUpdate).map(createTestCase));
  };

  const runTests = async () => {
    setRunning(true);
    const {coverageOutcomes, mutationOutcomes} = await runTestCases(
      exerciseId,
      user.id
    );

    const tests = await getTestCases(exerciseId, user.id, SHOW_ACTUAL);
    setTests(displayTests(tests));
    setNewTests([]);
    setMutationOutcomes(mutationOutcomes);
    setCoverageOutcomes(coverageOutcomes);
    setRunning(false);
  };

  return (
    <Container>
      <h1>{exercise.name}</h1>
      <p>{exercise.description}</p>
      <Highlighter
        value={exercise.snippet}
        options={{
          lineNumbers: true,
          gutters: ['CodeMirror-linenumbers', 'coverage-gutter'],
        }}
        coverageOutcomes={coverageOutcomes}
        className="border rounded h-auto mb-4"
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
        <FeedbackTable mutationOutcomes={mutationOutcomes} />
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
