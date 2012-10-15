Dinogram.controllers :session do

	post "/" do

		email = params[:email]
		password = params[:password]

		logger.debug "Login with #{email} #{password}"

		login(User, email, password)

		redirect "/"

	end

	get "/signout" do
		logout User
		redirect "/"
	end

end