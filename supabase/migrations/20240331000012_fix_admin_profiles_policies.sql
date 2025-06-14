-- Drop all existing policies
DROP POLICY IF EXISTS "view_own_profile" ON admin_profiles;
DROP POLICY IF EXISTS "view_all_profiles" ON admin_profiles;
DROP POLICY IF EXISTS "insert_own_profile" ON admin_profiles;
DROP POLICY IF EXISTS "update_profile" ON admin_profiles;
DROP POLICY IF EXISTS "delete_profile" ON admin_profiles;

-- Create a function to check if user is an approved admin
CREATE OR REPLACE FUNCTION is_approved_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM admin_profiles ap
        WHERE ap.id = auth.uid()
        AND ap.status = 'approved'
        AND ap.role_id IN (
            SELECT id FROM roles WHERE name IN ('super_admin', 'admin')
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user is a super admin
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

-- Basic policies for admin_profiles
-- Everyone can view their own profile
CREATE POLICY "view_own_profile" ON admin_profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Approved admins can view all profiles
CREATE POLICY "view_all_profiles" ON admin_profiles
    FOR SELECT
    USING (is_approved_admin());

-- Users can only insert their own profile
CREATE POLICY "insert_own_profile" ON admin_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Update policy
CREATE POLICY "update_profile" ON admin_profiles
    FOR UPDATE
    USING (
        -- Can always update own profile
        auth.uid() = id
        OR
        -- Super admin can update any profile
        is_super_admin()
    );

-- Delete policy
CREATE POLICY "delete_profile" ON admin_profiles
    FOR DELETE
    USING (is_super_admin());

-- Update has_permission function to use the new helper functions
CREATE OR REPLACE FUNCTION has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Super admin has all permissions
    IF is_super_admin() THEN
        RETURN true;
    END IF;

    -- Check specific permission
    RETURN EXISTS (
        SELECT 1
        FROM admin_profiles ap
        JOIN role_permissions rp ON ap.role_id = rp.role_id
        JOIN permissions p ON p.id = rp.permission_id
        WHERE ap.id = auth.uid()
        AND ap.status = 'approved'
        AND p.name = permission_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 