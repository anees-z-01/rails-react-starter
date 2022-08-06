# frozen_string_literal: true

class JobSerializer < ActiveModel::Serializer
  attributes :id, :title, :description, :status, :slug, :created_at

  has_many :job_applications
end
