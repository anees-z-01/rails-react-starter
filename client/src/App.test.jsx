import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import App from './App';

vi.mock('./components/Layout', () => ({ default: ({ children }) => <div>{children}</div> }));
vi.mock('./components/RequireAuth', async () => {
  const { Outlet } = await import('react-router');
  return { default: () => <Outlet /> };
});
vi.mock('./pages/Home', () => ({ default: () => <h1>Home Page</h1> }));
vi.mock('./pages/Login', () => ({ default: () => <h1>Login Page</h1> }));
vi.mock('./pages/Applications', () => ({ default: () => <h1>Applications Page</h1> }));
vi.mock('./pages/Job', () => ({ default: () => <h1>Job Page</h1> }));

const renderAt = (path) => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);

describe('App routes', () => {
  it.each([
    ['/', 'Home Page'],
    ['/login', 'Login Page'],
    ['/applications', 'Applications Page'],
    ['/jobs/frontend-engineer', 'Job Page'],
    ['/nope', 'Page not found'],
  ])('renders %s', (path, heading) => {
    renderAt(path);

    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  });
});
