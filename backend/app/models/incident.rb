class Incident < ApplicationRecord
  belongs_to :monitor, class_name: "MonitoredEndpoint", foreign_key: :monitor_id
  enum :status, { open: 0, resolved: 1 }
end
