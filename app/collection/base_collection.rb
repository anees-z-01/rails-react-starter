# frozen_string_literal: true

class BaseCollection
  include Pagy::Backend

  PAGE = 1
  PER_PAGE = 5

  attr_reader :params, :relation

  def initialize(relation, params)
    @relation = relation
    @params = params
  end

  def results
    @results ||= begin
      pagy, records = pagy(filtered, page: params[:page] || PAGE, limit: params[:per_page] || PER_PAGE)

      {
        data: records,
        page_info: { prev: pagy.prev, next: pagy.next, items: pagy.limit, count: pagy.count, page: pagy.page }
      }
    end
  end

  private

  def filtered
    raise NotImplementedError
  end

  def status_filter
    status = params[:filter].to_s
    status if relation.model.statuses.key?(status)
  end
end
