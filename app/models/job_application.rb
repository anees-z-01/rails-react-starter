# frozen_string_literal: true

class JobApplication < ApplicationRecord
  belongs_to :job
  belongs_to :user

  validates :job_id, uniqueness: { scope: :user_id }
  validate :job_not_closed, on: :create

  enum status: { applied: 0, reviewed: 1, rejected: 2, withdrawn: 3 }

  def job_not_closed
    return if job.present? && %w[open draft].include?(job.status)

    errors.add(:base, 'You cannot apply to a closed job')
  end
end
