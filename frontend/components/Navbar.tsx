import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {Nav, Navbar as BsNavbar} from 'react-bootstrap';
import {useAuth, UserInfo} from '../lib/context/AuthContext';
import Username from './Username';
import Help from '../pages/help';

const Navbar = () => {
  const auth = useAuth();
  const isAuthenticated = auth.isAuthenticated();

  return (
    <BsNavbar bg="dark" variant="dark">
      <BsNavbar.Brand href="/">Muttle</BsNavbar.Brand>
      {isAuthenticated ? <AuthenticatedNav /> : <UnauthenticatedNav />}
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
