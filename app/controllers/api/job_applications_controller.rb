# frozen_string_literal: true

module Api
  class JobApplicationsController < BaseController
    before_action :authenticate_user!

    actions :index

    def show
      render json: job_application
    end

    def create
      job_application = current_user.job_applications.new(permitted_params)

      if job_application.save
        render json: job_application, status: :created
      else
        render json: { message: job_application.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      job_application.withdrawn!

      render json: job_application
    end

    def update
      if job_application.update(updation_params)
        render json: job_application
      else
        render json: { message: job_application.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private

    def collection
      @collection ||= JobApplicationsCollection.new(current_user, current_user.job_applications.not_withdrawn, filter_params).results
    end

    def job_application
      @job_application ||= current_user.job_applications.find(params[:id])
    end

    def permitted_params
      params.permit(:job_id)
    end

    def filter_params
      params.permit(:filter, :page, :per_page)
    end

    def updation_params
      params.permit(:status)
    end
  end
end
