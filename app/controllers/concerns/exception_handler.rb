# frozen_string_literal: true

module ExceptionHandler
  extend ActiveSupport::Concern

  included do
    rescue_from ActiveRecord::RecordNotFound, ActiveRecord::RecordNotUnique do |e|
      render json: { message: e.message }, status: :not_found
    end

    rescue_from ActiveRecord::RecordNotUnique, Pagy::OverflowError do |e|
      render json: { message: e.message }, status: :unprocessable_entity
    end
  end
end
