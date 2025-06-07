-- Drop existing policies
DROP POLICY IF EXISTS "Admin profiles are viewable by authenticated users" ON admin_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON admin_profiles;
DROP POLICY IF EXISTS "Super admins can update any profile, users can update their own" ON admin_profiles;
DROP POLICY IF EXISTS "Only super admins can delete profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Admin profiles are viewable by approved admins" ON admin_profiles;

DROP POLICY IF EXISTS "Roles are viewable by authenticated users" ON roles;
DROP POLICY IF EXISTS "Only super admins can insert roles" ON roles;
DROP POLICY IF EXISTS "Only super admins can update roles" ON roles;
DROP POLICY IF EXISTS "Only super admins can delete roles" ON roles;
DROP POLICY IF EXISTS "Roles are viewable by approved admins" ON roles;

DROP POLICY IF EXISTS "Permissions are viewable by authenticated users" ON permissions;
DROP POLICY IF EXISTS "Only super admins can modify permissions" ON permissions;
DROP POLICY IF EXISTS "Permissions are viewable by approved admins" ON permissions;

DROP POLICY IF EXISTS "Role permissions are viewable by authenticated users" ON role_permissions;
DROP POLICY IF EXISTS "Only super admins can modify role permissions" ON role_permissions;
DROP POLICY IF EXISTS "Role permissions are viewable by approved admins" ON role_permissions;

-- Create new policies that avoid recursion
-- Admin Profiles policies
CREATE POLICY "Admin profiles are viewable by authenticated users"
    ON admin_profiles FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert their own profile"
    ON admin_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Super admins can update any profile, users can update their own"
    ON admin_profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.id = auth.uid() 
            AND ap.role_id IN (SELECT id FROM roles WHERE name = 'super_admin')
        )
        OR id = auth.uid()
    );

CREATE POLICY "Only super admins can delete profiles"
    ON admin_profiles FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.id = auth.uid() 
            AND ap.role_id IN (SELECT id FROM roles WHERE name = 'super_admin')
        )
    );

-- Roles policies - simplified to prevent recursion
CREATE POLICY "Roles are viewable by authenticated users"
    ON roles FOR SELECT
    USING (true);

CREATE POLICY "Only super admins can modify roles"
    ON roles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles
            WHERE id = auth.uid() 
            AND role_id IN (SELECT id FROM roles WHERE name = 'super_admin')
        )
    );

-- Permissions policies
CREATE POLICY "Permissions are viewable by authenticated users"
    ON permissions FOR SELECT
    USING (true);

CREATE POLICY "Only super admins can modify permissions"
    ON permissions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles
            WHERE id = auth.uid() 
            AND role_id IN (SELECT id FROM roles WHERE name = 'super_admin')
        )
    );

-- Role Permissions policies
CREATE POLICY "Role permissions are viewable by authenticated users"
    ON role_permissions FOR SELECT
    USING (true);

CREATE POLICY "Only super admins can modify role permissions"
    ON role_permissions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles
            WHERE id = auth.uid() 
            AND role_id IN (SELECT id FROM roles WHERE name = 'super_admin')
        )
    );

-- Ensure RLS is enabled on all tables
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON admin_profiles TO authenticated;
GRANT SELECT ON roles TO authenticated;
GRANT SELECT ON permissions TO authenticated;
GRANT SELECT ON role_permissions TO authenticated; 