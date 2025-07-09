-- Fix admin role permissions to ensure view_dashboard is included
-- This migration ensures the admin role has all necessary permissions

-- First, ensure all required permissions exist
DO $$ 
BEGIN 
    -- view_dashboard
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'view_dashboard') THEN
        INSERT INTO permissions (name, description)
        VALUES ('view_dashboard', 'Can view the dashboard');
    END IF;

    -- view_analytics
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'view_analytics') THEN
        INSERT INTO permissions (name, description)
        VALUES ('view_analytics', 'Can view analytics and reports');
    END IF;

    -- manage_albums
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'manage_albums') THEN
        INSERT INTO permissions (name, description)
        VALUES ('manage_albums', 'Can create and manage albums');
    END IF;

    -- manage_gallery
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'manage_gallery') THEN
        INSERT INTO permissions (name, description)
        VALUES ('manage_gallery', 'Can manage gallery images');
    END IF;

    -- manage_orders
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'manage_orders') THEN
        INSERT INTO permissions (name, description)
        VALUES ('manage_orders', 'Can manage customer orders');
    END IF;

    -- manage_newsletter
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'manage_newsletter') THEN
        INSERT INTO permissions (name, description)
        VALUES ('manage_newsletter', 'Can manage newsletter subscribers');
    END IF;

    -- manage_submissions
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'manage_submissions') THEN
        INSERT INTO permissions (name, description)
        VALUES ('manage_submissions', 'Can manage form submissions');
    END IF;

    -- view_customers
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'view_customers') THEN
        INSERT INTO permissions (name, description)
        VALUES ('view_customers', 'Can view customer information');
    END IF;

    -- view_orders
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'view_orders') THEN
        INSERT INTO permissions (name, description)
        VALUES ('view_orders', 'Can view order information');
    END IF;

    -- view_users
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'view_users') THEN
        INSERT INTO permissions (name, description)
        VALUES ('view_users', 'Can view user management');
    END IF;

    -- view_activity_logs
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'view_activity_logs') THEN
        INSERT INTO permissions (name, description)
        VALUES ('view_activity_logs', 'Can view activity logs');
    END IF;

    -- view_profile
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'view_profile') THEN
        INSERT INTO permissions (name, description)
        VALUES ('view_profile', 'Can view own profile');
    END IF;
END $$;

-- Clear existing admin role permissions to ensure clean setup
DELETE FROM role_permissions 
WHERE role_id IN (SELECT id FROM roles WHERE name = 'admin');

-- Grant all permissions to admin role (except manage_users which is super_admin only)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    r.id as role_id,
    p.id as permission_id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
AND p.name != 'manage_users'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Clear existing editor role permissions to ensure clean setup
DELETE FROM role_permissions 
WHERE role_id IN (SELECT id FROM roles WHERE name = 'editor');

-- Grant appropriate permissions to editor role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    r.id as role_id,
    p.id as permission_id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'editor'
AND p.name IN (
    'view_dashboard',
    'view_analytics', 
    'manage_submissions',
    'view_customers',
    'view_orders',
    'view_profile'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Log the permissions assigned to roles for debugging
DO $$
DECLARE
    admin_role_id uuid;
    editor_role_id uuid;
    admin_perm_count integer;
    editor_perm_count integer;
BEGIN
    SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
    SELECT id INTO editor_role_id FROM roles WHERE name = 'editor';
    SELECT COUNT(*) INTO admin_perm_count FROM role_permissions WHERE role_id = admin_role_id;
    SELECT COUNT(*) INTO editor_perm_count FROM role_permissions WHERE role_id = editor_role_id;
    
    RAISE NOTICE 'Admin role permissions updated. Role ID: %, Total permissions: %', admin_role_id, admin_perm_count;
    RAISE NOTICE 'Editor role permissions updated. Role ID: %, Total permissions: %', editor_role_id, editor_perm_count;
END $$; 