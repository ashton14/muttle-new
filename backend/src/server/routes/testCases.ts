import express, {Request, Response} from 'express';
import {getManager, getRepository} from 'typeorm';
import {Exercise} from '../../entity/Exercise';
import {TestCase} from '../../entity/TestCase';

const testCases = express.Router();

testCases.post('/', async (req: Request, res: Response) => {
  const entityManager = getManager();
  const {id, input, output, exerciseId} = req.body;

  const exercise = entityManager.create(Exercise, {id: exerciseId});
  const newTest = {input, output, exercise};

  try {
    if (id) {
      const existing = await entityManager.findOne(TestCase, id);
      if (
        existing &&
        (existing.input !== input || existing.output !== output)
      ) {
        const savedNewTest = (await entityManager.save(
          TestCase,
          newTest
        )) as TestCase;

        const updated = entityManager.merge(TestCase, existing, {
          fixedId: savedNewTest.id,
        });
        await entityManager.save(TestCase, updated);
      }
    } else {
      await entityManager.save(TestCase, newTest);
    }
    res.sendStatus(200);
  } catch (e) {
    console.log(e.stack); // TODO - Implement better error handling
    res.sendStatus(500);
  }
});

// TODO - Needs to be fixed with new model for inserting (
testCases.post('/batch', async (req: Request, res: Response) => {
  const exerciseRepo = getRepository(Exercise);
  const testCases = req.body.map(
    ({input, output, exerciseId, fixedId}: any) => ({
      input,
      output,
      fixedId,
      exercise: exerciseRepo.create({id: exerciseId}),
    })
  );
  res.json(await getManager().save(TestCase, testCases));
});

testCases.get('/', async (req: Request, res: Response) =>
  res.json(
    await getManager().find(TestCase, {
      where: {exercise: {id: req.query.exerciseId}},
    })
  )
);

testCases.get('/:id', async (req: Request, res: Response) =>
  res.json(await getManager().findOne(TestCase, req.params.id))
);

testCases.delete('/:id', async (req: Request, res: Response) => {
  const entityManager = getManager();
  const testCase = entityManager.create(TestCase, {
    id: parseInt(req.params.id),
    visible: false,
  });
  try {
    await entityManager.save(testCase);
    res.sendStatus(200);
  } catch {
    res.sendStatus(500);
  }
});

export default testCases;
