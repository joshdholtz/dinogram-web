Sequel.migration do
    up do
        alter_table :photos do
            add_column :featured, TrueClass
        end
    end

    down do
        alter_table :photos do
            drop_column :featured
        end
    end
end