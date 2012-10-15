Dinogram.controllers :gram do

	get ":id" do
		@photo = Photo[params[:id]]

		unless @photo
			redirect '/'
		end

		render 'gram/gram'
	end

end