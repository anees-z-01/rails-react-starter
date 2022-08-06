import { PER_PAGE } from '../constants/jobConstants';
import { request } from './client';

export const fetchApplications = ({ page, filter, signal }) =>
  request('/job_applications', { params: { page, per_page: PER_PAGE, filter }, signal });

export const withdrawApplication = (id) =>
  request(`/job_applications/${id}`, { method: 'DELETE' });
