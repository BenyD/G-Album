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