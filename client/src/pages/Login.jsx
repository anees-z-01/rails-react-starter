import { useContext, useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router';
import { AuthContext } from '../providers/AuthProvider';

const Login = () => {
  const { signIn } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await signIn(email, password);
      navigate(location.state?.from ?? '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        {error && <p role="alert" className="text-danger">{error}</p>}
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email address</Form.Label>
          <Form.Control type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Form.Group>
        <Button type="submit" disabled={submitting}>Sign in</Button>
      </Form>
    </Container>
  );
};

export default Login;
