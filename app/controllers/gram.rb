Dinogram.controllers :gram do

	get ":id" do
		@photo = Photo[params[:id]]

		unless @photo
			redirect '/'
		end

		render 'gram/gram'
	end

	post "/" do
		unless params[:file] && (tmpfile = params[:file][:tempfile]) && (name = params[:file][:filename])
			return haml(:upload)
		end

		while blk = tmpfile.read(65536)
			AWS::S3::Base.establish_connection!(
			:access_key_id     => ENV['S3_KEY'],
			:secret_access_key => ENV['S3_SECRET'])
			AWS::S3::S3Object.store(name,open(tmpfile),ENV['S3_BUCKET'],:access => :public_read)     
		end

		'success'

	end

end