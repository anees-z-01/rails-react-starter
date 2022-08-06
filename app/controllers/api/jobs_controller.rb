# frozen_string_literal: true

module Api
  class JobsController < BaseController
    actions :index

    def show
      render json: job
    end

    def update
      if job.update(updation_params)
        render json: job
      else
        render json: { message: job.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private

    def job
      @job ||= model.find_by!(slug: params[:slug])
    end

    def collection
      @collection ||= JobsCollection.new(model.open, filter_params).results
    end

    def filter_params
      params.permit(:filter, :page, :per_page)
    end

    def updation_params
      params.permit(:status)
    end
  end
end
