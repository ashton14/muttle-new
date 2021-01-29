import express, {Request, Response} from 'express';
import path from 'path';
import api from './api';

const app = express();
app.set('port', process.env.PORT || 3000);

const publicDir = path.join(__dirname, '../..', 'public');
app.use(express.static(publicDir));

app.use((req, res, next) => {
  console.log(`Handling ${req.path}/${req.method}`);
  res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Expose-Headers', 'Content-Type, Location');
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE');
  next();
});


app.options('/*', (req, res) => res.status(200).end());
app.use(express.json());

app.use('/api', api);

app.use((req, res) => res.sendFile(path.join(publicDir, 'index.html')));

// Handler of last resort.  Send a 500 response with stacktrace as the body.
app.use((err: any, req: Request, res: Response) =>
  res.status(500).json(err.stack)
);

export default app;
