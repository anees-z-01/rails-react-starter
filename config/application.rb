require_relative "boot"

require "rails"
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_view/railtie"

Bundler.require(*Rails.groups)

module JobBoard
  class Application < Rails::Application
    config.load_defaults 8.0
    config.autoload_lib(ignore: %w[tasks])

    config.api_only = true

    # Devise/Warden write to the session during sign-in even with
    # devise_token_auth. A cookie store is mounted so those writes succeed, and
    # ApplicationController skips persisting it, so no session cookie is sent.
    config.session_store :cookie_store, key: "_job_board_session"
    config.middleware.use ActionDispatch::Cookies
    config.middleware.use config.session_store, config.session_options
  end
end
