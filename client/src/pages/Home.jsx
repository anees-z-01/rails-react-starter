import { useCallback, useContext, useState } from 'react';
import { Link } from 'react-router';

import { fetchJobs } from '../api/jobs';
import FilterTabs from '../components/FilterTabs';
import Pagination from '../components/Pagination';
import RequestState from '../components/RequestState';
import StatusBadge from '../components/StatusBadge';
import { jobStatuses } from '../constants/jobConstants';
import { formatDate } from '../helper/formatDate';
import useRequest from '../hooks/useRequest';
import { AuthContext } from '../providers/AuthProvider';

const Home = () => {
  const { isAdmin } = useContext(AuthContext);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('open');
  const load = useCallback((signal) => fetchJobs({ page, filter, signal }), [page, filter]);
  const { data, loading, error, reload } = useRequest(load);
  const jobs = data?.jobs ?? [];

  const changeFilter = (value) => {
    setPage(1);
    setFilter(value);
  };

  return (
    <section aria-labelledby="roles-heading">
      <div className="page__intro">
        <h1 id="roles-heading">Roles worth a look</h1>
        <p>Every opening on the board, newest first. Sign in to apply and follow your applications.</p>
      </div>
      <FilterTabs label="Filter roles by status" value={filter} onChange={changeFilter}
        options={jobStatuses.filter((status) => !status.adminOnly || isAdmin)} />
      <RequestState loading={loading && !data} error={error} onRetry={reload}
        empty={jobs.length === 0} emptyText={`No ${filter} roles right now.`}>
        <ul className="role-list" aria-busy={loading}>
          {jobs.map((job) => (
            <li key={job.id} className="role">
              <div className="role__meta">
                <StatusBadge status={job.status} />
                <span>Posted {formatDate(job.created_at)}</span>
              </div>
              <h2 className="role__title"><Link to={`/jobs/${job.slug}`}>{job.title}</Link></h2>
              <p className="role__summary">{job.description}</p>
              {job.application_status && (
                <p className="role__mine">You applied · <StatusBadge status={job.application_status} /></p>
              )}
            </li>
          ))}
        </ul>
        <Pagination pageInfo={data?.page_info ?? {}} onPageChange={setPage} />
      </RequestState>
    </section>
  );
};

export default Home;
