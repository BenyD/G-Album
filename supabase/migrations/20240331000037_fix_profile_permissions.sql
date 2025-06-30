-- Ensure view_profile permission exists
INSERT INTO permissions (name, description)
VALUES ('view_profile', 'Can view own profile')
ON CONFLICT (name) DO NOTHING;

-- Get the permission ID
DO $$
DECLARE
    v_permission_id uuid;
BEGIN
    -- Get the view_profile permission ID
    SELECT id INTO v_permission_id FROM permissions WHERE name = 'view_profile';

    -- Grant view_profile permission to all roles except super_admin (they already have all permissions)
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, v_permission_id
    FROM roles r
    WHERE r.name IN ('admin', 'editor', 'visitor')
    ON CONFLICT (role_id, permission_id) DO NOTHING;
END $$;

-- Update RLS policies for admin_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON admin_profiles;
CREATE POLICY "Users can view their own profile"
    ON admin_profiles FOR SELECT
    USING (
        -- Allow users to view their own profile
        id = auth.uid()
        OR
        -- Allow admins and super_admins to view all profiles
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            INNER JOIN roles r ON ap.role_id = r.id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND r.name IN ('super_admin', 'admin')
        )
    );

DROP POLICY IF EXISTS "Users can update their own profile" ON admin_profiles;
CREATE POLICY "Users can update their own profile"
    ON admin_profiles FOR UPDATE
    USING (
        -- Allow users to update their own profile
        id = auth.uid()
        OR
        -- Allow admins and super_admins to update all profiles
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            INNER JOIN roles r ON ap.role_id = r.id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND r.name IN ('super_admin', 'admin')
        )
    )
    WITH CHECK (
        -- Same conditions for the CHECK policy
        id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            INNER JOIN roles r ON ap.role_id = r.id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND r.name IN ('super_admin', 'admin')
        )
    ); 