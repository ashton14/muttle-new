import React, {useEffect, useState} from 'react';
import {useHistory, useParams} from 'react-router-dom';
import SyntaxHighlighter from 'react-syntax-highlighter';

import {
  deleteTestCase,
  SavedExercise,
  getExercise,
  getTestCases,
  newTestCase,
  runTests,
  SavedTestCase,
  NewTestCase,
} from '../../api';
import TestCase from '../testcases/TestCase';
import TestCaseTable from '../testcases/TestCaseTable';
import Container from 'react-bootstrap/cjs/Container';
import {Button} from 'react-bootstrap';

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

  const history = useHistory();
  const {exerciseId: idString} = useParams<RouteParams>();
  const exerciseId = parseInt(idString);

  useEffect(() => {
    Promise.all([getExercise(exerciseId), getTestCases(exerciseId)]).then(
      ([exercise, tests]) => {
        if (!exercise) {
          history.push('/exercises');
        }
        setExercise(exercise);
        setTests(displayTests(tests));
      }
    );
  }, [history, exerciseId]);

  if (!exercise) {
    return <div></div>;
  }

  const newTest = () => {
    setNewTests(prevTests =>
      prevTests.concat([{input: '', output: '', exerciseId, visible: true}])
    );
  };

  const deleteNewTest = (index: number) => () =>
    setNewTests(prevTests =>
      prevTests
        .slice(0, index)
        .concat(prevTests.slice(index + 1, prevTests.length))
    );

  const deleteTest = (index: number) => async () => {
    const wasDeleted = await deleteTestCase(tests[index].id);
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
      .map(test => ({...test, exerciseId}));

    return Promise.all(testsToSave.concat(testsToUpdate).map(newTestCase));
  };

  const runAllTests = async () => {
    await runTests(exerciseId);
    const tests = await getTestCases(exerciseId);
    setTests(displayTests(tests));
    setNewTests([]);
  };

  return (
    <Container className="text-center">
      <h1>{exercise.name}</h1>
      <p>{exercise.description}</p>
      <SyntaxHighlighter
        className="text-left"
        language="python"
        wrapLines={true}
        showLineNumbers
      >
        {exercise.snippet}
      </SyntaxHighlighter>
      <div className="row justify-content-center">
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
              id={i}
              input={input}
              setInput={editNewTest('input', i)}
              output={output}
              setOutput={editNewTest('output', i)}
              deleteTestCase={deleteNewTest(i)}
              passed={null}
            />
          ))}
        </TestCaseTable>
      </div>
      <Button className="w-auto" variant="success" onClick={newTest}>
        <i className="fas fa-plus-square" aria-hidden="true" /> New Test
      </Button>
      <Button
        className="w-auto"
        onClick={() => saveTestCases().then(runAllTests)}
      >
        <i className="fas fa-rocket" aria-hidden="true" /> Launch!
      </Button>
    </Container>
  );
};

export default Exercise;
