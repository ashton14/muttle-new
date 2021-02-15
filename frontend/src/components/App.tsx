import React, {createContext, useEffect, useState} from 'react';

import Exercise from './exercises/Exercise';
import {Switch, Route, withRouter, Redirect} from 'react-router-dom';
import {Nav, Navbar} from 'react-bootstrap';
import ExerciseList from './exercises/ExerciseList';
import Home from './home/Home';
import NewExercise from './exercises/NewExercise';
import EditExercise from './exercises/EditExercise';
import {getUserBySessionId, createUser, User} from '../utils/api';
import {getCookie, setCookie, stringToUUID} from '../utils/helper';

export const UserContext = createContext(null);

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      let sessionId = getCookie('muttle-session-id');
      let user: User;
      if (sessionId) {
        user = await getUserBySessionId(sessionId);
        if (user) {
          setCurrentUser(user);
          return;
        }
      }

      if (!user) {
        sessionId = stringToUUID();
        setCookie('muttle-session-id', sessionId, 30);
        setCurrentUser(await createUser(sessionId));
        return;
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={currentUser}>
      <div className="text-left">
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
          <Route path="/exercises/:exerciseId" component={Exercise} />
          <Route render={() => <Redirect to="/" />} />
        </Switch>
      </div>
    </UserContext.Provider>
  );
};

export const Body = ({text}: {text: string}) => {
  return <p>{text}</p>;
};

export default withRouter(App);
