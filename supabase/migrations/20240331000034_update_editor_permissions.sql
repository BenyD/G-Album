-- Grant business category permissions to editor role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'editor'
AND p.name IN (
    'view_customers',
    'manage_customers',
    'view_orders',
    'manage_orders',
    'view_profile'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Update RLS policies for customers and orders tables to include editor role
DROP POLICY IF EXISTS "Customers are viewable by admins and super_admins" ON customers;
DROP POLICY IF EXISTS "Customers are manageable by admins and super_admins" ON customers;
DROP POLICY IF EXISTS "Orders are viewable by admins and super_admins" ON orders;
DROP POLICY IF EXISTS "Orders are manageable by admins and super_admins" ON orders;

-- Create new policies that include editor role
CREATE POLICY "Customers are viewable by editors and above"
    ON customers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            INNER JOIN roles r ON ap.role_id = r.id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND r.name IN ('super_admin', 'admin', 'editor')
        )
    );

CREATE POLICY "Customers are manageable by editors and above"
    ON customers FOR INSERT UPDATE DELETE
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            INNER JOIN roles r ON ap.role_id = r.id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND r.name IN ('super_admin', 'admin', 'editor')
        )
    );

CREATE POLICY "Orders are viewable by editors and above"
    ON orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            INNER JOIN roles r ON ap.role_id = r.id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND r.name IN ('super_admin', 'admin', 'editor')
        )
    );

CREATE POLICY "Orders are manageable by editors and above"
    ON orders FOR INSERT UPDATE DELETE
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            INNER JOIN roles r ON ap.role_id = r.id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND r.name IN ('super_admin', 'admin', 'editor')
        )
    );

-- Add RLS policy for admin_profiles to allow editors to view and update their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON admin_profiles;
CREATE POLICY "Users can view their own profile"
    ON admin_profiles FOR SELECT
    USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own profile" ON admin_profiles;
CREATE POLICY "Users can update their own profile"
    ON admin_profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid()); 