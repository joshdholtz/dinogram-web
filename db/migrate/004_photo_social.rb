Sequel.migration do
    up do
        alter_table :photos do
            add_column :facebook_id, String
            add_column :handle_id, String
        end
    end

    down do
        alter_table :photos do
            drop_column :facebook_id
            drop_column :handle_id
        end
    end
end