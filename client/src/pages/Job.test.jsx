import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { applyToJob, fetchJob, updateJobStatus } from '../api/jobs';
import { admin, applicant, renderWithAuth } from '../test/renderWithAuth';
import Job from './Job';

vi.mock('../api/jobs', () => ({ fetchJob: vi.fn(), applyToJob: vi.fn(), updateJobStatus: vi.fn() }));

const job = { id: 7, title: 'Data Analyst', slug: 'data-analyst', description: 'SQL first.', status: 'open',
  created_at: '2026-11-01T09:00:00Z', application_status: null };
const renderJob = (auth) => renderWithAuth(<Job />, { auth, path: '/jobs/data-analyst', route: '/jobs/:slug' });

describe('Job', () => {
  beforeEach(() => vi.clearAllMocks());

  it('asks visitors to sign in before applying', async () => {
    fetchJob.mockResolvedValue(job);

    renderJob();

    expect(await screen.findByRole('heading', { name: 'Data Analyst' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');
    expect(screen.queryByLabelText(/Listing status/)).not.toBeInTheDocument();
  });

  it('lets an applicant apply once', async () => {
    fetchJob.mockResolvedValue(job);
    applyToJob.mockResolvedValue({ id: 1, status: 'applied' });

    renderJob(applicant);
    await userEvent.click(await screen.findByRole('button', { name: 'Apply for this role' }));

    expect(applyToJob).toHaveBeenCalledWith(7);
    expect(await screen.findByText('Applied')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Apply for this role' })).not.toBeInTheDocument();
  });

  it('shows the API error when applying fails', async () => {
    fetchJob.mockResolvedValue(job);
    applyToJob.mockRejectedValue(new Error('Job has already been applied to'));

    renderJob(applicant);
    await userEvent.click(await screen.findByRole('button', { name: 'Apply for this role' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Job has already been applied to');
  });

  it('does not offer to apply to a closed role', async () => {
    fetchJob.mockResolvedValue({ ...job, status: 'closed' });

    renderJob(applicant);

    expect(await screen.findByText('This role is not taking applications.')).toBeInTheDocument();
  });

  it('lets admins change the listing status', async () => {
    fetchJob.mockResolvedValue(job);
    updateJobStatus.mockResolvedValue({ ...job, status: 'closed' });

    renderJob(admin);
    await userEvent.selectOptions(await screen.findByLabelText('Listing status (admin)'), 'closed');

    expect(updateJobStatus).toHaveBeenCalledWith('data-analyst', 'closed');
    expect(await screen.findByLabelText('Listing status (admin)')).toHaveValue('closed');
  });

  it('shows not found errors', async () => {
    fetchJob.mockRejectedValue(new Error("Couldn't find Job"));

    renderJob();

    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't find Job");
  });
});
