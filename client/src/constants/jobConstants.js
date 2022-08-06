export const jobStatuses = [
  { label: 'Open', value: 'open' },
  { label: 'Closed', value: 'closed' },
  { label: 'Draft', value: 'draft', adminOnly: true },
];

// No filter means "everything except withdrawn" on the API side.
export const jobApplicationsStatuses = [
  { label: 'Active', value: '' },
  { label: 'Applied', value: 'applied' },
  { label: 'Reviewed', value: 'reviewed' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Withdrawn', value: 'withdrawn' },
];

export const PER_PAGE = 6;
