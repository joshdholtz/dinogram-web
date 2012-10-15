Dinogram.helpers do
	helpers Shield::Helpers
	
	#Returns the current user if authenicated
	def current_user
		authenticated(User)
	end
	
	#Checks to see if the current user is logged in.
	def is_logged_in?
		!! current_user
	end

    def is_admin?
        current_user.permissions.include?("admin")
    end

    def protected!
        unless authorized?
            response['WWW-Authenticate'] = %(Basic realm="Restricted Area")
            throw(:halt, [401, "Not authorized\n"])
        end
    end

    def authorized?
        @auth ||=  Rack::Auth::Basic::Request.new(request.env)
        @auth.provided? && @auth.basic? && @auth.credentials && @auth.credentials == ['strive', '33GoStrive*']
    end
end