require 'shield'
# :id
# :url
# :caption
# :share_facebook_url
# :share_twitter_url
# :updated_on
# :created_on

class Photo < Sequel::Model(:photos)
    # one_to_many :relations, :class=>:Relation, :key=>:user_id
    # one_to_many :event_instructor, :class=>:Event, :key=>:instructor_id

    plugin :validation_helpers
    def validate 
        super
    end

    def primitive
        {
            :id=> self.id,
            :url => self.url,
            :caption => self.caption,
            :created_on => self.created_on,
            :updated_on => self.updated_on
        }
    end

    def json
        ret = {
        }
        ret.merge(primitive())
    end
end
