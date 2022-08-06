# The browser client normally talks to the API through the Vite proxy (same
# origin). CORS only matters when the client is served from another origin.
allowed_origins = ENV.fetch("CORS_ORIGINS", "http://localhost:5173").split(",").map(&:strip)

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(*allowed_origins)

    resource "*",
      headers: :any,
      expose: %w[access-token client uid expiry token-type],
      methods: %i[get post put patch delete options head]
  end
end
