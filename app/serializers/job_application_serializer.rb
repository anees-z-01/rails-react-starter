# frozen_string_literal: true

class JobApplicationSerializer < ActiveModel::Serializer
  attributes :id, :status, :user_id, :job_id

  belongs_to :job
  belongs_to :user
end
