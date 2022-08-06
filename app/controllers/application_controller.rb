class ApplicationController < ActionController::API
  include DeviseTokenAuth::Concerns::SetUserByToken
  include SerializerHandler
  include ExceptionHandler

  before_action { request.session_options[:skip] = true }
end
