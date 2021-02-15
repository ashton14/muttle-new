import React, {useEffect, useState, useContext} from 'react';
import {useHistory, useParams} from 'react-router-dom';
import {
  deleteTestCase,
  SavedExercise,
  getExercise,
  getTestCases,
  createTestCase,
  runTests,
  SavedTestCase,
  NewTestCase,
  User,
  CoverageOutcome,
  getCoverageOutcomes,
} from '../../utils/api';
import {UserContext} from '../App';

import TestCase from '../testcases/TestCase';
import TestCaseTable from '../testcases/TestCaseTable';
import Container from 'react-bootstrap/Container';
import {Button} from 'react-bootstrap';
import Highlighter from '../code/Highlighter';
import Row from 'react-bootstrap/Row';

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
      ]).then(([exercise, tests, coverageOutcomes]) => {
        if (!exercise) {
          history.push('/exercises');
        }
        setExercise(exercise);
        setTests(displayTests(tests));
        setCoverageOutcomes(coverageOutcomes);
      });
    } else {
      return;
    }
  }, [history, exerciseId, user]);

  if (!exercise) {
    return <div />;
  }

  const newTest = () => {
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

  const deleteTest = (index: number) => async () => {
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
      const updatedTest = {...prevTests[index], [key]: value};
      return [
        ...prevTests.slice(0, index),
        updatedTest,
        ...prevTests.slice(index + 1, prevTests.length),
      ];
    });

  const editTest = (key: string, index: number) => (value: string) =>
    setTests(prevTests => {
      const updatedTest = {...prevTests[index], [key]: value};
      return [
        ...prevTests.slice(0, index),
        updatedTest,
        ...prevTests.slice(index + 1, prevTests.length),
      ];
    });

  const saveTestCases = () => {
    const testsToSave = newTests.filter(({input, output}) => input || output);
    const testsToUpdate = tests
      .filter(({passed}) => !passed)
      .map(test => ({...test, exerciseId, userId: user.id}));

    return Promise.all(testsToSave.concat(testsToUpdate).map(createTestCase));
  };

  const runAllTests = async () => {
    const {coverageOutcomes} = await runTests(exerciseId, user.id);
    const tests = await getTestCases(exerciseId, user.id);
    setTests(displayTests(tests));
    setNewTests([]);
    setCoverageOutcomes(coverageOutcomes);
  };

  return (
    <Container>
      <h1>{exercise.name}</h1>
      <p>{exercise.description}</p>
      <Highlighter
        value={exercise.snippet}
        options={{lineNumbers: true}}
        coverage={{
          covered: [
            {
              from: {line: 4, ch: 0},
              to: {line: 4, ch: 100},
            },
            {
              from: {line: 5, ch: 0},
              to: {line: 5, ch: 100},
            },
            {
              from: {line: 6, ch: 0},
              to: {line: 6, ch: 100},
            },
          ],
          uncovered: [
            {
              from: {line: 7, ch: 0},
              to: {line: 7, ch: 100},
            },
          ],
        }}
        className="border rounded h-auto mb-4"
      />
      <TestCaseTable>
        {tests.map(({input, output, passed}, i) => (
          <TestCase
            key={`test-${i}`}
            input={input}
            setInput={editTest('input', i)}
            output={output}
            setOutput={editTest('output', i)}
            deleteTestCase={deleteTest(i)}
            passed={passed}
          />
        ))}
        {newTests.map(({input, output}, i) => (
          <TestCase
            key={`newTest-${i}`}
            input={input}
            setInput={editNewTest('input', i)}
            output={output}
            setOutput={editNewTest('output', i)}
            deleteTestCase={deleteNewTest(i)}
            passed={null}
          />
        ))}
      </TestCaseTable>
      <Row className="w-50 justify-content-center">
        <Button className="w-auto m-2" onClick={newTest}>
          <i className="fas fa-plus-square" aria-hidden="true" /> New Test
        </Button>
        <Button
          className="w-auto m-2"
          onClick={() => saveTestCases().then(runAllTests)}
        >
          <i className="fas fa-rocket" aria-hidden="true" /> Launch!
        </Button>
      </Row>
    </Container>
  );
};

export default Exercise;
