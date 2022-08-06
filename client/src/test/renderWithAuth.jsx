import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { AuthContext } from '../providers/AuthProvider';

export const signedOut = { user: null, authenticated: false, isAdmin: false, checking: false };
export const applicant = { user: { id: 1, email: 'dana@example.com' }, authenticated: true, isAdmin: false, checking: false };
export const admin = { user: { id: 2, email: 'avery@example.com', admin: true }, authenticated: true, isAdmin: true, checking: false };

export const renderWithAuth = (ui, { auth = signedOut, path = '/', route = '/' } = {}) => render(
  <AuthContext.Provider value={{ signIn: vi.fn(), signOut: vi.fn(), ...auth }}>
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={route} element={ui} />
        <Route path="*" element={<p>elsewhere</p>} />
      </Routes>
    </MemoryRouter>
  </AuthContext.Provider>,
);
