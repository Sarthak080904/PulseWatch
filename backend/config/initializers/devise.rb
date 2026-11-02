require "devise/orm/active_record"

Devise.setup do |config|
  config.mailer_sender = ENV.fetch("SMTP_FROM", "alerts@pulsewatch.local")
  config.parent_controller = "ActionController::API"
  config.navigational_formats = []
  config.jwt do |jwt|
    jwt.secret = ENV.fetch("DEVISE_JWT_SECRET_KEY") { Rails.application.secret_key_base }
    jwt.dispatch_requests = [["POST", %r{^/auth/login$}], ["POST", %r{^/auth/register$}]]
    jwt.revocation_requests = [["DELETE", %r{^/auth/logout$}]]
    jwt.expiration_time = 1.day.to_i
  end
end
