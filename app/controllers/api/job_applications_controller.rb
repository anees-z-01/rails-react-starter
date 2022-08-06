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
      return render_not_withdrawable unless job_application.withdrawable?

      job_application.withdrawn!
      render json: job_application
    end

    def update
      application = current_user.admin? ? JobApplication.find(params[:id]) : job_application
      status = params.require(:status).to_s

      unless current_user.admin? || JobApplication::APPLICANT_STATUSES.include?(status)
        return render json: { message: "Only admins can mark an application #{status}" }, status: :forbidden
      end
      return render_not_withdrawable if status == "withdrawn" && !application.withdrawable?

      if application.update(status: status)
        render json: application
      else
        render json: { message: application.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private

    def render_not_withdrawable
      render json: { message: "Only applied or reviewed applications can be withdrawn" }, status: :unprocessable_entity
    end

    def collection
      @collection ||= JobApplicationsCollection.new(
        current_user.job_applications.includes(:job).order(created_at: :desc), filter_params
      ).results
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
  end
end
