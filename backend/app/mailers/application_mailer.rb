class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch("SMTP_FROM", "alerts@pulsewatch.local")
  layout false
end
