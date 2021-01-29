import {createConnection} from 'typeorm';
import 'reflect-metadata';
import app from './server/app';

createConnection().then(() => {
  const port = app.get('port');
  app.listen(port, () => {
    console.log(`App Listening on port ${port}`);
  });
});
