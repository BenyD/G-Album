-- Add customer permissions for editors
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'editor'),
    id
FROM permissions 
WHERE name IN ('view_customers', 'manage_customers')
ON CONFLICT (role_id, permission_id) DO NOTHING; 