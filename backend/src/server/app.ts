import express, {Request, Response} from 'express';
import path from 'path';
import api from './api';
import env from 'dotenv';

const app = express();
const {error, parsed} = env.config();

if (error) {
  throw error;
}

if (!parsed?.JWT_SECRET) {
  throw Error('Requires JWT_SECRET to be set in .env file');
}

app.set('port', process.env.PORT || 80);
app.set('secret', process.env.JWT_SECRET);

const publicDir = path.join(__dirname, '../..', 'public');
app.use(express.static(publicDir));

app.use((req, res, next) => {
  console.log(`Handling ${req.path}/${req.method}`);
  const allowedOrigins = ['http://localhost:3001', 'http://192.168.0.216:3001'];
  const origin = req.headers.origin;

  // if (origin && allowedOrigins.includes(origin)) {
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', ['Authorization', 'Content-Type']);
  res.header('Access-Control-Expose-Headers', 'Content-Type, Location');
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE');
  return next();
});

app.options('/*', (req, res) => res.status(200).end());
app.use(express.json());

app.use('/api', api);

app.use((req, res) => res.sendFile(path.join(publicDir, 'index.html')));

// Handler of last resort.  Send a 500 response with stacktrace as the body.
app.use((err: Error, req: Request, res: Response) =>
  res.status(500).json(err.stack)
);

export default app;
