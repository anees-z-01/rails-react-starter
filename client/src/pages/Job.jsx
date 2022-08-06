import { useCallback, useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';

import { applyToJob, fetchJob, updateJobStatus } from '../api/jobs';
import RequestState from '../components/RequestState';
import StatusBadge from '../components/StatusBadge';
import { jobStatuses } from '../constants/jobConstants';
import { formatDate } from '../helper/formatDate';
import useRequest from '../hooks/useRequest';
import { AuthContext } from '../providers/AuthProvider';

const ApplyPanel = ({ job, authenticated, busy, onApply }) => {
  if (job.application_status) {
    return <p>Your application is <StatusBadge status={job.application_status} /></p>;
  }
  if (job.status !== 'open') return <p>This role is not taking applications.</p>;
  if (!authenticated) {
    return <p><Link to="/login" state={{ from: `/jobs/${job.slug}` }}>Sign in</Link> to apply for this role.</p>;
  }
  return <button type="button" className="button" disabled={busy} onClick={onApply}>Apply for this role</button>;
};

const Job = () => {
  const { slug } = useParams();
  const { authenticated, isAdmin } = useContext(AuthContext);
  const load = useCallback((signal) => fetchJob(slug, { signal }), [slug]);
  const { data, loading, error } = useRequest(load);
  const [job, setJob] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => setJob(data), [data]);

  const run = async (action) => {
    setBusy(true);
    setActionError(null);
    try {
      await action();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const apply = () => run(async () => {
    const application = await applyToJob(job.id);
    setJob({ ...job, application_status: application.status });
  });

  const changeStatus = (status) => run(async () => setJob(await updateJobStatus(job.slug, status)));

  return (
    <article className="job">
      <Link to="/" className="back-link">← All roles</Link>
      <RequestState loading={loading || !job} error={error}>
        {job && (
          <>
            <header className="job__header">
              <StatusBadge status={job.status} />
              <h1>{job.title}</h1>
              <p className="job__posted">Posted {formatDate(job.created_at)}</p>
            </header>
            <div className="job__body">
              <p className="job__description">{job.description}</p>
              <aside className="job__panel" aria-label="Your application">
                <ApplyPanel job={job} authenticated={authenticated} busy={busy} onApply={apply} />
                {actionError && <p className="field-error" role="alert">{actionError}</p>}
                {isAdmin && (
                  <div className="field">
                    <label htmlFor="job-status">Listing status (admin)</label>
                    <select id="job-status" value={job.status} disabled={busy}
                      onChange={(event) => changeStatus(event.target.value)}>
                      {jobStatuses.map(({ label, value }) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                )}
              </aside>
            </div>
          </>
        )}
      </RequestState>
    </article>
  );
};

export default Job;
