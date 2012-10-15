Dinogram.controllers do

	get "/" do
		render :main
	end

	get "/what" do
		render :what
	end

	get "/why" do
		render :why
	end

	get "/how" do
		render :how
	end

end