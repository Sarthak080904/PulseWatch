require "rails_helper"

RSpec.describe "Authentication", type: :request do
  let(:user_attributes) do
    {
      email: "pulsewatch-#{SecureRandom.hex(8)}@example.com",
      password: "password123",
      password_confirmation: "password123"
    }
  end

  it "registers without writing a session and returns a JWT" do
    post "/auth/register", params: { user: user_attributes }, as: :json

    expect(response).to have_http_status(:created)
    expect(response.headers["Authorization"]).to start_with("Bearer ")
  end

  it "signs in without writing a session and returns a JWT" do
    user = User.create!(user_attributes)

    post "/auth/login",
      params: { user: { email: user.email, password: user_attributes[:password] } },
      as: :json

    expect(response).to have_http_status(:ok)
    expect(response.headers["Authorization"]).to start_with("Bearer ")

    authorization = response.headers["Authorization"]
    get "/api/v1/monitors", headers: { "Authorization" => authorization }, as: :json
    expect(response).to have_http_status(:ok)

    get "/api/v1/overview", headers: { "Authorization" => authorization }, as: :json
    expect(response).to have_http_status(:ok)
  end
end
