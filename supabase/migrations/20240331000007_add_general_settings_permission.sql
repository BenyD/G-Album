-- Add general settings permission
INSERT INTO permissions (name, description)
VALUES 
  ('manage_general_settings', 'Can manage general system settings')
ON CONFLICT (name) DO NOTHING;

-- Assign permission to super_admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  r.id as role_id,
  p.id as permission_id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'super_admin'
  AND p.name = 'manage_general_settings'
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