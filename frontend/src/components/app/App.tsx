import React, {Suspense} from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';

import {AuthProvider, useAuth} from '../../lib/context/AuthContext';

import Home from '../home/Home';
import Login from '../home/login/Login';
import Signup from '../home/signup/Signup';
import Landing from '../landing/Landing';
import ExerciseList from '../exercises/exercise-list/ExerciseList';
import {RouteProps} from 'react-router-dom';
import NewExercise from '../exercises/exercise-forms/NewExercise';
import EditExercise from '../exercises/exercise-forms/EditExercise';
import Exercise from '../exercises/exercise-detail/Exercise';
import Navbar from './Navbar';
import {AuthenticatedApiProvider} from '../../lib/context/AuthenticatedApiContext';

const LoadingFallback = () => <div className="p-4">Loading...</div>;

const UnauthenticatedRoutes = () => (
  <Switch>
    <Route path="/login">
      <Login />
    </Route>
    <Route path="/signup">
      <Signup />
    </Route>
    <Route exact path="/">
      <Landing />
    </Route>
    <Route render={() => <Redirect to="/" />} />
  </Switch>
);

const AuthenticatedRoutes = () => (
  <Switch>
    <AuthenticatedRoute path="/exercises/:exerciseId">
      <Exercise />
    </AuthenticatedRoute>
    <AuthenticatedRoute path="/exercises">
      <ExerciseList />
    </AuthenticatedRoute>
    <AuthenticatedRoute path="/home">
      <Home />
    </AuthenticatedRoute>
  </Switch>
);

const AdminRoutes = () => (
  <Switch>
    <AdminRoute path="/exercises/new">
      <NewExercise />
    </AdminRoute>
    <AdminRoute path="/exercises/:exerciseId/edit">
      <EditExercise />
    </AdminRoute>
  </Switch>
);

const AuthenticatedRoute = ({children, ...rest}: RouteProps) => {
  const auth = useAuth();
  return (
    <Route
      {...rest}
      render={() =>
        auth.isAuthenticated() ? (
          <AuthenticatedApiProvider>{children}</AuthenticatedApiProvider>
        ) : (
          <Redirect to="/" />
        )
      }
    />
  );
};

const AdminRoute = ({children, ...rest}: RouteProps) => {
  const auth = useAuth();
  return (
    <Route
      {...rest}
      render={() =>
        auth.isAuthenticated() && auth.isAdmin() ? (
          <AuthenticatedApiProvider>{children}</AuthenticatedApiProvider>
        ) : (
          <Redirect to="/" />
        )
      }
    />
  );
};

const AppRoutes = () => {
  return (
    <>
      <Suspense fallback={<LoadingFallback />}>
        <Switch>
          <AdminRoute path="/exercises/new">
            <NewExercise />
          </AdminRoute>
          <AdminRoute path="/exercises/:exerciseId/edit">
            <EditExercise />
          </AdminRoute>
          <AuthenticatedRoute path="/exercises/:exerciseId">
            <Exercise />
          </AuthenticatedRoute>
          <AuthenticatedRoute path="/exercises">
            <ExerciseList />
          </AuthenticatedRoute>
          <AuthenticatedRoute path="/home">
            <Home />
          </AuthenticatedRoute>
          {/*TODO - Debug issues with Admin/AuthenticatedRoutes components */}
          {/*<AdminRoutes />*/}
          {/*<AuthenticatedRoutes />*/}
          <UnauthenticatedRoutes />
        </Switch>
      </Suspense>
    </>
  );
};

const App = () => (
  <Router>
    <AuthProvider>
      <Navbar />
      <div
        className="min-vh-100"
        style={{
          backgroundColor: '#F7FCFA',
          overflow: 'auto',
        }}
      >
        <AppRoutes />
      </div>
    </AuthProvider>
  </Router>
);

export default App;
