-- Drop all existing policies
DROP POLICY IF EXISTS "admin_profiles_select" ON admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_insert" ON admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_update" ON admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_delete" ON admin_profiles;
DROP POLICY IF EXISTS "roles_select" ON roles;
DROP POLICY IF EXISTS "roles_all_super_admin" ON roles;

-- Create a function to check if a user is a super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM admin_profiles ap
        WHERE ap.id = auth.uid()
        AND ap.status = 'approved'
        AND ap.role_id IN (
            SELECT id FROM roles WHERE name = 'super_admin'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if a user is approved
CREATE OR REPLACE FUNCTION is_approved_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM admin_profiles
        WHERE id = auth.uid()
        AND status = 'approved'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new policies using the helper functions
-- Admin Profiles policies
CREATE POLICY "admin_profiles_select" ON admin_profiles
    FOR SELECT USING (
        is_approved_user() OR auth.uid() = id
    );

CREATE POLICY "admin_profiles_insert" ON admin_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "admin_profiles_update" ON admin_profiles
    FOR UPDATE USING (
        is_super_admin() OR auth.uid() = id
    );

CREATE POLICY "admin_profiles_delete" ON admin_profiles
    FOR DELETE USING (is_super_admin());

-- Roles policies
CREATE POLICY "roles_select" ON roles
    FOR SELECT USING (true);

CREATE POLICY "roles_all_super_admin" ON roles
    FOR ALL USING (is_super_admin());

-- Permissions policies
CREATE POLICY "permissions_select" ON permissions
    FOR SELECT USING (true);

CREATE POLICY "permissions_all_super_admin" ON permissions
    FOR ALL USING (is_super_admin());

-- Role Permissions policies
CREATE POLICY "role_permissions_select" ON role_permissions
    FOR SELECT USING (true);

CREATE POLICY "role_permissions_all_super_admin" ON role_permissions
    FOR ALL USING (is_super_admin());

-- Update has_permission function to use helper functions
CREATE OR REPLACE FUNCTION has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Super admins have all permissions
    IF is_super_admin() THEN
        RETURN true;
    END IF;

    -- Check specific permission for approved users
    RETURN EXISTS (
        SELECT 1
        FROM admin_profiles ap
        INNER JOIN role_permissions rp ON rp.role_id = ap.role_id
        INNER JOIN permissions p ON p.id = rp.permission_id
        WHERE ap.id = auth.uid()
        AND ap.status = 'approved'
        AND p.name = permission_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 