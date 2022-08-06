import { per_page } from "../constants/jobConstants";
import baseApi from "./baseApi";

export const fetchJobs = (page, filter, setJobs) =>
    baseApi
        .get("/jobs", {
            params: {
                page,
                per_page,
                filter
            }
        })
        .then((res) => {
            setJobs(res.data);
        })
        .catch((err) => Promise.reject(err));


export const fetchJob = (slug, setJob) =>
    baseApi
        .get("/jobs/" + slug)
        .then((res) => {
            setJob(res.data);
        })
        .catch((err) => {
            return Promise.reject(err)
        });

export const applyJob = (id, setJob) =>
    baseApi
        .post("/job_applications", { job_id: id })
        .then((res) => res)
        .catch((err) =>
            Promise.reject(err)
        )

export const updateJobStatus = (slug, status, setJob) =>
    baseApi
        .put(`/jobs/${slug}`, { status })
        .then((res) => setJob(res.data))
        .catch((err) =>
            Promise.reject(err)
        )

