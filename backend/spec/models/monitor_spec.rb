require "rails_helper"

RSpec.describe MonitoredEndpoint, type: :model do
  it "defines namespaced HTTP method predicates" do
    monitor = described_class.new(http_method: :delete)

    expect(monitor.http_method_delete?).to be(true)
    expect(monitor).not_to be_up
  end

  it "requires a name" do
    monitor = described_class.new(name: nil, url: "https://example.com")
    expect(monitor).not_to be_valid
    expect(monitor.errors[:name]).to be_present
  end
end
