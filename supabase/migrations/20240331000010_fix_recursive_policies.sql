-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "view_own_profile" ON admin_profiles;
DROP POLICY IF EXISTS "view_all_profiles" ON admin_profiles;
DROP POLICY IF EXISTS "insert_own_profile" ON admin_profiles;
DROP POLICY IF EXISTS "update_profile" ON admin_profiles;
DROP POLICY IF EXISTS "delete_profile" ON admin_profiles;

-- Create new non-recursive policies
-- View own profile
CREATE POLICY "view_own_profile" ON admin_profiles
    FOR SELECT
    USING (auth.uid() = id);

-- View all profiles (for approved admins and super_admins)
CREATE POLICY "view_all_profiles" ON admin_profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND ap.role_id IN (
                SELECT id FROM roles WHERE name IN ('super_admin', 'admin')
            )
        )
    );

-- Insert own profile
CREATE POLICY "insert_own_profile" ON admin_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Update profiles
CREATE POLICY "update_profile" ON admin_profiles
    FOR UPDATE
    USING (
        -- Can always update own profile
        auth.uid() = id
        OR
        -- Super admin can update any profile
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND ap.role_id IN (
                SELECT id FROM roles WHERE name = 'super_admin'
            )
        )
    );

-- Delete profiles
CREATE POLICY "delete_profile" ON admin_profiles
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND ap.role_id IN (
                SELECT id FROM roles WHERE name = 'super_admin'
            )
        )
    );

-- Update the has_permission function to avoid recursion
CREATE OR REPLACE FUNCTION has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_role_name TEXT;
    is_approved BOOLEAN;
BEGIN
    -- Get user's role and approval status directly
    SELECT 
        r.name,
        ap.status = 'approved'
    INTO 
        user_role_name,
        is_approved
    FROM admin_profiles ap
    JOIN roles r ON r.id = ap.role_id
    WHERE ap.id = auth.uid();

    -- If no role found or not approved, return false
    IF user_role_name IS NULL OR NOT is_approved THEN
        RETURN false;
    END IF;

    -- Super admin has all permissions
    IF user_role_name = 'super_admin' THEN
        RETURN true;
    END IF;

    -- Admin has special handling for user management
    IF user_role_name = 'admin' 
       AND permission_name IN ('view_users', 'manage_users') THEN
        -- Admin can view users but only super_admin can manage them
        RETURN permission_name = 'view_users';
    END IF;

    -- Check specific permission
    RETURN EXISTS (
        SELECT 1
        FROM admin_profiles ap
        JOIN roles r ON r.id = ap.role_id
        JOIN role_permissions rp ON rp.role_id = r.id
        JOIN permissions p ON p.id = rp.permission_id
        WHERE ap.id = auth.uid()
        AND ap.status = 'approved'
        AND p.name = permission_name
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER; 