-- Add unique constraints if they don't exist
DO $$ 
BEGIN 
    -- Check if the unique constraint exists on roles.name
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'roles_name_key'
        AND table_name = 'roles'
    ) THEN
        ALTER TABLE roles ADD CONSTRAINT roles_name_key UNIQUE (name);
    END IF;

    -- Check if the unique constraint exists on permissions.name
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'permissions_name_key'
        AND table_name = 'permissions'
    ) THEN
        ALTER TABLE permissions ADD CONSTRAINT permissions_name_key UNIQUE (name);
    END IF;
END $$; 