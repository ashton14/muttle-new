import express, {Request, Response} from 'express';
import {getRepository} from 'typeorm';
import {Exercise} from '../../entity/Exercise';

const exercises = express.Router();

exercises.get('/', async (req: Request, res: Response) =>
  res.json(await getRepository(Exercise).find())
);

exercises.get('/:id', async (req: Request, res: Response) =>
  res.json(await getRepository(Exercise).findOne(req.params.id))
);

exercises.post('/', async (req: Request, res: Response) =>
  res.json(await getRepository(Exercise).save(req.body))
);

export default exercises;
