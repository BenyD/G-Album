-- Drop existing policies
DROP POLICY IF EXISTS "Allow admin read order logs" ON public.order_logs;
DROP POLICY IF EXISTS "Allow admin insert order logs" ON public.order_logs;

-- Create new policies that align with order viewing permissions
CREATE POLICY "Allow order logs access"
    ON public.order_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles ap
            JOIN public.roles r ON r.id = ap.role_id
            JOIN public.role_permissions rp ON rp.role_id = r.id
            JOIN public.permissions p ON p.id = rp.permission_id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND (
                p.name = 'view_orders' OR
                p.name = 'manage_orders' OR
                r.name IN ('super_admin', 'admin')
            )
        )
    );

CREATE POLICY "Allow order logs insert"
    ON public.order_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_profiles ap
            JOIN public.roles r ON r.id = ap.role_id
            JOIN public.role_permissions rp ON rp.role_id = r.id
            JOIN public.permissions p ON p.id = rp.permission_id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND (
                p.name = 'manage_orders' OR
                r.name IN ('super_admin', 'admin')
            )
        )
    );

-- Add view_order_logs permission
INSERT INTO permissions (name, description)
VALUES ('view_order_logs', 'Can view order activity logs')
ON CONFLICT (name) DO NOTHING;

-- Grant view_order_logs permission to roles that can view orders
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name IN ('super_admin', 'admin', 'editor')
AND p.name = 'view_order_logs'
ON CONFLICT (role_id, permission_id) DO NOTHING; 