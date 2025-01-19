import 'reflect-metadata';
import app from './server/app';

const port = app.get('port');
app.listen(process.env.PORT || port, () => {
  console.log(`App Listening on port ${port}`);
});
