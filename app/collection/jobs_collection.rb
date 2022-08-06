# frozen_string_literal: true

class JobsCollection < BaseCollection
  private

  def filter_by_status
    @relation = model.all
    status = params[:filter].to_s
    return unless model.statuses.key?(status)

    filter { @relation.public_send(status) }
  end
end
