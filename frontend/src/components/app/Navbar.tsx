import {Help} from '../home/Help';
import React from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import {Nav, Navbar as BsNavbar} from 'react-bootstrap';
import {useAuth, UserInfo} from '../../lib/context/AuthContext';
import {Username} from '../home/Username';

const Navbar = () => {
  const isAuthenticated = useAuth().isAuthenticated();

  return (
    <BsNavbar bg="dark" variant="dark">
      <BsNavbar.Brand href="/">Muttle</BsNavbar.Brand>
      {isAuthenticated ? <AuthenticatedNav /> : <UnauthenticatedNav />}
    </BsNavbar>
  );
};

const AuthenticatedNav = () => {
  const {pathname} = useLocation();
  const history = useHistory();
  const {
    authInfo: {userInfo},
    isAuthenticated,
  } = useAuth();

  if (!isAuthenticated()) {
    history.push('/');
  }

  const {name} = userInfo as UserInfo;

  return (
    <>
      <Nav className="mr-auto">
        <Nav.Link href="/home" active={pathname === '/home'}>
          Home
        </Nav.Link>
        <Nav.Link href="/exercises" active={pathname.startsWith('/exercises')}>
          Exercises
        </Nav.Link>
      </Nav>
      <Nav>
        <Nav.Item>
          <Username name={name} />
        </Nav.Item>
        <Nav.Item>
          <Help />
        </Nav.Item>
      </Nav>
    </>
  );
};

const UnauthenticatedNav = () => {
  const {pathname} = useLocation();
  return (
    <Nav className="ml-auto">
      <Nav.Link href="/signup" active={pathname === '/signup'}>
        Signup
      </Nav.Link>
      <Nav.Link href="/login" active={pathname === '/login'}>
        Login
      </Nav.Link>
    </Nav>
  );
};

export default Navbar;
