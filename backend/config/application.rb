require_relative "boot"
require "rails/all"
require_relative "../app/models/application_record"

Bundler.require(*Rails.groups)

module PulseWatch
  class Application < Rails::Application
    config.load_defaults 8.0
    config.api_only = true
    config.active_job.queue_adapter = :sidekiq
    config.middleware.use Rack::Cors do
      allow do
        origins ENV.fetch("FRONTEND_ORIGIN", "http://localhost:5173")
        resource "*", headers: :any, methods: %i[get post put patch delete options], expose: ["Authorization"]
      end
    end
  end
end
