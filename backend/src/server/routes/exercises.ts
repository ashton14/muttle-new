import express, { Request, Response } from 'express';
import { prisma } from '../../prisma';
import testCases from './testCases';
import exerciseOfferings from './exerciseOfferings';
import { Token } from '../../utils/auth';
import {
  getFunctionName,
  compileSnippetAndGenerateMutations,
} from '../../utils/py/pythonUtils';
import { deleteIfExists } from '../../utils/fsUtils';
import { writeFiles } from '../../utils/py/testRunner';
import path from 'path';
import { runMutationAnalysis } from '../../utils/py/mutation';
import { at } from 'lodash';

const exercises = express.Router();
exercises.use('/:exerciseId/testCases', testCases);
exercises.use('/:exerciseId/offerings', exerciseOfferings);

exercises.get('/', async (req: Request, res: Response) => {
  const exercises = await prisma.exercise.findMany();
  res.json(exercises);
});

exercises.get('/:id', async (req: Request, res: Response) =>
  res.json(
    await prisma.exercise.findUnique({
      where: { id: +req.params.id },
      include: {owner: true}
    })
  )
);


// What about exercise versions?
exercises.put('/:id', async (req: Request, res: Response) => {
  const exercise = await prisma.exercise.findUnique({
    where: {
      id: +req.params.id,
    },
    include: { owner: true },
  });
  const requestingUser = req.user as Token;
  if (exercise?.owner?.email !== requestingUser.email) {
    res.status(403).json({ message: 'Unauthorised to update that exercise.' });
  } else {
    const { name, description, snippet, mutations } = req.body;
    try {
      const updatedExercise = {
        name,
        description,
        snippet,
        mutations,
      };
      await prisma.exercise.update({
        where: { id: +req.params.id },
        data: updatedExercise,
      });
      res.status(200).json({ exercise });
    } catch (err) {
      res.status(400).json({ error: err });
    }
  }
});

exercises.get('/:id/mutations', async (req: Request, res: Response) => {
  const exercise = await prisma.exercise.findUnique({
    where: {
      id: +req.params.id,
    },
    include: {
      owner: true,
      mutations: {
        include: {
          mutationOutcomes: true,
          mutatedLines: true
        }
      }
     },
  });
  const requestingUser = req.user as Token;
  if (exercise?.owner?.email !== requestingUser.email) {
    res.status(403).json({ message: 'Unauthorised to retrieve mutations for that exercise.' });
  } else {
    res.json(exercise.mutations)
  }
});


exercises.put('/:id/mutations', async (req: Request, res: Response) => {
  const exercise = await prisma.exercise.findUnique({
    where: {
      id: +req.params.id,
    },
    include: { owner: true },
  });
  const requestingUser = req.user as Token;
  if (exercise?.owner?.email !== requestingUser.email) {
    res.status(403).json({ message: 'Unauthorised to update that exercise.' });
  } else {
    // TODO: Generate all mutations and send them to the client.
    res.status(501).json({ message: 'This endpoint is not yet implemented.' });
  }
});

exercises.put('/:id/mutations/:mutationId',async (req: Request, res: Response) => {
    try {
      const exercise = await prisma.exercise.findUnique({
        where: {
          id: +req.params.id,
        },
        include: { owner: true },
      });

      const requestingUser = req.user as Token;

      if (!exercise) {
        return res.status(404).json({ message: 'Exercise not found.' });
      }

      if (exercise.owner?.email !== requestingUser.email) {
        return res
          .status(403)
          .json({ message: 'Unauthorized to update that mutation.' });
      }

      const { equivalent } = req.body;

      if (typeof equivalent !== 'boolean') {
        return res.status(400).json({
          message: 'Value of equivalent must be a boolean',
        });
      }

      const updatedMutation = await prisma.mutation.update({
        where: { id: +req.params.mutationId },
        data: { equivalent },
      });

      return res.status(200).json({
        message: 'Mutation updated successfully.',
        updatedMutation,
      });
    } catch (error) {
      console.error('Error updating mutation:', error);
      return res
        .status(500)
        .json({ message: 'An error occurred while updating the mutation.' });
    }
  }
);



// Create an exercise if the code snippet compiles.
exercises.post('/', async (req: Request, res: Response) => {
  const { snippet } = req.body;
  let mutants = []; 
  try {
    console.log('generating mutants...')
    mutants = await compileSnippetAndGenerateMutations(snippet);
    console.log('mutants:',mutants)
  } catch (error) {
    res.status(400).json({
      errorMessage: `An error occurred while compiling the exercise and generating mutations:\n${error}`,
    });
    return;
  }
  try {
    // The code compiled successfully. Generate mutations and save the exercise.
    const exercise = {
      ...req.body,
      owner: { connect: { email: (req.user as Token).email } },
      mutations: {
        create: mutants.map(
          ({ operator, number, addedLines: mutatedLines }) => ({
            operator,
            number,
            mutatedLines: {
              create: mutatedLines,
            },
          })
        ),
      },
    };
    const savedExercise = await prisma.exercise.create({ data: exercise });
    res.json(savedExercise);
  } catch (err) {
    res.status(500).json({
      errorMessage: `An error occurred while saving the exercise.\n${err}`,
    });
  }
});

exercises.get('/:id/attempts/latest', async (req: Request, res: Response) => {
  const user = req.user as Token;
  if (!user) {
    res.sendStatus(403);
    return;
  }

  const attempt = await prisma.attempt.findFirst({
    where: {
      exercise: { id: +req.params.id },
      exerciseOffering: req.params.exerciseOfferingId
        ? { id: +req.params.exerciseOfferingId }
        : null,
      user: { id: user.subject },
    },
    include: {
      testCases: true,
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
    },
    orderBy: { id: 'desc' },
  }); 

  if (attempt) {
    attempt.testCases = attempt?.testCases.filter(t => !t.fixedId);
  }
  res.json(attempt);

});



export default exercises;
