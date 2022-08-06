# frozen_string_literal: true

Rails.application.routes.draw do
  mount_devise_token_auth_for 'User', at: 'api/auth'

  namespace :api, default: { format: :json } do
    resources :job_applications
    resources :jobs, only: %i[index show update], param: :slug
  end
end
