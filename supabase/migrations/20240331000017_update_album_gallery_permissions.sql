-- First, remove album and gallery permissions from all roles
DELETE FROM role_permissions
WHERE permission_id IN (
    SELECT id FROM permissions 
    WHERE name IN (
        'view_albums', 'manage_albums',
        'view_gallery', 'manage_gallery'
    )
);

-- Then, add album and gallery permissions only to super_admin and admin roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    r.id as role_id,
    p.id as permission_id
FROM roles r
CROSS JOIN permissions p
WHERE r.name IN ('super_admin', 'admin')
AND p.name IN (
    'view_albums', 'manage_albums',
    'view_gallery', 'manage_gallery'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Update the has_permission function to ensure super_admin has all permissions
CREATE OR REPLACE FUNCTION has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_role RECORD;
BEGIN
    -- Get user's role info
    SELECT * INTO user_role FROM get_user_role();
    
    -- If no role found, return false
    IF user_role IS NULL THEN
        RETURN false;
    END IF;

    -- Super admin has all permissions
    IF user_role.role_name = 'super_admin' AND user_role.is_approved THEN
        RETURN true;
    END IF;

    -- Check specific permission
    RETURN EXISTS (
        SELECT 1
        FROM role_permissions rp
        JOIN permissions p ON p.id = rp.permission_id
        WHERE rp.role_id = user_role.role_id
        AND user_role.is_approved
        AND p.name = permission_name
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER; 