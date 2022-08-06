import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fetchJobs } from '../api/jobs';
import { admin, renderWithAuth } from '../test/renderWithAuth';
import Home from './Home';

vi.mock('../api/jobs', () => ({ fetchJobs: vi.fn() }));

const job = (id, overrides = {}) => ({
  id, title: `Role ${id}`, slug: `role-${id}`, description: 'Work on things.', status: 'open',
  created_at: '2026-11-01T09:00:00Z', application_status: null, ...overrides,
});
const pageInfo = (overrides = {}) => ({ page: 1, pages: 1, per_page: 6, count: 1, prev: null, next: null, ...overrides });

describe('Home', () => {
  beforeEach(() => fetchJobs.mockReset());

  it('lists roles with their status and links to each one', async () => {
    fetchJobs.mockResolvedValue({ jobs: [job(1, { application_status: 'reviewed' })], page_info: pageInfo() });

    renderWithAuth(<Home />);

    const link = await screen.findByRole('link', { name: 'Role 1' });
    expect(link).toHaveAttribute('href', '/jobs/role-1');
    expect(screen.getByText('Posted 1 Nov 2026')).toBeInTheDocument();
    expect(screen.getByText('In review')).toBeInTheDocument();
  });

  it('shows an empty state for the chosen filter', async () => {
    fetchJobs.mockResolvedValue({ jobs: [], page_info: pageInfo({ count: 0 }) });

    renderWithAuth(<Home />);

    expect(await screen.findByText('No open roles right now.')).toBeInTheDocument();
  });

  it('shows an error with a retry button', async () => {
    fetchJobs.mockRejectedValueOnce(new Error('Request failed (500)'));
    fetchJobs.mockResolvedValueOnce({ jobs: [job(1)], page_info: pageInfo() });

    renderWithAuth(<Home />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Request failed (500)');
    await userEvent.click(within(alert).getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('link', { name: 'Role 1' })).toBeInTheDocument();
  });

  it('resets to page 1 when the filter changes and hides drafts from non-admins', async () => {
    fetchJobs.mockResolvedValue({ jobs: [job(1)], page_info: pageInfo({ pages: 3, count: 14 }) });

    renderWithAuth(<Home />);
    await userEvent.click(await screen.findByRole('button', { name: 'Page 3' }));
    await userEvent.click(screen.getByRole('button', { name: 'Closed' }));

    expect(fetchJobs).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, filter: 'closed' }));
    expect(screen.queryByRole('button', { name: 'Draft' })).not.toBeInTheDocument();
  });

  it('offers the draft filter to admins', async () => {
    fetchJobs.mockResolvedValue({ jobs: [], page_info: pageInfo({ count: 0 }) });

    renderWithAuth(<Home />, { auth: admin });

    expect(await screen.findByRole('button', { name: 'Draft' })).toBeInTheDocument();
  });
});
