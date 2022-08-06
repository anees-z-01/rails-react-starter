import { useContext, useEffect, useState } from "react";
import { Button, Card, Container, Form } from "react-bootstrap";
import { useParams } from "react-router";

import { AuthContext } from "../providers/AuthProvider";
import { applyToJob, fetchJob, updateJobStatus } from "../api/jobs";
import { jobStatuses } from "../constants/jobConstants";
import { dateHelper } from "../helper/dateHelper";

const Job = () => {
  const { slug } = useParams();
  const { isAdmin } = useContext(AuthContext);
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetchJob(slug, { signal: controller.signal })
      .then(setJob)
      .catch((err) => err.name !== "AbortError" && setError(err.message));
    return () => controller.abort();
  }, [slug]);

  const run = async (action) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err.message);
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
    <Container>
      {error && <p role="alert" className="text-danger">{error}</p>}
      {job && (
        <Card>
          <Card.Header as="h1" className="h4">{job.title}</Card.Header>
          <Card.Body>
            <Card.Text>{job.description}</Card.Text>
            <Card.Text>Posted {dateHelper(job.created_at)} · {job.status}</Card.Text>
            {job.application_status ? (
              <p>Your application: {job.application_status}</p>
            ) : (
              job.status === "open" && <Button disabled={busy} onClick={apply}>Apply</Button>
            )}
            {isAdmin && (
              <Form.Select aria-label="Job status" className="mt-3 w-50" disabled={busy} value={job.status}
                onChange={(e) => changeStatus(e.target.value)}>
                {jobStatuses.map(({ label, value }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Form.Select>
            )}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default Job;
