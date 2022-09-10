import React, {useRef, useState} from 'react';
import { useRouter } from 'next/router';
import Overlay from 'react-bootstrap/Overlay';
import ListGroup from 'react-bootstrap/cjs/ListGroup';
import Button from 'react-bootstrap/Button';
import {useAuth} from '../lib/context/AuthContext';
import { NavDropdown } from 'react-bootstrap';

interface UsernameProps {
  name: string;
}

export default function Username ({name}: UsernameProps) {
  const [show, setShow] = useState(false);
  const target = useRef(null);

  const router = useRouter();
  const {logout} = useAuth();

  const onLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      <NavDropdown title={name} id='user-settings'>
        <NavDropdown.Item>
          <Button
            className="border-0"
            variant="outline-secondary"
            onClick={onLogout}
          >
            <span className="font-weight-bold">
              <i className="mr-1 fas fa-sign-out-alt" />
              Log out
            </span>
          </Button>
        </NavDropdown.Item>
      </NavDropdown>
    </>
  );
};
