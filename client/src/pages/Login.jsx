import { useContext, useState } from 'react';
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

  const handleSubmit = async (event) => {
    event.preventDefault();
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
    <section className="signin" aria-labelledby="signin-heading">
      <h1 id="signin-heading">Sign in</h1>
      <p>Sign in to apply for roles and see where your applications stand.</p>
      <form onSubmit={handleSubmit} noValidate={false}>
        {error && <p className="notice notice--error" role="alert">{error}</p>}
        <div className="field">
          <label htmlFor="email">Email address</label>
          <input id="email" type="email" autoComplete="email" required value={email}
            onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" required value={password}
            onChange={(event) => setPassword(event.target.value)} />
        </div>
        <button type="submit" className="button" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </section>
  );
};

export default Login;
