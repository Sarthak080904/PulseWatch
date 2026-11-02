module Api
  module V1
    class ProfileController < ApplicationController
      def show
        render json: { user: { id: current_user.id, email: current_user.email } }
      end
    end
  end
end
