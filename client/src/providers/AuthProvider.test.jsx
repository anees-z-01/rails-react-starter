import { act, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { useContext } from 'react';
import RequireAuth from '../components/RequireAuth';
import { tokenStore } from '../api/client';
import AuthProvider, { AuthContext } from './AuthProvider';

const user = { id: 1, email: 'dana@example.com', admin: false };
const validHeaders = () => new Headers({
  'access-token': 't', client: 'c', uid: user.email, expiry: String(Math.floor(Date.now() / 1000) + 3600),
});

const Probe = () => {
  const auth = useContext(AuthContext);
  return (
    <>
      <span>{auth.authenticated ? `signed in as ${auth.user.email}` : 'signed out'}</span>
      <button onClick={() => auth.signOut()}>sign out</button>
    </>
  );
};

const renderApp = (path = '/private') => render(
  <AuthProvider>
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<p>login page</p>} />
        <Route element={<RequireAuth />}>
          <Route path="/private" element={<Probe />} />
        </Route>
      </Routes>
    </MemoryRouter>
  </AuthProvider>,
);

describe('AuthProvider + RequireAuth', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => vi.unstubAllGlobals());

  it('redirects to the login page without a stored session', () => {
    renderApp();

    expect(screen.getByText('login page')).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('restores a stored session after a reload', async () => {
    tokenStore.save(validHeaders());
    fetch.mockResolvedValue(Response.json({ data: user }));

    renderApp();

    expect(screen.getByRole('status')).toHaveTextContent('Checking your session');
    expect(await screen.findByText('signed in as dana@example.com')).toBeInTheDocument();
  });

  it('drops a stored session the server rejects', async () => {
    tokenStore.save(validHeaders());
    fetch.mockResolvedValue(Response.json({ success: false }, { status: 401 }));

    renderApp();

    expect(await screen.findByText('login page')).toBeInTheDocument();
    expect(tokenStore.read()).toBeNull();
  });

  it('signs out locally even when the server call fails', async () => {
    tokenStore.save(validHeaders());
    fetch.mockResolvedValueOnce(Response.json({ data: user }));
    fetch.mockRejectedValueOnce(new TypeError('network down'));

    renderApp();
    await screen.findByText('signed in as dana@example.com');
    await act(async () => screen.getByText('sign out').click());

    await waitFor(() => expect(screen.getByText('login page')).toBeInTheDocument());
    expect(tokenStore.read()).toBeNull();
  });
});
