import React from 'react';

import Exercise from './exercises/Exercise';
import './App.css';
import {Switch, Route, withRouter} from 'react-router-dom';
import {Nav, Navbar} from 'react-bootstrap';
import ExerciseList from './exercises/ExerciseList';
import Home from './home/Home';
import NewExercise from './exercises/NewExercise';
import EditExercise from './exercises/EditExercise';

const App = () => {
  return (
    <div className="App">
      <Navbar bg="dark" variant="dark">
        <Navbar.Brand href="/">Muttle</Navbar.Brand>
        <Nav className="mr-auto">
          <Nav.Link href="/">Home</Nav.Link>
          <Nav.Link href="/exercises">Exercises</Nav.Link>
        </Nav>
      </Navbar>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path={'/exercises/'} component={ExerciseList} />
        <Route path="/exercises/new" component={NewExercise} />
        <Route path="/exercises/:exerciseId/edit" component={EditExercise} />
        <Route path="/exercises/:exerciseId" component={Exercise} />
      </Switch>
    </div>
  );
};

export const Body = ({text}: {text: string}) => {
  return <p>{text}</p>;
};

export default withRouter(App);
