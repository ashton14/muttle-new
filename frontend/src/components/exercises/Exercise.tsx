import React, {useEffect, useState, useContext} from 'react';
import {useHistory, useParams} from 'react-router-dom';
import SyntaxHighlighter from 'react-syntax-highlighter';
import Container from 'react-bootstrap/cjs/Container';
import {Button} from 'react-bootstrap';

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
} from '../../utils/api';
import TestCase from '../testcases/TestCase';
import TestCaseTable from '../testcases/TestCaseTable';
import {UserContext} from '../App';

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
      .map(test => ({...test, exerciseId}));

    return Promise.all(testsToSave.concat(testsToUpdate).map(createTestCase));
  };

  const runAllTests = async () => {
    const {coverageOutcomes} = await runTests(exerciseId, user.id);
    const tests = await getTestCases(exerciseId);
    setTests(displayTests(tests));
    setNewTests([]);
    setCoverageOutcomes(coverageOutcomes);
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
        lineProps={lineNumber => {
          const style: {display: string; backgroundColor?: string} = {
            display: 'block',
          };

          const line = coverageOutcomes.find(
            outcome => outcome.lineNo === lineNumber
          );

          if (line) {
            if (line.lineCovered) {
              style.backgroundColor = '#dbffdb';
            } else {
              style.backgroundColor = '#ffecec';
            }
          }

          return {style};
        }}
      >
        {exercise.snippet}
      </SyntaxHighlighter>
      <div className="row justify-content-center">
        <TestCaseTable>
          {tests.map(({input, output, passed, errorMessage}, i) => (
            <TestCase
              key={`test-${i}`}
              input={input}
              setInput={editTest('input', i)}
              output={output}
              setOutput={editTest('output', i)}
              deleteTestCase={deleteTest(i)}
              passed={passed}
              errorMessage={errorMessage}
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
