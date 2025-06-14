-- Add new view_users permission
INSERT INTO permissions (name, description)
VALUES ('view_users', 'Can view user management page and user details');

-- Grant view_users permission to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
AND p.name = 'view_users';

-- Update the has_permission function to handle the new hierarchy
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

    -- Special handling for user management permissions
    IF user_role.role_name = 'admin' 
       AND user_role.is_approved 
       AND permission_name IN ('view_users', 'manage_users') THEN
        -- Admin can view users but only super_admin can manage them
        RETURN permission_name = 'view_users';
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