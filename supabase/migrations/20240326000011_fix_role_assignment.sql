-- Drop existing role assignment policies
DROP POLICY IF EXISTS "modify_role_permissions" ON role_permissions;
DROP POLICY IF EXISTS "update_profiles" ON admin_profiles;

-- Create new role assignment policies
CREATE POLICY "modify_role_permissions"
    ON role_permissions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM get_user_role() r
            WHERE r.is_approved AND (
                -- Super admin can modify all roles
                r.role_name = 'super_admin'
                OR
                -- Admin can only assign viewer and editor roles
                (r.role_name = 'admin' AND
                 EXISTS (
                    SELECT 1
                    FROM roles target_role
                    WHERE target_role.id = role_permissions.role_id
                    AND target_role.name IN ('viewer', 'editor')
                 )
                )
            )
        )
    );

-- Update the profile update policy to match
CREATE POLICY "update_profiles"
    ON admin_profiles
    FOR UPDATE
    USING (
        -- Can update own profile
        auth.uid() = id
        OR
        -- Super admin can update any profile
        EXISTS (
            SELECT 1
            FROM get_user_role() r
            WHERE r.is_approved AND (
                -- Super admin can modify all roles
                r.role_name = 'super_admin'
                OR
                -- Admin can only assign viewer and editor roles
                (r.role_name = 'admin' AND
                 EXISTS (
                    SELECT 1
                    FROM roles target_role
                    WHERE target_role.id = admin_profiles.role_id
                    AND target_role.name IN ('viewer', 'editor')
                 )
                )
            )
        )
    );

-- Update the has_permission function to reflect these changes
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

    -- Admin has special handling for user management
    IF user_role.role_name = 'admin' 
       AND user_role.is_approved 
       AND permission_name = 'manage_users' THEN
        -- Admin can manage viewer and editor roles
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