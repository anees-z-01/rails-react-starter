import { PER_PAGE } from '../constants/jobConstants';
import { request } from './client';

export const fetchJobs = ({ page, filter, signal }) =>
  request('/jobs', { params: { page, per_page: PER_PAGE, filter }, signal });

export const fetchJob = (slug, { signal } = {}) =>
  request(`/jobs/${encodeURIComponent(slug)}`, { signal });

export const updateJobStatus = (slug, status) =>
  request(`/jobs/${encodeURIComponent(slug)}`, { method: 'PUT', body: { status } });

export const applyToJob = (jobId) =>
  request('/job_applications', { method: 'POST', body: { job_id: jobId } });
