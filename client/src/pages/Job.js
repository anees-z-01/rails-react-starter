import { useContext, useEffect, useState } from "react";
import { Container, Form, Button, Card } from "react-bootstrap";
import { useParams } from "react-router-dom";

import { AuthContext } from "../providers/AuthProvider";
import { applyJob, fetchJob, updateJobStatus } from "../api/jobApi";
import { jobStatuses } from "../constants/jobConstants";
import { dateHelper } from "../helper/dateHelper";

const Job = () => {
  const params = useParams();
  const { id } = useContext(AuthContext);
  const [job, setJob] = useState(null);
  const [refetch, setRefetch] = useState(false);

  const apply = (jobId) =>
    applyJob(jobId).then(() => setRefetch(!refetch));

  useEffect(() => {
    fetchJob(params.slug, setJob)
  }, [refetch, params.slug]);

  return (
    <Container>
      {job && (
        <Card>
          <Card.Header as="h5">
            <span style={{ marginRight: "2rem", fontWeight: "bolder" }}>
              Job slug
            </span>
            {job.slug}
            <span className="float-end">
              {
                job.job_applications.some((job_application) => job_application.user_id === id) ?
                  <Button disabled>Applied</Button>
                  :
                  <Button onClick={() => apply(job.id)}>Apply</Button>
              }
            </span>
          </Card.Header>
          <Card.Body>
            <Card.Title>
              <span style={{ marginRight: "2rem", fontWeight: "bolder" }}>
                Job title
              </span>
              {job.title}
            </Card.Title>
            <Card.Text>
              <span style={{ marginRight: "2rem", fontWeight: "bolder" }}>
                Description
              </span>
              {job.description}
            </Card.Text>
            <Card.Text>
              <span style={{ marginRight: "2rem", fontWeight: "bolder" }}>
                Created at
              </span>
              {dateHelper(job.created_at)}
            </Card.Text>
            <Card.Text>
              <Form.Select className="w-50 m-auto" value={job.status} onChange={(e) => updateJobStatus(job.slug, e.target.value, setJob)}>
                {jobStatuses.map(({ label, value }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Form.Select>
            </Card.Text>
          </Card.Body>
        </Card>
      )
      }
    </Container >
  );
};

export default Job;
