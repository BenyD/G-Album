-- Add dashboard and analytics permissions for all roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    r.id as role_id,
    p.id as permission_id
FROM roles r
CROSS JOIN permissions p
WHERE r.name IN ('super_admin', 'admin', 'editor', 'viewer')
AND p.name IN ('view_dashboard', 'view_analytics')
ON CONFLICT (role_id, permission_id) DO NOTHING; 