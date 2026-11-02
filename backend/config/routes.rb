Rails.application.routes.draw do
  devise_for :users,
    defaults: { format: :json },
    path: "auth",
    path_names: { sign_in: "login", sign_out: "logout", registration: "register" },
    controllers: { sessions: "users/sessions", registrations: "users/registrations" }

  get "/api/v1/me", to: "api/v1/profile#show"
  namespace :api do
    namespace :v1 do
      resources :monitors do
        member do
          post :check_now
          get :checks
        end
      end
      get "overview", to: "overview#show"
    end
  end

  get "/up", to: proc { [200, { "Content-Type" => "application/json" }, ['{"status":"ok"}']] }
end
