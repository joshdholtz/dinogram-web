Sequel.migration do
    up do
        create_table :photos do
            primary_key :id
            String :url
            String :caption
            String :share_facebook_url
            String :share_twitter_url
            DateTime :updated_on
            DateTime :created_on

            foreign_key :user_id, :users
        end
    end

    down do
        drop_table :photos
    end
end