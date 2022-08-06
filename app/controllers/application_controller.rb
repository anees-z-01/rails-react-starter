class ApplicationController < ActionController::API
  include DeviseTokenAuth::Concerns::SetUserByToken
  include SerializerHandler
  include ExceptionHandler
end
