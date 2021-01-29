import React from 'react';

import Exercise from './exercises/Exercise';
import './App.css';
import {Switch, Route, withRouter} from 'react-router-dom';
import {Nav, Navbar} from 'react-bootstrap';
import ExerciseList from './exercises/ExerciseList';
import Home from './home/Home';

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
        <Route path="/exercises/:exerciseId" children={<Exercise />} />
        <Route
          path="/exercises/new"
          render={() => <Body text="new exercises" />}
        />
      </Switch>
    </div>
  );
};

export const Body = ({text}: {text: string}) => {
  return <p>{text}</p>;
};

export default withRouter(App);
