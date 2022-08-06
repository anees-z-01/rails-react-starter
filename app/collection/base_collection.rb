# frozen_string_literal: true

class BaseCollection
  include Pagy::Backend

  PAGE = 1
  PER_PAGE = 5

  attr_reader :params

  def initialize(relation, params)
    @relation = relation
    @params = params
  end

  def results
    @results ||= begin
      ensure_filters
      paginate

      {
        data: @relation,
        page_info: @page_info.vars.slice(:prev, :next, :items, :count, :page)
      }
    end
  end

  protected

  def ensure_filters
    filter_by_status if params[:filter]
  end

  private

  def filter
    @relation = yield
  end

  def paginate
    @page_info, @relation = pagy(@relation, page: params[:page] || PAGE, items: params[:per_page] || PER_PAGE)
  end

  def model
    @relation.model
  end
end
