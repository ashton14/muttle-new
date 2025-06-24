import express, { Request, Response } from 'express';
import path from 'path';
import api from './api';
import env from 'dotenv';
import next from 'next'; // **Added Next.js import**

const app = express();
const { error, parsed } = env.config({ path: path.join(__dirname, '../../.env') });

if (error) {
  if (!error.message.includes('no such file or directory')) {
    throw error;
  }
}

if (!process.env.JWT_SECRET) {
  throw Error('Requires JWT_SECRET to be set in .env file');
}

<<<<<<< Updated upstream
const dev = process.env.NODE_ENV !== 'production'; // **Set the environment for Next.js**
const nextApp = next({ dev }); // **Initialize the Next.js app**
const handle = nextApp.getRequestHandler(); // **Next.js request handler**
=======
app.set('secret', process.env.JWT_SECRET);
app.set('port', process.env.PORT || 3001);
>>>>>>> Stashed changes

nextApp.prepare().then(() => {
  // **Wait for Next.js to prepare before starting the server**
  app.set('port', process.env.PORT || 80);
  app.set('secret', process.env.JWT_SECRET);

<<<<<<< Updated upstream
  const publicDir = path.join(__dirname, '../..', 'public');
  app.use(express.static(publicDir));
=======
app.use((req, res, next) => {
  console.log(`Handling ${req.path}/${req.method}`);
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://muttle.ayaankazerouni.org',
    'https://muttle.vercel.app',
  ];
  const origin = req.headers.origin;
>>>>>>> Stashed changes

  app.use((req, res, next) => {
    console.log(`Handling ${req.path}/${req.method}`);
    const allowedOrigins = [
      'http://localhost:3001',
      'https://muttle.ayaankazerouni.org',
      'https://muttle.vercel.app',
    ];
    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', [
      'Authorization',
      'Content-Type',
    ]);
    res.header('Access-Control-Expose-Headers', 'Content-Type, Location');
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE');
    return next();
  });

  app.options('/*', (req, res) => res.status(200).end());
  app.use(express.json());

<<<<<<< Updated upstream
  // API routes
  app.use('/api', api);

  // **Serve Next.js pages for all non-API routes**
  app.all('*', (req, res) => {
    return handle(req, res); // **Let Next.js handle all requests**
  });

  // Handler of last resort. Send a 500 response with stacktrace as the body.
  app.use((err: Error, req: Request, res: Response) =>
    res.status(500).json(err.stack)
  );

  const port = app.get('port');
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});
=======
// API routes
app.use('/api', api);

// Handler of last resort. Send a 500 response with stacktrace as the body.
app.use((err: Error, req: Request, res: Response, next: any) =>
  res.status(500).json(err.stack)
);
>>>>>>> Stashed changes

export default app;