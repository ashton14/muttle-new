import express, {Request, Response} from 'express';
import {FindOneOptions, getRepository} from 'typeorm';
import {User} from '../../entity/User';

const users = express.Router();

users.post('/', async (req: Request, res: Response) => {
  const {sessionId} = req.body;
  return res.json(await getRepository(User).save({sessionId}));
});

users.get('/:id', async (req: Request, res: Response) =>
  res.json(await getRepository(User).findOne(req.params.id))
);

users.get('/', async (req: Request, res: Response) => {
  if (req.query.sessionId) {
    res.json(
      await getRepository(User).findOne({
        sessionId: req.query.sessionId,
      } as FindOneOptions<User>)
    );
  } else {
    res.json(await getRepository(User).find());
  }
});

export default users;
