class MonitorCheckJob
  include Sidekiq::Job
  sidekiq_options retry: 2, queue: :monitoring

  def perform(monitor_id)
    monitor = MonitoredEndpoint.find_by(id: monitor_id)
    return unless monitor && !monitor.paused?

    MonitorRunner.new(monitor).call
    self.class.perform_in(monitor.interval_seconds, monitor.id) if monitor.reload.status != "paused"
  end
end
