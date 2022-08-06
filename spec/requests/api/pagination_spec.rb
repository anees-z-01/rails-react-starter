# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Pagination", type: :request do
  before { create_list(:job, 7, :open) }

  def page_info
    JSON.parse(response.body)["page_info"]
  end

  def jobs
    JSON.parse(response.body)["jobs"]
  end

  it "returns page metadata" do
    get "/api/jobs", params: { per_page: 3 }

    expect(page_info).to include("page" => 1, "pages" => 3, "per_page" => 3, "count" => 7, "prev" => nil, "next" => 2)
    expect(jobs.size).to eq(3)
  end

  it "uses the default page size when per_page is missing or invalid" do
    [ nil, "0", "-4", "abc" ].each do |value|
      get "/api/jobs", params: { per_page: value }.compact

      expect(page_info["per_page"]).to eq(BaseCollection::PER_PAGE)
    end
  end

  it "caps per_page" do
    get "/api/jobs", params: { per_page: 10_000 }

    expect(page_info["per_page"]).to eq(BaseCollection::MAX_PER_PAGE)
  end

  it "treats a zero, negative or non-numeric page as page 1" do
    [ "0", "-2", "abc" ].each do |value|
      get "/api/jobs", params: { page: value, per_page: 3 }

      expect(response).to have_http_status(:ok)
      expect(page_info["page"]).to eq(1)
    end
  end

  it "returns the last page when the requested page is past the end" do
    get "/api/jobs", params: { page: 99, per_page: 3 }

    expect(response).to have_http_status(:ok)
    expect(page_info["page"]).to eq(3)
    expect(jobs.size).to eq(1)
  end

  it "returns one empty page when there is nothing to list" do
    Job.delete_all

    get "/api/jobs", params: { page: 2 }

    expect(response).to have_http_status(:ok)
    expect(page_info).to include("page" => 1, "pages" => 1, "count" => 0)
    expect(jobs).to be_empty
  end
end
