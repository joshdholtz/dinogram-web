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

	get "/wowzers" do
		@photos = Photo.filter(:featured => true).order(Sequel.desc(:created_on)).all
		render 'gram/all'
	end

end