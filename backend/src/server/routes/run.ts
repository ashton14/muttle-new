import express, {Request, Response} from 'express';
import {getRepository} from 'typeorm';
import {Exercise} from '../../entity/Exercise';
import {spawn} from 'child_process';
import * as fs from 'fs';
import {
  buildTestsFile,
  buildTestSnippet,
  getFunctionName,
  PYTEST_REPORT_FILENAME,
  SNIPPET_FILENAME,
  TESTS_FILENAME,
} from '../../utils/pythonUtils';
import * as util from 'util';
import {TestCase} from '../../entity/TestCase';

const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

const run = express.Router();

run.post('/:id', async (req: Request, res: Response) => {
  const exercise = await getRepository(Exercise).findOne(req.params.id, {
    relations: ['testCases'],
  });

  if (exercise) {
    const testCases = exercise.testCases.filter(test => !test.fixedId);

    const functionName = getFunctionName(exercise.snippet) || '';
    if (!functionName) {
      res.sendStatus(500); // TODO - better error handling? Validate during creation and populate field?
    }

    await writeFile(SNIPPET_FILENAME, exercise.snippet);

    const testSnippets = testCases.map(({input, output}, i) => {
      const resultAsNumber = Number(output);
      const isFloat =
        !Number.isNaN(resultAsNumber) && !Number.isSafeInteger(resultAsNumber);

      return buildTestSnippet(i, functionName, input, output, isFloat);
    });

    await writeFile(TESTS_FILENAME, buildTestsFile(functionName, testSnippets));

    process.chdir('usr');
    // const python = spawn('python3', ['-m', 'unittest', 'tests']);
    const python = spawn('pytest', [
      '--json-report',
      'tests.py',
      '--json-report-omit',
      'keywords',
      'collectors',
    ]);

    python.on('close', async () => {
      const reportData = await readFile(PYTEST_REPORT_FILENAME);
      const testResults = JSON.parse(reportData.toString()).tests;

      const testRepo = getRepository(TestCase);

      const updatedTestCases = testCases.map((test, i) =>
        testRepo.merge(test, {
          passed: testResults[i].outcome === 'passed',
        })
      );

      await testRepo.save(updatedTestCases);

      process.chdir('..');
      res.json(updatedTestCases);
    });
  } else {
    res.sendStatus(404);
  }
});

export default run;
