-- Create enum for user status
CREATE TYPE user_status AS ENUM ('pending', 'approved', 'suspended');

-- Create enum for role types
CREATE TYPE role_type AS ENUM ('super_admin', 'admin', 'editor', 'viewer');

-- Create roles table
CREATE TABLE roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name role_type NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create permissions table
CREATE TABLE permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create role_permissions junction table
CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

-- Create admin_profiles table that extends Supabase auth.users
CREATE TABLE admin_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id),
    status user_status DEFAULT 'pending',
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Policies for admin_profiles
CREATE POLICY "Admin profiles are viewable by approved admins"
    ON admin_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
        )
    );

CREATE POLICY "Super admins can update admin profiles"
    ON admin_profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            INNER JOIN roles r ON ap.role_id = r.id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND r.name = 'super_admin'
        )
    );

-- Policies for roles
CREATE POLICY "Roles are viewable by approved admins"
    ON roles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
        )
    );

CREATE POLICY "Super admins can manage roles"
    ON roles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            INNER JOIN roles r ON ap.role_id = r.id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND r.name = 'super_admin'
        )
    );

-- Insert default roles
INSERT INTO roles (name, description) VALUES
    ('super_admin', 'Full system access with user management capabilities'),
    ('admin', 'Full system access without user management'),
    ('editor', 'Can manage content and basic operations'),
    ('viewer', 'Read-only access to the system');

-- Insert default permissions
INSERT INTO permissions (name, description) VALUES
    ('manage_users', 'Can manage user accounts and roles'),
    ('view_analytics', 'Can view analytics and reports'),
    ('manage_albums', 'Can create and manage albums'),
    ('manage_gallery', 'Can manage gallery images'),
    ('manage_orders', 'Can manage customer orders'),
    ('manage_newsletter', 'Can manage newsletter subscribers'),
    ('manage_submissions', 'Can manage form submissions'),
    ('view_dashboard', 'Can view dashboard statistics');

-- Assign permissions to roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'super_admin';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
AND p.name != 'manage_users';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'editor'
AND p.name IN ('manage_albums', 'manage_gallery', 'manage_newsletter', 'view_dashboard');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'viewer'
AND p.name IN ('view_dashboard');

-- Create function to check if a user has a specific permission
CREATE OR REPLACE FUNCTION has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM admin_profiles ap
        INNER JOIN roles r ON ap.role_id = r.id
        INNER JOIN role_permissions rp ON r.id = rp.role_id
        INNER JOIN permissions p ON rp.permission_id = p.id
        WHERE ap.id = auth.uid()
        AND ap.status = 'approved'
        AND p.name = permission_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 