class MonitoredEndpoint < ApplicationRecord
  self.table_name = "monitors"

  belongs_to :user
  has_many :monitor_checks, foreign_key: :monitor_id, dependent: :destroy
  has_many :incidents, foreign_key: :monitor_id, dependent: :destroy

  enum :http_method, { get: 0, post: 1, put: 2, patch: 3, delete: 4 }, prefix: true
  enum :status, { pending: 0, up: 1, down: 2, paused: 3 }

  validates :name, presence: true, length: { maximum: 100 }
  validates :url, presence: true, format: { with: URI::DEFAULT_PARSER.make_regexp(%w[http https]) }
  validates :interval_seconds, inclusion: { in: [60, 300, 600, 900, 1800, 3600] }
  validate :url_must_be_public_http_endpoint

  after_create_commit :enqueue_first_check

  private

  def enqueue_first_check
    MonitorCheckJob.perform_async(id)
  end

  def url_must_be_public_http_endpoint
    return if url.blank?
    result = SafeTarget.validate(url)
    errors.add(:url, result) unless result == true
  end
end
