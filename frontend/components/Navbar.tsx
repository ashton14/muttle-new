import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {Nav, Navbar as BsNavbar, NavDropdown, Button} from 'react-bootstrap';
import {useAuth, UserInfo} from '../lib/context/AuthContext';
import Username from './Username';
import Help from '../pages/help';

const Navbar = () => {
  const auth = useAuth();
  const [authenticated, setAuthenticated] = useState(auth.isAuthenticated());

  return (
    <BsNavbar bg="dark" variant="dark">
      <BsNavbar.Brand href="/">Muttle</BsNavbar.Brand>
      {authenticated ?
        <AuthenticatedNav /> :
        <UnauthenticatedNav />}
    </BsNavbar>
  );
};

const AuthenticatedNav = () => {
  const router = useRouter();
  const {
    authInfo: {userInfo},
    isAuthenticated,
  } = useAuth();

  if (!isAuthenticated()) {
    router.push('/');
  }

  const {name} = userInfo as UserInfo;

  return (
    <>
      <Nav className="mr-auto">
        <BsNavbar.Text>
          <Link href='/'>Home</Link>
        </BsNavbar.Text>
        <BsNavbar.Text>
          <Link href='/exercises'>Exercises</Link>
        </BsNavbar.Text>
        <NavDropdown title='Assignments' id='assignments' className="bg-dark">
          <NavDropdown.Item className="bg-dark">
            <BsNavbar.Text>
              <Link href='/assignments'>
                Assigned to you
              </Link>
            </BsNavbar.Text>
          </NavDropdown.Item>
          <NavDropdown.Item className="navbar-dark bg-dark">
            <BsNavbar.Text>
              <Link href='/assignments/owned'>
                Your assignments
              </Link>
            </BsNavbar.Text>
          </NavDropdown.Item>
        </NavDropdown>
      </Nav>
      <Nav>
        <Username name={name} />
        <BsNavbar.Text>
          <Link href='/help'>Help</Link>
        </BsNavbar.Text>
      </Nav>
    </>
  );
};

const UnauthenticatedNav = () => {
  return (
    <Nav className="ml-auto">
      <BsNavbar.Text>
        <Link href='/signup'>Signup</Link>
      </BsNavbar.Text>
      <BsNavbar.Text>
        <Link href='/login'>Login</Link>
      </BsNavbar.Text>
    </Nav>
  );
};

export default Navbar;
