class AlertMailer < ApplicationMailer
  def down
    @incident = params[:incident]
    mail(to: @incident.monitor.user.email, subject: "[PulseWatch] API is down: #{@incident.monitor.name}") do |format|
      format.text { render plain: "#{@incident.monitor.name} is down. #{@incident.summary}" }
    end
  end

  def recovered
    @incident = params[:incident]
    mail(to: @incident.monitor.user.email, subject: "[PulseWatch] API recovered: #{@incident.monitor.name}") do |format|
      format.text { render plain: "#{@incident.monitor.name} has recovered." }
    end
  end
end
