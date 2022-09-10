import express from 'express';
import exercises from './routes/exercises';
import run from './routes/run/run';
import login from './routes/login';
import signup from './routes/signup';
import jwtDecode from 'jwt-decode';
import { Token } from '../utils/auth';

const tokenRegex = /Bearer (.*)/;

const api = express.Router();
// Unauthenticated routes
api.use('/login', login);
api.use('/signup', signup);

// TODO - Move to separate method?
// Decode and attach JWT token as user property on Request
api.use((req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: 'Authentication invalid' });
  }

  const tokenMatch = authorization.match(tokenRegex);
  const decodedToken = tokenMatch && jwtDecode<Token>(tokenMatch[1]);

  if (!decodedToken) {
    return res.status(401).json({
      message: 'There was a problem authorizing the request',
    });
  } else {
    req.user = decodedToken;
    return next();
  }
});

// Authenticated routes
api.use('/exercises', exercises);
api.use('/run', run);

// Anchor handler for general 404 cases.
api.use('/', (req, res) => res.status(404).end());

export default api;
