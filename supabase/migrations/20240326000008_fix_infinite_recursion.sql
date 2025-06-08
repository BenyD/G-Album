-- Drop all existing policies
DROP POLICY IF EXISTS "view_own_profile" ON admin_profiles;
DROP POLICY IF EXISTS "admins_view_all_profiles" ON admin_profiles;
DROP POLICY IF EXISTS "insert_own_profile" ON admin_profiles;
DROP POLICY IF EXISTS "update_profiles" ON admin_profiles;
DROP POLICY IF EXISTS "delete_profiles" ON admin_profiles;
DROP POLICY IF EXISTS "roles_select" ON roles;
DROP POLICY IF EXISTS "roles_all_super_admin" ON roles;
DROP POLICY IF EXISTS "permissions_select" ON permissions;
DROP POLICY IF EXISTS "permissions_all_super_admin" ON permissions;
DROP POLICY IF EXISTS "role_permissions_select" ON role_permissions;
DROP POLICY IF EXISTS "role_permissions_all_super_admin" ON role_permissions;

-- Drop existing functions
DROP FUNCTION IF EXISTS is_super_admin() CASCADE;
DROP FUNCTION IF EXISTS is_approved_user() CASCADE;
DROP FUNCTION IF EXISTS has_permission(TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_user_role_name() CASCADE;

-- Create a function to safely get role name
CREATE OR REPLACE FUNCTION get_role_name(user_id UUID)
RETURNS TEXT AS $$
  SELECT r.name
  FROM roles r, admin_profiles ap
  WHERE ap.id = user_id
  AND ap.role_id = r.id
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Create a function to check if user is approved
CREATE OR REPLACE FUNCTION is_user_approved(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM admin_profiles
    WHERE id = user_id
    AND status = 'approved'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Basic policies for admin_profiles
ALTER TABLE admin_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can view their own profile
CREATE POLICY "view_own_profile" ON admin_profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Approved admins can view all profiles
CREATE POLICY "view_all_profiles" ON admin_profiles
    FOR SELECT
    USING (
        CASE 
            -- If accessing own profile, allow
            WHEN auth.uid() = id THEN true
            -- If user is approved and has admin role, allow
            WHEN is_user_approved(auth.uid()) AND get_role_name(auth.uid()) IN ('super_admin', 'admin') THEN true
            ELSE false
        END
    );

-- Users can only insert their own profile
CREATE POLICY "insert_own_profile" ON admin_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Update policy
CREATE POLICY "update_profile" ON admin_profiles
    FOR UPDATE
    USING (
        CASE
            -- Can always update own profile
            WHEN auth.uid() = id THEN true
            -- Approved super_admin can update any profile
            WHEN is_user_approved(auth.uid()) AND get_role_name(auth.uid()) = 'super_admin' THEN true
            ELSE false
        END
    );

-- Delete policy
CREATE POLICY "delete_profile" ON admin_profiles
    FOR DELETE
    USING (
        is_user_approved(auth.uid()) AND get_role_name(auth.uid()) = 'super_admin'
    );

-- Basic policies for other tables
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Anyone can view roles
CREATE POLICY "view_roles" ON roles
    FOR SELECT
    USING (true);

-- Only super_admin can modify roles
CREATE POLICY "modify_roles" ON roles
    FOR ALL
    USING (
        is_user_approved(auth.uid()) AND get_role_name(auth.uid()) = 'super_admin'
    );

-- Permissions table policies
ALTER TABLE permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view_permissions" ON permissions
    FOR SELECT
    USING (true);

CREATE POLICY "modify_permissions" ON permissions
    FOR ALL
    USING (
        is_user_approved(auth.uid()) AND get_role_name(auth.uid()) = 'super_admin'
    );

-- Role permissions table policies
ALTER TABLE role_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view_role_permissions" ON role_permissions
    FOR SELECT
    USING (true);

CREATE POLICY "modify_role_permissions" ON role_permissions
    FOR ALL
    USING (
        is_user_approved(auth.uid()) AND get_role_name(auth.uid()) = 'super_admin'
    );

-- Permission check function
CREATE OR REPLACE FUNCTION has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Super admin has all permissions
    IF get_role_name(auth.uid()) = 'super_admin' AND is_user_approved(auth.uid()) THEN
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