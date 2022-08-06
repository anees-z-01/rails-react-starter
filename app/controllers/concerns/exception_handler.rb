# frozen_string_literal: true

module ExceptionHandler
  extend ActiveSupport::Concern

  included do
    rescue_from ActiveRecord::RecordNotFound do |e|
      render json: { message: "Couldn't find #{e.model}" }, status: :not_found
    end

    rescue_from ActionController::ParameterMissing do |e|
      render json: { message: "Missing parameter: #{e.param}" }, status: :bad_request
    end

    rescue_from ActiveRecord::RecordNotUnique do |e|
      render json: { message: e.message }, status: :unprocessable_entity
    end
  end
end
