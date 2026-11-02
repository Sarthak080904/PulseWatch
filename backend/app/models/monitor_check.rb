class MonitorCheck < ApplicationRecord
  belongs_to :monitor, class_name: "MonitoredEndpoint", foreign_key: :monitor_id
  validates :checked_at, presence: true
end
