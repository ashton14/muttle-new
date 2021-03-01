import express from 'express';
import exercises from './routes/exercises';
import testCases from './routes/testCases';
import run from './routes/run';
import users from './routes/users';

const api = express.Router();

api.use('/exercises', exercises);
api.use('/testCases', testCases);
api.use('/users/', users);
api.use('/run', run);

// Anchor handler for general 404 cases.
api.use('/', (req, res) => res.status(404).end());

export default api;
