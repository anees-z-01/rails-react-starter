source "https://rubygems.org"

ruby "~> 3.4.0"

gem "rails", "~> 8.0.3"
gem "sqlite3", ">= 2.1"
gem "puma", ">= 6.4"
gem "bootsnap", require: false
# json 3.x drops the quirks_mode option that ActiveSupport 8.0 still passes
gem "json", "~> 2.10"
gem "tzinfo-data", platforms: %i[windows jruby]

gem "rack-cors"
gem "active_model_serializers", "~> 0.10.15"
gem "devise_token_auth", "~> 1.2.5"
gem "pagy", "~> 9.4"

group :development, :test do
  gem "faker", "~> 3.5"
  gem "rubocop-rails-omakase", require: false
end

group :test do
  gem "rspec-rails", "~> 8.0"
  gem "factory_bot_rails", "~> 6.5"
  gem "shoulda-matchers", "~> 6.5"
end
