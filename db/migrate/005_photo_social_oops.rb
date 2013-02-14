Sequel.migration do
    up do
        alter_table :photos do
            add_column :twitter_handle, String
            drop_column :handle_id
        end
    end

    down do
        alter_table :photos do
            drop_column :twitter_handle
            add_column :handle_id, String
        end
    end
end