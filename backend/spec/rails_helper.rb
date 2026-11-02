ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rspec/rails"
abort("The Rails environment is running in production mode!") if Rails.env.production?
ActiveRecord::Migration.maintain_test_schema!
RSpec.configure do |config|
  config.use_transactional_fixtures = true
  config.infer_spec_type_from_file_location!
end
