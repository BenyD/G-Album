-- Drop existing policies and functions
DROP POLICY IF EXISTS "Admin profiles are viewable by approved admins" ON admin_profiles;
DROP POLICY IF EXISTS "Super admins can update admin profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Roles are viewable by approved admins" ON roles;
DROP POLICY IF EXISTS "Super admins can manage roles" ON roles;
DROP POLICY IF EXISTS "Admin profiles are viewable by authenticated users" ON admin_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON admin_profiles;
DROP POLICY IF EXISTS "Super admins can update any profile, users can update their own" ON admin_profiles;
DROP POLICY IF EXISTS "Only super admins can delete profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Roles are viewable by authenticated users" ON roles;
DROP POLICY IF EXISTS "Only super admins can modify roles" ON roles;
DROP FUNCTION IF EXISTS has_permission(TEXT);

-- Create new non-recursive policies
-- Admin Profiles policies
CREATE POLICY "admin_profiles_select" ON admin_profiles
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "admin_profiles_insert" ON admin_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "admin_profiles_update" ON admin_profiles
    FOR UPDATE USING (
        (
            EXISTS (
                SELECT 1 FROM admin_profiles ap
                WHERE ap.id = auth.uid()
                AND ap.status = 'approved'
                AND ap.role_id IN (
                    SELECT id FROM roles WHERE name = 'super_admin'
                )
            )
        ) OR id = auth.uid()
    );

CREATE POLICY "admin_profiles_delete" ON admin_profiles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND ap.role_id IN (
                SELECT id FROM roles WHERE name = 'super_admin'
            )
        )
    );

-- Roles policies
CREATE POLICY "roles_select" ON roles
    FOR SELECT USING (true);

CREATE POLICY "roles_all_super_admin" ON roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND ap.role_id IN (
                SELECT id FROM roles WHERE name = 'super_admin'
            )
        )
    );

-- Create new non-recursive permission check function
CREATE OR REPLACE FUNCTION has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- First check if user is a super_admin (they have all permissions)
    IF EXISTS (
        SELECT 1 FROM admin_profiles ap
        WHERE ap.id = auth.uid()
        AND ap.status = 'approved'
        AND ap.role_id IN (
            SELECT id FROM roles WHERE name = 'super_admin'
        )
    ) THEN
        RETURN true;
    END IF;

    -- Otherwise check specific permission
    RETURN EXISTS (
        WITH user_role AS (
            SELECT role_id 
            FROM admin_profiles 
            WHERE id = auth.uid() 
            AND status = 'approved'
        )
        SELECT 1
        FROM user_role ur
        INNER JOIN role_permissions rp ON rp.role_id = ur.role_id
        INNER JOIN permissions p ON p.id = rp.permission_id
        WHERE p.name = permission_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 