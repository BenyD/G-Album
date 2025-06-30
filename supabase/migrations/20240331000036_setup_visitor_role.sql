-- Create the visitor role if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'visitor') THEN
        INSERT INTO roles (name, description)
        VALUES ('visitor', 'Limited access to view dashboard and analytics');
    END IF;
END $$;

-- Create necessary permissions if they don't exist
DO $$ 
BEGIN 
    -- view_dashboard
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'view_dashboard') THEN
        INSERT INTO permissions (name, description)
        VALUES ('view_dashboard', 'Can view the dashboard');
    END IF;

    -- view_analytics
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'view_analytics') THEN
        INSERT INTO permissions (name, description)
        VALUES ('view_analytics', 'Can view analytics');
    END IF;

    -- view_profile
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'view_profile') THEN
        INSERT INTO permissions (name, description)
        VALUES ('view_profile', 'Can view own profile');
    END IF;
END $$;

-- Grant specific permissions to visitor role
DO $$ 
DECLARE 
    v_role_id uuid;
    v_perm_id uuid;
BEGIN
    -- Get the visitor role ID
    SELECT id INTO v_role_id FROM roles WHERE name = 'visitor';

    -- For each permission, check and insert if not exists
    FOR v_perm_id IN 
        SELECT id FROM permissions 
        WHERE name IN ('view_dashboard', 'view_analytics', 'view_profile')
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM role_permissions 
            WHERE role_id = v_role_id AND permission_id = v_perm_id
        ) THEN
            INSERT INTO role_permissions (role_id, permission_id)
            VALUES (v_role_id, v_perm_id);
        END IF;
    END LOOP;
END $$;

-- Update RLS policies for the underlying tables that power the analytics views
-- Orders table (needed for order analytics)
DROP POLICY IF EXISTS "Orders are viewable by authenticated users with permissions" ON orders;
CREATE POLICY "Orders are viewable by authenticated users with permissions"
    ON orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            INNER JOIN roles r ON ap.role_id = r.id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND r.name IN ('super_admin', 'admin', 'editor', 'visitor')
        )
    );

-- Customers table (needed for customer analytics)
DROP POLICY IF EXISTS "Customers are viewable by authenticated users with permissions" ON customers;
CREATE POLICY "Customers are viewable by authenticated users with permissions"
    ON customers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            INNER JOIN roles r ON ap.role_id = r.id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND r.name IN ('super_admin', 'admin', 'editor', 'visitor')
        )
    );

-- Grant access to the analytics views
DO $$
BEGIN
    -- Grant usage on the schema
    EXECUTE 'GRANT USAGE ON SCHEMA public TO authenticated';
    
    -- Grant SELECT on all analytics views
    EXECUTE 'GRANT SELECT ON monthly_analytics TO authenticated';
    EXECUTE 'GRANT SELECT ON order_status_analytics TO authenticated';
    EXECUTE 'GRANT SELECT ON customer_analytics TO authenticated';
    
    -- Grant SELECT on materialized views
    EXECUTE 'GRANT SELECT ON monthly_analytics_mv TO authenticated';
    EXECUTE 'GRANT SELECT ON order_status_analytics_mv TO authenticated';
    EXECUTE 'GRANT SELECT ON customer_analytics_mv TO authenticated';
END $$; 