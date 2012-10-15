require 'shield'
# id
# email
# name
# created_on
# update_on

class User < Sequel::Model(:users)
    # one_to_many :registrations, :class=>:Registration, :key=>:user_id
    # one_to_many :relations, :class=>:Relation, :key=>:user_id
    # one_to_many :event_instructor, :class=>:Event, :key=>:instructor_id

    include Shield::Model
    def self.fetch(email)
        first(:email => email)
    end

    plugin :validation_helpers
    def validate 
        super
    end

    def image_url
        "http://avatars.io/auto/#{self.email}"
    end

    def primitive
        {
            :id=> self.id,
            :email => self.name,
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
