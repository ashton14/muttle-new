import express, {Request, Response} from 'express';
import {getRepository} from 'typeorm';
import {Exercise} from '../../entity/Exercise';
import {spawn} from 'child_process';
import {writeFile, readFile, mkdir} from 'fs/promises';
import {
  buildTestsFile,
  buildTestSnippet,
  getFunctionName,
  ATTEMPTS_DIR,
  PYTEST_REPORT_FILENAME,
  SNIPPET_FILENAME,
  TESTS_FILENAME,
} from '../../utils/pythonUtils';
import {TestCase} from '../../entity/TestCase';

const run = express.Router();

run.post('/:id', async (req: Request, res: Response) => {
  const exercise = await getRepository(Exercise).findOne(req.params.id, {
    relations: ['testCases'],
  });

  if (exercise) {
    // Only run failing tests that have not yet been fixed
    const testCases = exercise.testCases.filter(
      test => !test.passed && !test.fixedId
    );

    const functionName = getFunctionName(exercise.snippet) || '';
    if (!functionName) {
      // TODO - better error handling? Validate during creation and populate field?
      res.sendStatus(500);
    }

    // TODO: Most of this should go to ../../utils/pythonUtils.js
    const execDir = `${ATTEMPTS_DIR}/${req.params.id}/`;
    await mkdir(`${execDir}/src`, {recursive: true});
    await writeFile(`${execDir}/${SNIPPET_FILENAME}`, exercise.snippet);

    const testSnippets = testCases.map(({input, output}, i) => {
      const resultAsNumber = Number(output);
      const isFloat =
        !Number.isNaN(resultAsNumber) && !Number.isSafeInteger(resultAsNumber);

      return buildTestSnippet(i, functionName, input, output, isFloat);
    });

    await writeFile(
      `${execDir}/${TESTS_FILENAME}`,
      buildTestsFile(functionName, testSnippets)
    );

    const workingDir = process.cwd();
    process.chdir(`${execDir}`);
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

      const updatedTestCases = testCases.map((test, i) => {
        const {outcome, call} = testResults[i];
        const errorMessage = call.crash ? call.crash.message : null;
        return testRepo.merge(test, {
          passed: outcome === 'passed',
          errorMessage: errorMessage,
        });
      });

      await testRepo.save(updatedTestCases);

      process.chdir(`${workingDir}`);
      res.json(updatedTestCases);
    });
  } else {
    res.sendStatus(404);
  }
});

export default run;
