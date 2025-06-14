-- Drop existing policies for admin_profiles
DROP POLICY IF EXISTS "update_profile" ON admin_profiles;
DROP POLICY IF EXISTS "view_own_profile" ON admin_profiles;
DROP POLICY IF EXISTS "view_all_profiles" ON admin_profiles;
DROP POLICY IF EXISTS "insert_own_profile" ON admin_profiles;
DROP POLICY IF EXISTS "delete_profile" ON admin_profiles;

-- Create new policies for admin_profiles
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
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

CREATE POLICY "delete_profile"
    ON admin_profiles
    FOR DELETE
    USING (is_super_admin());

-- Create or replace the is_super_admin function
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_role RECORD;
BEGIN
    SELECT * INTO user_role FROM get_user_role();
    RETURN user_role.is_approved AND user_role.role_name = 'super_admin';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create or replace the is_approved_admin function
CREATE OR REPLACE FUNCTION is_approved_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_role RECORD;
BEGIN
    SELECT * INTO user_role FROM get_user_role();
    RETURN user_role.is_approved AND user_role.role_name IN ('super_admin', 'admin');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create or replace the get_user_role function
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

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_profiles TO authenticated;
GRANT SELECT ON roles TO authenticated;
GRANT SELECT ON permissions TO authenticated;
GRANT SELECT ON role_permissions TO authenticated;

-- Enable RLS
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY; 