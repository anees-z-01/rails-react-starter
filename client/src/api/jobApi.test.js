import baseApi from "./baseApi";
import { applyJob, fetchJob, fetchJobs, updateJobStatus } from "./jobApi";

vi.mock("./baseApi", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn() }
}));

describe("jobApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetchJobs forwards pagination and filter params", async () => {
    const setJobs = vi.fn();
    baseApi.get.mockResolvedValue({ data: { jobs: [] } });

    await fetchJobs(2, "closed", setJobs);

    expect(baseApi.get).toHaveBeenCalledWith("/jobs", {
      params: { page: 2, per_page: 6, filter: "closed" }
    });
    expect(setJobs).toHaveBeenCalledWith({ jobs: [] });
  });

  it("fetchJob loads and stores a single job", async () => {
    const setJob = vi.fn();
    baseApi.get.mockResolvedValue({ data: { slug: "frontend-dev" } });

    await fetchJob("frontend-dev", setJob);

    expect(baseApi.get).toHaveBeenCalledWith("/jobs/frontend-dev");
    expect(setJob).toHaveBeenCalledWith({ slug: "frontend-dev" });
  });

  it("applyJob posts a job application payload", async () => {
    baseApi.post.mockResolvedValue({ data: { id: 42 } });

    const response = await applyJob(42);

    expect(baseApi.post).toHaveBeenCalledWith("/job_applications", { job_id: 42 });
    expect(response).toEqual({ data: { id: 42 } });
  });

  it("updateJobStatus updates server and local state", async () => {
    const setJob = vi.fn();
    baseApi.put.mockResolvedValue({ data: { status: "closed" } });

    await updateJobStatus("frontend-dev", "closed", setJob);

    expect(baseApi.put).toHaveBeenCalledWith("/jobs/frontend-dev", { status: "closed" });
    expect(setJob).toHaveBeenCalledWith({ status: "closed" });
  });
});
