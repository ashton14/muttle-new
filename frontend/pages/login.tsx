import React, {useState} from 'react';
import { useRouter } from 'next/router';
import Card from '../components/common/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import {useAuth} from '../lib/context/AuthContext';
import {usePublicApi} from '../lib/context/PublicApiContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [invalidLogin, setInvalidLogin] = useState(false);

  const disabled = !email;

  const router = useRouter();
  const auth = useAuth();
  const {login} = usePublicApi();

  const submit = async () => {
    try {
      const authInfo = await login({email, password});
      auth.setAuthInfo(authInfo);
      setInvalidLogin(false);
      router.push('/');
    } catch (e) {
      setInvalidLogin(true);
    }
  };

  const loginError = invalidLogin ? (
    <Alert variant="danger">Error while logging in.</Alert>
  ) : (
    ''
  );

  return (
    <Card title="Login">
      {loginError}
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
