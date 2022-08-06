# frozen_string_literal: true

require "rails_helper"

RSpec.describe "db/seeds.rb" do
  def run_seeds
    expect { load Rails.root.join("db/seeds.rb") }.to output(/Seeded/).to_stdout
  end

  it "creates the demo accounts, jobs in every status and applications" do
    run_seeds

    expect(User.find_by(email: "admin@example.com")).to be_admin
    expect(User.find_by(email: "demo@example.com")).not_to be_admin
    expect(Job.statuses.keys.map { |status| Job.where(status: status).count }).to all(be_positive)
    expect(User.find_by(email: "demo@example.com").job_applications.distinct.pluck(:status))
      .to match_array(JobApplication.statuses.keys)
  end

  it "can be run twice without duplicating anything" do
    run_seeds
    counts = [ User.count, Job.count, JobApplication.count ]

    run_seeds

    expect([ User.count, Job.count, JobApplication.count ]).to eq(counts)
  end
end
