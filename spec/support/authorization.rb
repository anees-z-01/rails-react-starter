# frozen_string_literal: true

module Authorization
  def login_and_return_headers(user)
    post user_session_path, params: { email: user.email, password: user.password }.to_json,
                            headers: { 'CONTENT_TYPE': 'application/json', 'ACCEPT': 'application/json' }

    {
      'access-token': response.headers['access-token'],
      'client': response.headers['client'],
      'uid': response.headers['uid']
    }
  end
end
