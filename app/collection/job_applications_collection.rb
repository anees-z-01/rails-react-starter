# frozen_string_literal: true

class JobApplicationsCollection < BaseCollection
  private

  def filtered
    status_filter ? relation.where(status: status_filter) : relation.not_withdrawn
  end
end
