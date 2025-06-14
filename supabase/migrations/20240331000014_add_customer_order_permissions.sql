-- Add customer and order related permissions
INSERT INTO permissions (name, description)
VALUES 
  ('view_customers', 'Can view customers page and customer details'),
  ('manage_customers', 'Can manage customers (create, edit, delete)'),
  ('view_orders', 'Can view orders page and order details'),
  ('manage_orders', 'Can manage orders (create, edit, delete)')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to super_admin role (they already have all permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'super_admin'
AND p.name IN ('view_customers', 'manage_customers', 'view_orders', 'manage_orders')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign permissions to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
AND p.name IN ('view_customers', 'manage_customers', 'view_orders', 'manage_orders')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign permissions to editor role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'editor'
AND p.name IN ('view_customers', 'manage_customers', 'view_orders', 'manage_orders')
ON CONFLICT (role_id, permission_id) DO NOTHING; 