import { useCallback, useState } from 'react';
import { Link } from 'react-router';

import { fetchApplications, withdrawApplication } from '../api/jobApplications';
import FilterTabs from '../components/FilterTabs';
import Pagination from '../components/Pagination';
import RequestState from '../components/RequestState';
import StatusBadge from '../components/StatusBadge';
import { jobApplicationsStatuses } from '../constants/jobConstants';
import { formatDate } from '../helper/formatDate';
import useRequest from '../hooks/useRequest';

const WITHDRAWABLE = ['applied', 'reviewed'];

const Applications = () => {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [withdrawError, setWithdrawError] = useState(null);
  const load = useCallback((signal) => fetchApplications({ page, filter, signal }), [page, filter]);
  const { data, loading, error, reload } = useRequest(load);
  const applications = data?.job_applications ?? [];

  const changeFilter = (value) => {
    setPage(1);
    setFilter(value);
  };

  const withdraw = async (id) => {
    setWithdrawError(null);
    try {
      await withdrawApplication(id);
      reload();
    } catch (err) {
      setWithdrawError(err.message);
    }
  };

  return (
    <section aria-labelledby="applications-heading">
      <div className="page__intro">
        <h1 id="applications-heading">My applications</h1>
        <p>Where each of your applications stands. Withdrawn ones are kept under their own tab.</p>
      </div>
      <FilterTabs label="Filter applications by status" value={filter} onChange={changeFilter}
        options={jobApplicationsStatuses} />
      {withdrawError && <p className="notice notice--error" role="alert">{withdrawError}</p>}
      <RequestState loading={loading && !data} error={error} onRetry={reload}
        empty={applications.length === 0} emptyText="Nothing here yet. Find a role and apply from its page.">
        <ul className="application-list" aria-busy={loading}>
          {applications.map((application) => (
            <li key={application.id} className="application">
              <div>
                <h2 className="application__title">
                  <Link to={`/jobs/${application.job.slug}`}>{application.job.title}</Link>
                </h2>
                <p className="application__meta">
                  Applied {formatDate(application.created_at)} · role is {application.job.status}
                </p>
              </div>
              <StatusBadge status={application.status} />
              {WITHDRAWABLE.includes(application.status) && (
                <button type="button" className="button button--ghost button--small"
                  aria-label={`Withdraw application for ${application.job.title}`}
                  onClick={() => withdraw(application.id)}>
                  Withdraw
                </button>
              )}
            </li>
          ))}
        </ul>
        <Pagination pageInfo={data?.page_info ?? {}} onPageChange={setPage} />
      </RequestState>
    </section>
  );
};

export default Applications;
