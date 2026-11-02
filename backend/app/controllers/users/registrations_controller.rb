module Users
  class RegistrationsController < Devise::RegistrationsController
    respond_to :json

    protected

    def sign_up(resource_name, resource)
      sign_in(resource_name, resource, store: false)
    end

    private

    def respond_with(resource, _opts = {})
      if resource.persisted?
        render json: { user: { id: resource.id, email: resource.email } }, status: :created
      else
        render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
      end
    end
  end
end
