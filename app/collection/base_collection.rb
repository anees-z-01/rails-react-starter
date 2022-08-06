# frozen_string_literal: true

class BaseCollection
  include Pagy::Backend

  PER_PAGE = 5
  MAX_PER_PAGE = 50

  attr_reader :params, :relation

  def initialize(relation, params)
    @relation = relation
    @params = params
  end

  def results
    @results ||= begin
      pagy, records = pagy(filtered, page: page, limit: per_page)

      {
        data: records,
        page_info: { page: pagy.page, pages: pagy.pages, per_page: pagy.limit,
                     count: pagy.count, prev: pagy.prev, next: pagy.next }
      }
    end
  end

  private

  def filtered
    raise NotImplementedError
  end

  def page
    [ params[:page].to_i, 1 ].max
  end

  def per_page
    requested = params[:per_page].to_i
    requested.positive? ? [ requested, MAX_PER_PAGE ].min : PER_PAGE
  end

  def status_filter
    status = params[:filter].to_s
    status if relation.model.statuses.key?(status)
  end
end
