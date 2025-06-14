-- Add view_activity_logs permission
INSERT INTO permissions (name, description)
VALUES ('view_activity_logs', 'Can view activity logs in the settings page')
ON CONFLICT (name) DO NOTHING;

-- Grant view_activity_logs permission to super_admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'super_admin'
AND p.name = 'view_activity_logs'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Update activity logs policies
DROP POLICY IF EXISTS "Users can view their own activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Super admins can view all activity logs" ON activity_logs;

-- Create new policies
CREATE POLICY "Users can view their own activity logs"
ON activity_logs FOR SELECT
USING (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM admin_profiles ap
        JOIN roles r ON r.id = ap.role_id
        WHERE ap.id = auth.uid()
        AND ap.status = 'approved'
        AND r.name = 'super_admin'
    )
);

CREATE POLICY "Super admins can view all activity logs"
ON activity_logs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM admin_profiles ap
        JOIN roles r ON r.id = ap.role_id
        WHERE ap.id = auth.uid()
        AND ap.status = 'approved'
        AND r.name = 'super_admin'
    )
); 