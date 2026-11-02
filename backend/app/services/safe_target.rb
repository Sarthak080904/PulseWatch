require "ipaddr"
require "resolv"

class SafeTarget
  BLOCKED_RANGES = %w[
    0.0.0.0/8 10.0.0.0/8 100.64.0.0/10 127.0.0.0/8
    169.254.0.0/16 172.16.0.0/12 192.0.0.0/24 192.168.0.0/16
    224.0.0.0/4 240.0.0.0/4 ::/128 ::1/128 fc00::/7 fe80::/10
  ].map { |range| IPAddr.new(range) }.freeze

  def self.validate(value)
    uri = URI.parse(value)
    return "must use HTTP or HTTPS" unless %w[http https].include?(uri.scheme)
    return "must include a hostname" if uri.host.blank?
    return "embedded credentials are not allowed" if uri.userinfo
    return "local hostnames are not allowed" if uri.host == "localhost" || uri.host.end_with?(".local")

    addresses = Resolv.getaddresses(uri.host)
    return "hostname could not be resolved" if addresses.empty?

    blocked = addresses.any? do |address|
      ip = IPAddr.new(address)
      BLOCKED_RANGES.any? { |range| range.include?(ip) rescue false }
    end
    blocked ? "private, loopback, link-local, or reserved IP destinations are not allowed" : true
  rescue URI::InvalidURIError, Resolv::ResolvError, IPAddr::InvalidAddressError
    "is not a valid, publicly resolvable URL"
  end
end
