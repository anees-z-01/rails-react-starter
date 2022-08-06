import { useState, useEffect } from "react";
import { Form, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

import Pagination from "../components/Pagination";
import { fetchJobs } from "../api/jobApi";
import { jobStatuses } from "../constants/jobConstants";
import { dateHelper } from "../helper/dateHelper";

const Home = () => {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('open')
  const [jobs, setJobs] = useState(null);

  useEffect(() => {
    fetchJobs(page, filter, setJobs)
  }, [filter, page]);

  return (
    <div>
      <h1 className="text-center">Jobs</h1>
      <Form.Select className="mb-4 w-50 m-auto" onChange={(e) => setFilter(e.target.value)}>
        {jobStatuses.map(({ label, value }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </Form.Select>
      {
        jobs?.jobs?.length > 0 && (
          <>
            <div className="d-flex flex-wrap">
              {jobs.jobs.map((job) => (
                <Card key={job.id} className="mb-3" style={{ width: "24rem", margin: "auto" }}>
                  <Card.Header as="h5">
                    Job status
                    <span className="float-end">
                      {job.status}
                    </span>
                  </Card.Header>
                  <Card.Body>
                    <Card.Title>
                      <span style={{ marginRight: "2rem", fontWeight: "bolder" }}>
                        Title
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
                    <Link className="btn btn-secondary" to={`/jobs/` + job.slug}>View Job</Link>
                  </Card.Body>
                </Card>
              ))}
            </div>
            <Pagination
              pageInfo={jobs.page_info}
              setPage={setPage}
            />
          </>
        ) || <h1 className="text-center">No Job found</h1>
      }
    </div >
  );
};

export default Home;
