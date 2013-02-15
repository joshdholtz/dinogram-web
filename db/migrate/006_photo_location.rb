Sequel.migration do
    up do
        alter_table :photos do
            add_column :lat, Float
            add_column :lng, Float
        end
    end

    down do
        alter_table :photos do
            drop_column :lat
            drop_column :lng
        end
    end
end