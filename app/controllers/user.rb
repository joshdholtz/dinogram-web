Dinogram.controllers :dinographer do

	get ":id" do
		@user = User[params[:id]]

		unless @user
			redirect '/'
		end

		render 'user/profile'
	end

end