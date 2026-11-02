module Api
  module V1
    class MonitorsController < ApplicationController
      before_action :set_monitor, only: %i[show update destroy check_now checks]

      def index
        monitors = current_user.monitors.order(created_at: :desc)
        render json: monitors.as_json(only: %i[id name url http_method status interval_seconds expected_status last_checked_at created_at])
      end

      def show
        render json: @monitor.as_json(include: { monitor_checks: { only: %i[id status_code response_time_ms success error_message checked_at] } })
      end

      def create
        monitor = current_user.monitors.new(monitor_params)
        if monitor.save
          render json: monitor, status: :created
        else
          render json: { errors: monitor.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @monitor.update(monitor_params)
          render json: @monitor
        else
          render json: { errors: @monitor.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @monitor.destroy!
        head :no_content
      end

      def check_now
        MonitorCheckJob.perform_async(@monitor.id)
        render json: { message: "A health check has been queued." }, status: :accepted
      end

      def checks
        render json: @monitor.monitor_checks.order(checked_at: :desc).limit(100)
      end

      private

      def set_monitor
        @monitor = current_user.monitors.find(params[:id])
      end

      def monitor_params
        params.require(:monitor).permit(:name, :url, :http_method, :interval_seconds, :expected_status)
      end
    end
  end
end
