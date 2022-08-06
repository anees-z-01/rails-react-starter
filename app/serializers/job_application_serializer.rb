# frozen_string_literal: true

class JobApplicationSerializer < ActiveModel::Serializer
  attributes :id, :status, :job_id, :created_at

  belongs_to :job
end
