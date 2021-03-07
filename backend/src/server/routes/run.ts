import express, {Request, Response} from 'express';
import {getManager, getRepository} from 'typeorm';
import {Exercise} from '../../entity/Exercise';
import {CoverageOutcome} from '../../entity/CoverageOutcome';
import {spawn} from 'child_process';
import {writeFile, readFile, mkdir} from 'fs/promises';
import {Parser} from 'xml2js';
import {
  buildTestsFile,
  buildTestSnippet,
  getFunctionName,
  ATTEMPTS_DIR,
  PYTEST_REPORT_FILENAME,
  SNIPPET_FILENAME,
  TESTS_FILENAME,
  COVERAGE_REPORT_FILENAME,
} from '../../utils/pythonUtils';
import {TestCase} from '../../entity/TestCase';
import {User} from '../../entity/User';

const run = express.Router();

run.post('/:id', async (req: Request, res: Response) => {
  const entityManager = getManager();

  const user = entityManager.create(User, {id: req.body.userId});

  const exercise = await entityManager
    .createQueryBuilder(Exercise, 'exercise')
    .leftJoinAndSelect(
      'exercise.testCases',
      'testCase',
      'testCase.userId = :userId',
      {userId: user.id}
    )
    .getOne();

  if (exercise) {
    // Only run failing tests that have not yet been fixed
    const testCases = exercise.testCases.filter(
      test => test.visible && !test.fixedId
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
      '--cov=src/',
      '--cov-branch',
      '--cov-report',
      'xml',
    ]);

    python.on('close', async () => {
      const reportData = await readFile(PYTEST_REPORT_FILENAME);
      const testResults = JSON.parse(reportData.toString()).tests;

      const testRepo = getRepository(TestCase);

      // Record test outcomes.
      const updatedTestCases = testCases.map((test, i) => {
        const {outcome, call} = testResults[i];
        const errorMessage = call.crash ? call.crash.message : null;
        return testRepo.merge(test, {
          passed: outcome === 'passed',
          errorMessage: errorMessage,
        });
      });

      await testRepo.save(updatedTestCases);

      // Record coverage outcomes.
      const coverageData = await readFile(COVERAGE_REPORT_FILENAME);
      const xmlParser = new Parser();
      const coverageResults = await xmlParser.parseStringPromise(coverageData);
      const lines =
        coverageResults.coverage.packages[0].package[0].classes[0].class[0]
          .lines[0].line;

      const coverageRepo = await getRepository(CoverageOutcome);
      type covLine = {
        $: {
          number: string;
          hits: string;
          branch?: string;
          'condition-coverage': string;
          'missing-branches': string;
        };
      };

      // TODO: Do we want to void replicating exercise/user/lineNo triplets?
      let coverageOutcomes = lines.map((line: covLine) => {
        const lineNo = parseInt(line.$.number);
        const lineCovered = parseInt(line.$.hits) > 0;
        let conditions = 0;
        let conditionsCovered = 0;
        if (line.$.branch) {
          const conditionCoverage: string = line.$['condition-coverage'];
          const conditionStr: number[] = conditionCoverage
            .split(/\s/)[1]
            .split(/\//)
            .map((cond: string) => parseInt(cond.replace(/[^\d]/g, '')));
          conditionsCovered = conditionStr[0];
          conditions = conditionStr[1];
        }

        const coverageOutcome = {
          lineNo,
          lineCovered,
          conditions,
          conditionsCovered,
          exercise,
          user,
        };

        return coverageOutcome;
      });

      coverageOutcomes = await coverageRepo.save(coverageOutcomes);

      process.chdir(`${workingDir}`);
      res.json({updatedTestCases, coverageOutcomes});
    });
  } else {
    res.sendStatus(404);
  }
});

export default run;
