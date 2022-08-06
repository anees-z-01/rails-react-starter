class ApplicationController < ActionController::API
  include DeviseTokenAuth::Concerns::SetUserByToken
  include SerializerHandler
  include ExceptionHandler

  before_action { request.session_options[:skip] = true }

  private

  def require_admin!
    return if current_user&.admin?

    render json: { message: "Only admins can do that" }, status: :forbidden
  end
end
