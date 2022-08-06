# frozen_string_literal: true

Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  mount_devise_token_auth_for "User", at: "api/auth"

  namespace :api, defaults: { format: :json } do
    resources :job_applications, only: %i[index show create update destroy]
    resources :jobs, only: %i[index show update], param: :slug
  end
end
