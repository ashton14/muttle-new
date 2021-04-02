import express, {Request, Response} from 'express';
import {getRepository} from 'typeorm';
import {CoverageOutcome} from '../../entity/CoverageOutcome';
import {Exercise} from '../../entity/Exercise';
import {MutationOutcome} from '../../entity/MutationOutcome';
import _ from 'lodash';

const exercises = express.Router();

exercises.get('/', async (req: Request, res: Response) =>
  res.json(await getRepository(Exercise).find())
);

exercises.get('/:id', async (req: Request, res: Response) =>
  res.json(await getRepository(Exercise).findOne(req.params.id))
);

// What about exercise versions?
exercises.put('/:id', async (req: Request, res: Response) => {
  const {name, description, snippet} = req.body;
  try {
    await getRepository(Exercise).update(req.params.id, {
      name,
      description,
      snippet,
    });
    res.sendStatus(200);
  } catch (err) {
    res.status(400).json({error: err});
  }
});

exercises.post('/', async (req: Request, res: Response) =>
  res.json(await getRepository(Exercise).save(req.body))
);

exercises.get('/:id/coverageOutcomes', async (req: Request, res: Response) => {
  const {userId} = req.query;
  const {id} = req.params;

  const results = await getRepository(CoverageOutcome)
    .createQueryBuilder('coverageOutcome')
    .where(
      'coverageOutcome.userId = :userId and coverageOutcome.exerciseId = :id',
      {userId: userId, id: id}
    )
    .distinctOn([
      'coverageOutcome.userId',
      'coverageOutcome.exerciseId',
      'coverageOutcome.lineNo',
    ])
    .getMany();
  res.json(results);
});

exercises.get('/:id/mutationOutcomes', async (req: Request, res: Response) => {
  const {userId} = req.query;
  const {id} = req.params;

  const results = await getRepository(MutationOutcome).find({
    where: {user: userId, exercise: id},
    relations: ['user', 'exercise', 'mutations'],
  });
  // TODO - Use TypeOrm for uniqueness and/or put outcomes under another entity
  const uniqueResults = _.uniqWith(
    results,
    (o1, o2) =>
      o1.exercise.id === o2.exercise.id &&
      o1.user.id === o2.user.id &&
      o1.number === o2.number
  );

  res.json(uniqueResults);
});

export default exercises;
