import 'reflect-metadata';
import app from './server/app';

<<<<<<< Updated upstream
const port = app.get('port');
app.listen(process.env.PORT || port, () => {
=======
const port = 3001;
app.listen(port, () => {
>>>>>>> Stashed changes
  console.log(`App Listening on port ${port}`);
});
