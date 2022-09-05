import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import Card from '../../common/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import {useAuth} from '../../../lib/context/AuthContext';
import {usePublicApi} from '../../../lib/context/PublicApiContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const disabled = !email;

  const history = useHistory();
  const auth = useAuth();
  const {login} = usePublicApi();

  const submit = async () => {
    try {
      const authInfo = await login({email, password});
      auth.setAuthInfo(authInfo);
      history.push('/home');
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Card title="Login">
      <Form>
        <Form.Group>
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            autoComplete="username"
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
            autoComplete="current-password"
            required
            value={password}
            onChange={event => setPassword(event.target.value)}
          />
        </Form.Group>

        <Button onClick={submit} disabled={disabled}>
          Login
        </Button>
      </Form>
    </Card>
  );
};

export default Login;
