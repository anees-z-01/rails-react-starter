import { useCallback, useEffect, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";

import Pagination from "../components/Pagination";
import { fetchApplications, withdrawApplication } from "../api/jobApplications";
import { jobApplicationsStatuses } from "../constants/jobConstants";

const Applications = () => {
  const [applications, setApplications] = useState(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState(null);

  const load = useCallback((signal) => {
    setError(null);
    return fetchApplications({ page, filter, signal })
      .then(setApplications)
      .catch((err) => err.name !== "AbortError" && setError(err.message));
  }, [page, filter]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const withdraw = (id) => withdrawApplication(id).then(() => load()).catch((err) => setError(err.message));

  const list = applications?.job_applications ?? [];

  return (
    <div>
      <h1 className="text-center">My applications</h1>
      {error && <p role="alert" className="text-danger text-center">{error}</p>}
      <Form.Select aria-label="Application status" className="mb-4 w-50 m-auto" value={filter}
        onChange={(e) => { setPage(1); setFilter(e.target.value); }}>
        {jobApplicationsStatuses.map(({ label, value }) => (
          <option key={label} value={value}>{label}</option>
        ))}
      </Form.Select>
      {applications && list.length === 0 && <p className="text-center">No applications here yet.</p>}
      {list.map((application) => (
        <Card key={application.id} className="mb-3">
          <Card.Body>
            <Card.Title>{application.job.title}</Card.Title>
            <Card.Text>Application: {application.status} · Job: {application.job.status}</Card.Text>
            {application.status !== "withdrawn" && (
              <Button variant="danger" onClick={() => withdraw(application.id)}>Withdraw</Button>
            )}
          </Card.Body>
        </Card>
      ))}
      {list.length > 0 && <Pagination pageInfo={applications.page_info} setPage={setPage} />}
    </div>
  );
};

export default Applications;
