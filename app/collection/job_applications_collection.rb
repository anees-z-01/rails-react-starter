# frozen_string_literal: true

class JobApplicationsCollection < BaseCollection
  attr_reader :current_user

  def initialize(current_user, relation, params)
    @current_user = current_user

    super(relation, params)
  end

  private

  def filter_by_status
    @relation = current_user.job_applications
    status = params[:filter].to_s
    return unless JobApplication.statuses.key?(status)

    filter { @relation.public_send(status) }
  end
end
