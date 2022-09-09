import React, {useRef, useState} from 'react';
import { useRouter } from 'next/router';
import Overlay from 'react-bootstrap/Overlay';
import ListGroup from 'react-bootstrap/cjs/ListGroup';
import Button from 'react-bootstrap/Button';
import {useAuth} from '../lib/context/AuthContext';

interface UsernameProps {
  name: string;
}

export default ({name}: UsernameProps) => {
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
      <Button
        className="text-light"
        ref={target}
        onClick={() => setShow(!show)}
        variant="link"
        aria-label="UserName"
      >
        {`${name}`}
        <i
          className="ml-1 fas fa-caret-down"
          aria-hidden="true"
          title="User Menu"
        />
      </Button>
      <Overlay
        target={target.current}
        show={show}
        placement="bottom"
        rootClose={true}
        rootCloseEvent="click"
        onHide={() => setShow(false)}
      >
        <ListGroup style={{zIndex: 99999}}>
          <ListGroup.Item className="py-1 ">
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
          </ListGroup.Item>
        </ListGroup>
      </Overlay>
    </>
  );
};
