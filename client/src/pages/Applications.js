import { useState, useContext, useEffect } from "react";
import { Button, Card, Form } from "react-bootstrap";

import baseApi from "../api/baseApi";
import Pagination from "../components/Pagination";
import { AuthContext } from "../providers/AuthProvider";
import { deleteJobApplication, fetchJobApplication } from "../api/jobApplicationApi";
import { jobApplicationsStatuses } from "../constants/jobConstants";

const Applications = () => {
  const { authenticated } = useContext(AuthContext);
  const [jobApplications, setJobApplication] = useState(null);
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('all')

  const updateJobStatus = (id, status) => {
    baseApi
      .put(`/job_applications/${id}`, { status })
      .then(() => fetchJobApplication(page, filter, setJobApplication));
  }

  const deleteToJob = (id) => {
    deleteJobApplication(id).then(() => fetchJobApplication(page, filter, setJobApplication))
  };

  useEffect(() => {
    fetchJobApplication(page, filter, setJobApplication)
  }, [page, filter]);

  const renderPage = () => {
    if (authenticated) {
      return (
        <div>
          <h1 className="text-center">My Applications</h1>
          <Form.Select className="mb-4 w-50 m-auto" onChange={(e) => setFilter(e.target.value)}>
            {jobApplicationsStatuses.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Form.Select>
          {jobApplications?.job_applications?.length > 0 && (
            <>
              <div className="d-flex flex-wrap">
                {jobApplications.job_applications
                  .map((jobApplication) => (
                    <Card key={jobApplication.id} className="mb-3" style={{ width: "24rem", margin: "auto" }}>
                      <Card.Header as="h5">
                        Job status
                        <span className="float-end">
                          {jobApplication.status}
                        </span>
                      </Card.Header>
                      <Card.Body>
                        <Card.Title>
                          <span
                            style={{ marginRight: "2rem", fontWeight: "bolder" }}
                          >
                            Title
                          </span>
                          {jobApplication?.job.title}
                        </Card.Title>
                        <Card.Text>
                          <span
                            style={{ marginRight: "2rem", fontWeight: "bolder" }}
                          >
                            Status
                          </span>
                          {jobApplication?.job.status}
                        </Card.Text>
                        <Card.Text>Update application status</Card.Text>
                        <Card.Text>
                        <Form.Select value={jobApplication.status} onChange={(e) => updateJobStatus(jobApplication.id, e.target.value)}>
                            {jobApplicationsStatuses.slice(1).map(({ label, value }) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </Form.Select>
                        </Card.Text>

                      </Card.Body>
                      <Button variant="danger" onClick={() => deleteToJob(jobApplication.id)}>Withdraw</Button>
                    </Card>
                  ))}
              </div>
              <Pagination
                pageInfo={jobApplications.page_info}
                setPage={setPage}
              />
            </>
          ) || <h1 className="text-center">No Job Application found</h1>
          }
        </div>
      );
    } else {
      return <p>You must be logged in</p>;
    }
  };
  return renderPage();
};

export default Applications;
