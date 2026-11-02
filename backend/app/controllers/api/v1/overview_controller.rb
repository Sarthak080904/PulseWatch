module Api
  module V1
    class OverviewController < ApplicationController
      def show
        monitors = current_user.monitors
        checks = MonitorCheck.joins(:monitor).where(monitors: { user_id: current_user.id }).where(checked_at: 24.hours.ago..)
        total = checks.count
        successful = checks.where(success: true).count
        average = checks.average(:response_time_ms)&.round || 0

        render json: {
          total_monitors: monitors.count,
          up_monitors: monitors.up.count,
          down_monitors: monitors.down.count,
          open_incidents: Incident.joins(:monitor).where(monitors: { user_id: current_user.id }, status: :open).count,
          uptime_24h: total.zero? ? 100.0 : (successful.to_f / total * 100).round(2),
          average_response_ms_24h: average
        }
      end
    end
  end
end
