const LABELS = {
  open: 'Open', closed: 'Closed', draft: 'Draft',
  applied: 'Applied', reviewed: 'In review', rejected: 'Not selected', withdrawn: 'Withdrawn',
};

const StatusBadge = ({ status }) => (
  <span className={`badge badge--${status}`}>{LABELS[status] ?? status}</span>
);

export default StatusBadge;
