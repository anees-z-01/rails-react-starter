# frozen_string_literal: true

module Api
  class JobsController < BaseController
    before_action :authenticate_user!, only: :update
    before_action :require_admin!, only: :update

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

    # Drafts are unpublished, so only admins can list or open them.
    def visible_jobs
      current_user&.admin? ? model.all : model.where.not(status: :draft)
    end

    def job
      @job ||= visible_jobs.find_by!(slug: params[:slug])
    end

    def collection
      @collection ||= JobsCollection.new(visible_jobs.order(created_at: :desc), filter_params).results
    end

    def filter_params
      params.permit(:filter, :page, :per_page)
    end

    def updation_params
      params.permit(:status)
    end
  end
end
