-- Update admin role permissions to include business category access
INSERT INTO permissions (name, description)
VALUES
    ('view_customers', 'Can view customer information'),
    ('manage_customers', 'Can manage customer information'),
    ('view_orders', 'Can view order information'),
    ('manage_orders', 'Can manage order information')
ON CONFLICT (name) DO NOTHING;

-- Grant business category permissions to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
AND p.name IN (
    'view_customers',
    'manage_customers',
    'view_orders',
    'manage_orders'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Update RLS policies for customers and orders tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Customers table policies
CREATE POLICY "Customers are viewable by admins and super_admins"
    ON customers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            INNER JOIN roles r ON ap.role_id = r.id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND r.name IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Customers are manageable by admins and super_admins"
    ON customers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            INNER JOIN roles r ON ap.role_id = r.id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND r.name IN ('admin', 'super_admin')
        )
    );

-- Orders table policies
CREATE POLICY "Orders are viewable by admins and super_admins"
    ON orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            INNER JOIN roles r ON ap.role_id = r.id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND r.name IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Orders are manageable by admins and super_admins"
    ON orders FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            INNER JOIN roles r ON ap.role_id = r.id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND r.name IN ('admin', 'super_admin')
        )
    ); 