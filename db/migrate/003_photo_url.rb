Sequel.migration do
    up do
        alter_table :photos do
            add_column :url_code, String
        end
    end

    down do
        alter_table :photos do
            drop_column :url_code
        end
    end
end