# frozen_string_literal: true

class JobApplication < ApplicationRecord
  # Applicants can only pull out; reviewing and rejecting is an admin decision.
  APPLICANT_STATUSES = %w[withdrawn].freeze

  belongs_to :job
  belongs_to :user

  validates :job_id, uniqueness: { scope: :user_id, message: "has already been applied to" }
  validate :job_open, on: :create

  enum :status, { applied: 0, reviewed: 1, rejected: 2, withdrawn: 3 }, validate: true

  def withdrawable?
    applied? || reviewed?
  end

  private

  def job_open
    return if job.nil? || job.open?

    errors.add(:base, "You can only apply to an open job")
  end
end
