import { request } from './client';
import { applyToJob, fetchJob, fetchJobs, updateJobStatus } from './jobs';

vi.mock('./client', () => ({ request: vi.fn().mockResolvedValue({}) }));

describe('jobs api', () => {
  beforeEach(() => request.mockClear());

  it('fetchJobs forwards pagination and filter params', async () => {
    await fetchJobs({ page: 2, filter: 'closed' });

    expect(request).toHaveBeenCalledWith('/jobs', { params: { page: 2, per_page: 6, filter: 'closed' }, signal: undefined });
  });

  it('fetchJob escapes the slug', async () => {
    await fetchJob('a/b');

    expect(request).toHaveBeenCalledWith('/jobs/a%2Fb', { signal: undefined });
  });

  it('applyToJob posts the job id', async () => {
    await applyToJob(42);

    expect(request).toHaveBeenCalledWith('/job_applications', { method: 'POST', body: { job_id: 42 } });
  });

  it('updateJobStatus sends a PUT', async () => {
    await updateJobStatus('frontend-dev', 'closed');

    expect(request).toHaveBeenCalledWith('/jobs/frontend-dev', { method: 'PUT', body: { status: 'closed' } });
  });
});
