# frozen_string_literal: true

class JobsCollection < BaseCollection
  private

  def filtered
    status_filter ? relation.where(status: status_filter) : relation.open
  end
end
