import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from '../../common/Card';
import {usePublicApi} from '../../../lib/context/PublicApiContext';
import {useAuth} from '../../../lib/context/AuthContext';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const disabled = !email || !password || !firstName || !lastName;

  const history = useHistory();
  const auth = useAuth();
  const {signup} = usePublicApi();

  const submit = async () => {
    try {
      const authInfo = await signup({email, password, firstName, lastName});
      auth.setAuthInfo(authInfo);
      history.push('/home');
    } catch (e) {
      console.log(e);
    }
  };

  return (
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
          <Form.Label>First Name</Form.Label>
          <Form.Control
            required
            autoComplete="name"
            placeholder="Jane"
            value={firstName}
            onChange={event => setFirstName(event.target.value)}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            required
            autoComplete="name"
            placeholder="Doe"
            value={lastName}
            onChange={event => setLastName(event.target.value)}
          />
        </Form.Group>

        <Button onClick={submit} disabled={disabled}>
          Create Account
        </Button>
      </Form>
    </Card>
  );
};

export default Signup;
