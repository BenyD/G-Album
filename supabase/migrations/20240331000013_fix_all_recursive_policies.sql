-- Drop all existing policies and functions
DO $$
BEGIN
    -- Drop all policies from all tables
    EXECUTE (
        SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON ' || quote_ident(schemaname) || '.' || quote_ident(tablename) || ';', E'\n')
        FROM pg_policies
        WHERE schemaname = 'public'
    );
END;
$$;

-- Drop existing functions
DROP FUNCTION IF EXISTS is_super_admin() CASCADE;
DROP FUNCTION IF EXISTS is_approved_admin() CASCADE;
DROP FUNCTION IF EXISTS has_permission(TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_role_name(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_role() CASCADE;

-- Create base helper functions that don't reference other functions
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TABLE (
    role_id UUID,
    role_name TEXT,
    is_approved BOOLEAN
) AS $$
    SELECT ap.role_id, r.name, ap.status = 'approved'
    FROM admin_profiles ap
    LEFT JOIN roles r ON r.id = ap.role_id
    WHERE ap.id = auth.uid()
    LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Create a function to check if user is an approved admin
CREATE OR REPLACE FUNCTION is_approved_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_role RECORD;
BEGIN
    SELECT * INTO user_role FROM get_user_role();
    RETURN user_role.is_approved AND user_role.role_name IN ('super_admin', 'admin');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create a function to check if user is a super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_role RECORD;
BEGIN
    SELECT * INTO user_role FROM get_user_role();
    RETURN user_role.is_approved AND user_role.role_name = 'super_admin';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Reset RLS on all tables
ALTER TABLE admin_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions DISABLE ROW LEVEL SECURITY;

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Basic admin_profiles policies
CREATE POLICY "view_own_profile"
    ON admin_profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "view_all_profiles"
    ON admin_profiles
    FOR SELECT
    USING (is_approved_admin());

CREATE POLICY "insert_own_profile"
    ON admin_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "update_profile"
    ON admin_profiles
    FOR UPDATE
    USING (
        auth.uid() = id
        OR is_super_admin()
    );

CREATE POLICY "delete_profile"
    ON admin_profiles
    FOR DELETE
    USING (is_super_admin());

-- Basic roles policies
CREATE POLICY "view_roles"
    ON roles
    FOR SELECT
    USING (true);

CREATE POLICY "modify_roles"
    ON roles
    FOR ALL
    USING (is_super_admin());

-- Basic permissions policies
CREATE POLICY "view_permissions"
    ON permissions
    FOR SELECT
    USING (true);

CREATE POLICY "modify_permissions"
    ON permissions
    FOR ALL
    USING (is_super_admin());

-- Basic role_permissions policies
CREATE POLICY "view_role_permissions"
    ON role_permissions
    FOR SELECT
    USING (true);

CREATE POLICY "modify_role_permissions"
    ON role_permissions
    FOR ALL
    USING (is_super_admin());

-- Create permission check function
CREATE OR REPLACE FUNCTION has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_role RECORD;
BEGIN
    -- Get user's role info
    SELECT * INTO user_role FROM get_user_role();
    
    -- If no role found or not approved, return false
    IF user_role IS NULL OR NOT user_role.is_approved THEN
        RETURN false;
    END IF;

    -- Super admin has all permissions
    IF user_role.role_name = 'super_admin' THEN
        RETURN true;
    END IF;

    -- Check specific permission
    RETURN EXISTS (
        SELECT 1
        FROM role_permissions rp
        JOIN permissions p ON p.id = rp.permission_id
        WHERE rp.role_id = user_role.role_id
        AND p.name = permission_name
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON admin_profiles TO authenticated;
GRANT SELECT ON roles TO authenticated;
GRANT SELECT ON permissions TO authenticated;
GRANT SELECT ON role_permissions TO authenticated; 