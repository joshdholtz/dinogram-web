Dinogram.controllers :gram do

	get ":id" do
		@photo = Photo[params[:id]]

		unless @photo
			redirect '/'
		end

		render 'gram/gram'
	end

	post "/" do
		logger.debug "Params - " + params.to_s

		photo = nil

		params.each_value do |file|

			unless file && (tmpfile = file[:tempfile]) && (name = file[:filename])
				logger.debug "Cannot upload"
			else

				logger.debug "Can upload"

				s3_file_name = SecureRandom.urlsafe_base64.to_s

				while blk = tmpfile.read(65536)
					AWS::S3::Base.establish_connection!(
					:access_key_id     => ENV['S3_KEY'],
					:secret_access_key => ENV['S3_SECRET'])
					AWS::S3::S3Object.store(s3_file_name, open(tmpfile),ENV['S3_BUCKET'],:access => :public_read,:content_type => 'image/png')     
				end

				photo = Photo.create(:url => "https://s3.amazonaws.com/#{ENV['S3_BUCKET']}/#{s3_file_name}", :caption => "", :created_on => Time.now, :updated_on => Time.now)

			end

		end

		if photo
			return 200, {}, photo.json.to_json
		else
			return 400, {}, {}
		end

	end

end