import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from '../../common/Card';
import {usePublicApi} from '../../../lib/context/PublicApiContext';
import {useAuth} from '../../../lib/context/AuthContext';
import {Alert} from 'react-bootstrap';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const disabled = !email || !password || !name;

  const history = useHistory();
  const auth = useAuth();
  const {signup} = usePublicApi();

  const submit = async () => {
    try {
      setAlertMessage('');
      const authInfo = await signup({email, password, name});
      auth.setAuthInfo(authInfo);
      history.push('/home');
    } catch (e) {
      if (e.response?.status === 409) {
        setAlertMessage(e.response.data.message);
      }
    }
  };

  const alert = <Alert variant="danger">{`Error! ${alertMessage}`}</Alert>;

  return (
    <div>
      {alertMessage ? alert : ''}
      <Card title="Sign Up">
        <Form>
          <Form.Group>
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              autoComplete="email"
              required
              placeholder="jane.doe@example.com"
              value={email}
              onChange={event => setEmail(event.target.value)}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={event => setPassword(event.target.value)}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control
              required
              autoComplete="name"
              placeholder="John Doe"
              value={name}
              onChange={event => setName(event.target.value)}
            />
          </Form.Group>

          <Button onClick={submit} disabled={disabled}>
            Create Account
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default Signup;
