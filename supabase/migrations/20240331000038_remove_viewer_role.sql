-- Update any existing viewer roles to visitor
UPDATE admin_profiles
SET role_id = (SELECT id FROM roles WHERE name = 'visitor')
WHERE role_id IN (SELECT id FROM roles WHERE name = 'viewer');

-- Delete viewer role permissions
DELETE FROM role_permissions
WHERE role_id IN (SELECT id FROM roles WHERE name = 'viewer');

-- Delete viewer role
DELETE FROM roles
WHERE name = 'viewer';

-- Update role_type enum safely
DO $$
BEGIN
    -- Create a new enum type without the 'viewer' value
    CREATE TYPE role_type_new AS ENUM ('super_admin', 'admin', 'editor', 'visitor');
    
    -- Update the column to use the new enum type
    ALTER TABLE roles 
        ALTER COLUMN name TYPE role_type_new 
        USING name::text::role_type_new;
    
    -- Drop the old enum type
    DROP TYPE role_type;
    
    -- Rename the new enum type to the original name
    ALTER TYPE role_type_new RENAME TO role_type;
EXCEPTION
    WHEN others THEN
        -- If anything fails, it likely means the value is already removed
        NULL;
END $$;

-- Update RLS policies to remove viewer references
DROP POLICY IF EXISTS "Orders are viewable by authenticated users with permissions" ON orders;
CREATE POLICY "Orders are viewable by authenticated users with permissions"
    ON orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            INNER JOIN roles r ON ap.role_id = r.id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND r.name IN ('super_admin', 'admin', 'editor', 'visitor')
        )
    );

DROP POLICY IF EXISTS "Customers are viewable by authenticated users with permissions" ON customers;
CREATE POLICY "Customers are viewable by authenticated users with permissions"
    ON customers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            INNER JOIN roles r ON ap.role_id = r.id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND r.name IN ('super_admin', 'admin', 'editor', 'visitor')
        )
    );

-- Update role assignment policies
DROP POLICY IF EXISTS "Admin can assign roles" ON admin_profiles;
CREATE POLICY "Admin can assign roles"
    ON admin_profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            INNER JOIN roles r ON ap.role_id = r.id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND r.name = 'admin'
            AND EXISTS (
                SELECT 1 FROM roles target_role
                WHERE target_role.id = admin_profiles.role_id
                AND target_role.name IN ('editor', 'visitor')
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            INNER JOIN roles r ON ap.role_id = r.id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND r.name = 'admin'
            AND EXISTS (
                SELECT 1 FROM roles target_role
                WHERE target_role.id = admin_profiles.role_id
                AND target_role.name IN ('editor', 'visitor')
            )
        )
    ); 