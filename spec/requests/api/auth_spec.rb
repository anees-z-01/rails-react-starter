# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Auth", type: :request do
  it "does not let a new account make itself an admin" do
    post "/api/auth", params: { email: "new.user@example.com", password: "long-enough-pass",
                                password_confirmation: "long-enough-pass", admin: true }

    expect(response).to have_http_status(:ok)
    expect(User.find_by(email: "new.user@example.com")).not_to be_admin
  end

  it "includes the admin flag in the token validation payload" do
    admin = create(:user, :admin)

    get "/api/auth/validate_token", headers: login_and_return_headers(admin)

    expect(JSON.parse(response.body).dig("data", "admin")).to be(true)
  end

  it "does not set a session cookie on sign-in" do
    user = create(:user)
    login_and_return_headers(user)

    expect(response.headers["Set-Cookie"].to_s).not_to include("_job_board_session")
  end
end
