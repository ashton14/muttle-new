import express, {Request, Response} from 'express';
import {getRepository} from 'typeorm';
import {Exercise} from '../../entity/Exercise';
import {Attempt} from '../../entity/Attempt';
import testCases from './testCases';

const exercises = express.Router();
exercises.use('/:exerciseId/testCases', testCases);

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

exercises.get('/:id/attempts/latest', async (req: Request, res: Response) =>
  res.json(
    await getRepository(Attempt).findOne({
      where: {
        exercise: {id: req.params.id},
        user: {id: req.query.userId},
      },
      order: {
        id: 'DESC',
      },
    })
  )
);

export default exercises;
