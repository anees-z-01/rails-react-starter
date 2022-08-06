import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fetchApplications, withdrawApplication } from '../api/jobApplications';
import { applicant, renderWithAuth } from '../test/renderWithAuth';
import Applications from './Applications';

vi.mock('../api/jobApplications', () => ({ fetchApplications: vi.fn(), withdrawApplication: vi.fn() }));

const application = (id, status) => ({
  id, status, job_id: id, created_at: '2026-11-03T09:00:00Z',
  job: { id, title: `Role ${id}`, slug: `role-${id}`, status: 'open' },
});
const pageInfo = { page: 1, pages: 1, per_page: 6, count: 2, prev: null, next: null };

describe('Applications', () => {
  beforeEach(() => vi.clearAllMocks());

  it('withdraws an application and reloads the list', async () => {
    fetchApplications
      .mockResolvedValueOnce({ job_applications: [application(1, 'applied'), application(2, 'reviewed')], page_info: pageInfo })
      .mockResolvedValueOnce({ job_applications: [application(2, 'reviewed')], page_info: { ...pageInfo, count: 1 } });
    withdrawApplication.mockResolvedValue({});

    renderWithAuth(<Applications />, { auth: applicant });
    await userEvent.click(await screen.findByRole('button', { name: 'Withdraw application for Role 1' }));

    expect(withdrawApplication).toHaveBeenCalledWith(1);
    await screen.findByText('Role 2');
    expect(screen.queryByText('Role 1')).not.toBeInTheDocument();
  });

  it('has no status picker for reviewed or rejected', async () => {
    fetchApplications.mockResolvedValue({ job_applications: [application(1, 'applied')], page_info: pageInfo });

    renderWithAuth(<Applications />, { auth: applicant });

    await screen.findByText('Role 1');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('filters by status and shows an empty state', async () => {
    fetchApplications.mockResolvedValue({ job_applications: [], page_info: { ...pageInfo, count: 0 } });

    renderWithAuth(<Applications />, { auth: applicant });
    await userEvent.click(await screen.findByRole('button', { name: 'Withdrawn' }));

    expect(fetchApplications).toHaveBeenLastCalledWith(expect.objectContaining({ filter: 'withdrawn', page: 1 }));
    expect(await screen.findByText(/Nothing here yet/)).toBeInTheDocument();
  });

  it('surfaces a failed withdrawal', async () => {
    fetchApplications.mockResolvedValue({ job_applications: [application(1, 'applied')], page_info: pageInfo });
    withdrawApplication.mockRejectedValue(new Error('Request failed (500)'));

    renderWithAuth(<Applications />, { auth: applicant });
    await userEvent.click(await screen.findByRole('button', { name: 'Withdraw application for Role 1' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Request failed (500)');
  });
});
