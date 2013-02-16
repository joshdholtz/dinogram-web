Dinogram.controllers :gram do

	get "/all.json" do
		JSON.generate( Photo.limit(200).all.map { |p| p.primitive } )
	end

	get "/all" do
		render 'gram/all'
	end

	get %r{/gram/([\d]+)} do |id|
		@photo = Photo[id.to_i]

		unless @photo
			redirect '/'
		end

		render 'gram/gram'
	end

	# get ":id" do
	# 	@photo = Photo[params[:id].to_i]

	# 	unless @photo
	# 		redirect '/'
	# 	end

	# 	render 'gram/gram'
	# end

	get %r{/g/([\w]+)} do |url_code|
		@photo = Photo.filter(:url_code => url_code).first

		unless @photo
			redirect '/'
		end

		render 'gram/gram'
	end

	post "/" do
		logger.debug "Params - " + params.to_s

		photo = nil

		caption = params[:caption]

		image_url = params[:image_url]

		facebook_id = params[:facebook_id]
		twitter_handle = params[:twitter_handle]

		lat = params[:lat]
		lng = params[:lng]

		if image_url

			o =  [('a'..'z'),('A'..'Z')].map{|i| i.to_a}.flatten
			url_code  =  (0...12).map{ o[rand(o.length)] }.join

			photo = Photo.create(:url => image_url, :caption => caption, :url_code => url_code, :created_on => Time.now, :updated_on => Time.now, :facebook_id => facebook_id, :twitter_handle => twitter_handle, :lat => lat, :lng => lng)

		else
			params.each_value do |file|

				unless file && file.is_a?(Hash) && (tmpfile = file[:tempfile]) && (name = file[:filename])
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

					o =  [('a'..'z'),('A'..'Z')].map{|i| i.to_a}.flatten
					url_code  =  (0...12).map{ o[rand(o.length)] }.join

					photo = Photo.create(:url => "https://s3.amazonaws.com/#{ENV['S3_BUCKET']}/#{s3_file_name}", :caption => caption, :url_code => url_code, :created_on => Time.now, :updated_on => Time.now)

				end

			end
		end

		if photo
			return 200, {}, photo.json.to_json
		else
			return 400, {}, {}
		end

	end

end