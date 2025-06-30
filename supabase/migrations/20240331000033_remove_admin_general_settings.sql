-- Remove general settings permission from admin role
DELETE FROM role_permissions
WHERE role_id IN (SELECT id FROM roles WHERE name = 'admin')
AND permission_id IN (SELECT id FROM permissions WHERE name = 'manage_general_settings');

-- Update RLS policies for general settings
DROP POLICY IF EXISTS "General settings are manageable by admins and super_admins" ON general_settings;
CREATE POLICY "General settings are manageable by super_admins only"
    ON general_settings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            INNER JOIN roles r ON ap.role_id = r.id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND r.name = 'super_admin'
        )
    ); 