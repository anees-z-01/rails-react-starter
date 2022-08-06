import { per_page } from "../constants/jobConstants";
import baseApi from "./baseApi";

export const fetchJobApplication = (page, filter, setJobApplication) =>
    baseApi
        .get("/job_applications", {
            params: {
                page,
                per_page,
                filter
            }
        })
        .then((res) => {
            setJobApplication(res.data);
        })
        .catch((err) => {
            setJobApplication([]);
            return Promise.reject(err)
        });

export const deleteJobApplication = (id) =>
    baseApi
        .delete(`/job_applications/${id}`).then((res) => res)
        .catch((err) => Promise.reject(err))
