# frozen_string_literal: true

class JobSerializer < ActiveModel::Serializer
  attributes :id, :title, :description, :status, :slug, :created_at, :application_status

  # Only the signed-in user's own application is exposed; other applicants stay private.
  def application_status
    return unless current_user

    current_user.job_applications.find_by(job_id: object.id)&.status
  end
end
