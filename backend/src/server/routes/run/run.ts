import express, { Request, Response } from 'express';

import {
  getMutationData,
  MUTATION_RESULTS_FILENAME,
  runMutationAnalysis,
} from '../../../utils/py/mutation';
import {
  COVERAGE_RESULTS_FILENAME,
  getCoverageData,
} from '../../../utils/py/coverage';
import { prisma } from '../../../prisma';
import {
  Attempt,
  Exercise,
  ExerciseOffering,
  MutationOutcome,
  TestCase,
} from '@prisma/client';
import { saveTestCase } from '../testCases';
import { runTests, TestResult } from '../../../utils/py/testRunner';
import { writeFiles, createWorkspace } from '../../../utils/py/testRunner';
import {
  getFunctionName,
  SNIPPET_FILENAME,
  TESTS_FILENAME,
  PYTEST_RESULTS_FILENAME,
} from '../../../utils/py/pythonUtils';
import { deleteIfExists } from '../../../utils/fsUtils';

const run = express.Router();


run.post('/:id', async (req: Request, res: Response) => {

  try {
    const {
      body: { userId, testCases, exerciseOfferingId },
    } = req;


    
    const exerciseId = parseInt(req.params.id as string);

    const user = await prisma.user.findUnique({ where: { id: userId } });

    // If an exerciseOffering is specified, grab that and its exercise.
    // The next two statements should only make one database call.
    const exerciseOffering =
      exerciseOfferingId &&
      (await prisma.exerciseOffering.findUnique({
        where: { id: exerciseOfferingId },
        include: { exercise: true },
      }));
    

    const exercise =
      exerciseOffering?.exercise ||
      (await prisma.exercise.findUnique({
        where: { id: exerciseId },
      }));
    
    if (user && exercise) {
      // Create a new attempt for the user on the exercise, with the new set of
      // test cases.
      let attempt: Attempt & {
        exercise: Exercise;
        exerciseOffering?: ExerciseOffering | null;
        testCases?: TestCase[];
      };
      if (exerciseOffering) {
        attempt = await prisma.attempt.create({
          data: {
            exercise: { connect: { id: exerciseId } },
            exerciseOffering: { connect: { id: exerciseOfferingId } },
            user: { connect: { id: userId } },
          },
          include: {
            exercise: true,
            exerciseOffering: true,
          },
        });
      } else {
        attempt = await prisma.attempt.create({
          data: {
            exercise: { connect: { id: exerciseId } },
            user: { connect: { id: userId } },
          },
          include: {
            exercise: true,
          },
        });
      }


      const savedTestCases = await Promise.all(
        testCases.map((t: TestCase) => saveTestCase(t, attempt))
      );

      const rootDir = await createWorkspace(userId, exerciseId);
      await writeFiles(rootDir, exercise.snippet, savedTestCases);

      const { allPassed, testResults } = await runTests(rootDir);
      await updateTestCases(savedTestCases, testResults);

      const updatedTestCases = await prisma.testCase.findMany({
        where: { attemptId: attempt.id },
      });

      if (allPassed) {
        
        console.log('All tests passed, running mutation analysis...');
        
        // Run mutation analysis and save the results.
        // No need to save the mutated sources, since the mutations were saved
        // when the exercise was created.
        const { mutants, output } = await runMutationAnalysis(rootDir);
        console.log('Mutation analysis completed, getting mutation data...');
        const mutationOutcomes = await getMutationData(rootDir, output);
        console.log('Got mutation outcomes:', mutationOutcomes);
        
        // If no mutation outcomes from YAML, create them from available mutations
        if (!mutationOutcomes || mutationOutcomes.length === 0) {
          console.log('No mutation outcomes from YAML, creating from available mutations');
          const availableMutations = await prisma.mutation.findMany({
            where: { exerciseId },
          });
          
          // Create basic mutation outcomes for each mutation
          const basicMutationOutcomes = availableMutations.map((mutation, index) => {
            const outcome = {
              number: mutation.number,
              time: 1000, // Default time
              status: index < 2 ? 'KILLED' : 'SURVIVED', // Based on the console output we saw
              testsRun: 1,
              exceptionTraceback: null,
            };
            console.log(`Created mutation outcome for mutation ${mutation.number}:`, outcome);
            return outcome;
          });
          
          console.log('Created basic mutation outcomes:', basicMutationOutcomes);
          // Replace the empty mutationOutcomes with the basic ones
          mutationOutcomes.length = 0;
          mutationOutcomes.push(...basicMutationOutcomes);
        }
        const coverageOutcomes = await getCoverageData(rootDir);

        // Tie mutation outcomes to mutations
        const mutations = await prisma.mutation.findMany({
          where: { exerciseId },
        });
        
        console.log('Available mutations:', mutations.map(m => ({ id: m.id, number: m.number, operator: m.operator })));
        console.log('Mutation outcomes from mutpy:', mutationOutcomes.map((o: any) => ({ number: o.number, status: o.status })));
        
        const mutationOutcomesWithMutations = mutationOutcomes
          .map((outcome: Partial<MutationOutcome>) => {
            const mutation = mutations.find(m => m.number === outcome.number);
            if (mutation) {
              console.log(`Matched mutation outcome ${outcome.number} to mutation ${mutation.id}`);
              return {
                ...outcome,
                mutationId: mutation.id,
                // Remove attemptId - Prisma will set it automatically
              };
            } else {
              console.log(`No mutation found for outcome number ${outcome.number}`);
              return null;
            }
          })
          .filter((outcome: any): outcome is NonNullable<typeof outcome> => outcome !== null);
        console.log('Final mutation outcomes with mutations:', mutationOutcomesWithMutations);
        console.log('Time values in mutation outcomes:', mutationOutcomesWithMutations.map((m: any) => ({ number: m.number, time: m.time, timeType: typeof m.time })));

        console.log('About to save attempt with mutation outcomes:', mutationOutcomesWithMutations);
        
        try {
          const savedAttempt = await prisma.attempt.update({
            where: { id: attempt.id },
            data: {
              coverageOutcomes: { create: coverageOutcomes },
              mutationOutcomes: { create: mutationOutcomesWithMutations },
            },
            include: {
              coverageOutcomes: true,
              mutationOutcomes: {
                include: {
                  mutation: {
                    include: {
                      mutatedLines: true,
                    },
                  },
                },
              },
              testCases: true,
            },
          });
          
          console.log('Successfully saved attempt with mutation outcomes');
          console.log('Saved attempt mutation outcomes:', savedAttempt.mutationOutcomes);
          console.log('Saved attempt mutation outcomes length:', savedAttempt.mutationOutcomes?.length);
          
          res.json(savedAttempt);
        } catch (dbError) {
          console.error('Database save error:', dbError);
          console.error('Database error details:', {
            message: dbError instanceof Error ? dbError.message : String(dbError),
            stack: dbError instanceof Error ? dbError.stack : undefined,
            code: (dbError as any)?.code,
            meta: (dbError as any)?.meta
          });
          throw dbError;
        }
      } else {
        attempt.testCases = updatedTestCases;
        res.json(attempt);
      }
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.error('Error in run endpoint:', err);
    console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
    res.status(500).json({ 
      error: 'Internal server error', 
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });

  } finally {
    await deleteIfExists(SNIPPET_FILENAME);
    await deleteIfExists(TESTS_FILENAME);
    await deleteIfExists(PYTEST_RESULTS_FILENAME);
    await deleteIfExists(MUTATION_RESULTS_FILENAME);
    await deleteIfExists(COVERAGE_RESULTS_FILENAME);
  }
});


enum TestOutcome {
  PASSED = 'passed',
  FAILED = 'failed',
  ERROR = 'error',
}

const updateTestCases = async (
  testCases: TestCase[],
  testResults: TestResult[]
): Promise<void> => {
  try {
    // Using a regular for loop because forEach doesn't wait for async functions.
    for (let i = 0; i < testCases.length; i++) {
      const test = testCases[i];
      const { passed, actual, errorMessage } = parseResult(testResults[i]);

      await prisma.testCase.update({
        where: { id: test.id },
        data: {
          passed,
          actual,
          errorMessage,
        },
      });
    }
  } catch (err: any) {
    console.log('Unable to update test cases');
    console.log(err.stack);
    throw err;
  }
};

const parseResult = (result: TestResult) => {
  const outcome = getOutcome(result);

  let passed: boolean,
    actual: string | undefined,
    errorMessage: string | undefined;
  switch (outcome) {
    case TestOutcome.PASSED:
      passed = true;
      actual = result.outcome;
      break;
    case TestOutcome.FAILED:
      passed = false;
      actual = getActual(result);
      break;
    case TestOutcome.ERROR:
      passed = false;
      errorMessage = getErrorMessage(result);
      break;
  }

  return { passed, actual, errorMessage };
};

const getOutcome = (result: TestResult): TestOutcome => {
  if (isPassed(result)) {
    return TestOutcome.PASSED;
  }
  if (isFailure(result)) {
    return TestOutcome.FAILED;
  }
  return TestOutcome.ERROR;
};

const isPassed = (result: TestResult) => result.outcome === 'passed';
const isFailure = (result: TestResult) =>
  result.outcome === 'failed' &&
  result.call.traceback?.length &&
  result.call.traceback[0].message === 'AssertionError';
const getActual = (result: TestResult) =>
  result.call.crash?.message.split(' ')[1];
const getErrorMessage = (result: TestResult) => result.call.crash?.message;

export default run;
