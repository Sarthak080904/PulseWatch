class User < ApplicationRecord
  devise :database_authenticatable, :registerable, :recoverable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  include Devise::JWT::RevocationStrategies::JTIMatcher

  has_many :monitors, class_name: "MonitoredEndpoint", dependent: :destroy
end
