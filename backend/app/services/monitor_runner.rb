class MonitorRunner
  def initialize(monitor)
    @monitor = monitor
  end

  def call
    started = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    response = Faraday.new do |f|
      f.options.timeout = 10
      f.options.open_timeout = 5
      f.adapter Faraday.default_adapter
    end.run_request(@monitor.http_method.to_sym, @monitor.url, nil, {})
    elapsed = ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - started) * 1000).round
    success = response.status == @monitor.expected_status

    check = @monitor.monitor_checks.create!(
      status_code: response.status,
      response_time_ms: elapsed,
      success: success,
      error_message: success ? nil : "Expected HTTP #{@monitor.expected_status}, received #{response.status}",
      checked_at: Time.current
    )
    update_state(success, check)
    check
  rescue Faraday::Error, SocketError, Timeout::Error => e
    elapsed ||= 0
    check = @monitor.monitor_checks.create!(
      status_code: nil, response_time_ms: elapsed, success: false,
      error_message: e.message.to_s.truncate(500), checked_at: Time.current
    )
    update_state(false, check)
    check
  end

  private

  def update_state(success, check)
    if success
      @monitor.update!(status: :up, last_checked_at: check.checked_at)
      incident = @monitor.incidents.open.order(created_at: :desc).first
      if incident
        incident.update!(status: :resolved, resolved_at: Time.current)
        AlertMailer.with(incident: incident).recovered.deliver_later
      end
    else
      @monitor.update!(status: :down, last_checked_at: check.checked_at)
      incident = @monitor.incidents.open.first_or_create!(
        started_at: Time.current, summary: check.error_message || "HTTP #{@monitor.url} failed"
      )
      AlertMailer.with(incident: incident).down.deliver_later if incident.previously_new_record?
    end
  end
end
