-- Add entity_type and entity_id columns for better categorization
ALTER TABLE activity_logs
ADD COLUMN IF NOT EXISTS entity_type TEXT,
ADD COLUMN IF NOT EXISTS entity_id UUID;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Create a view for better log aggregation
CREATE OR REPLACE VIEW activity_logs_view AS
SELECT 
    al.id,
    al.action,
    al.details,
    al.created_at,
    al.user_id,
    al.admin_profile_id,
    al.entity_type,
    al.entity_id,
    ap.full_name as user_name,
    (SELECT email FROM auth.users WHERE id = ap.id) as user_email,
    CASE 
        WHEN al.entity_type = 'customer' THEN (
            SELECT studio_name FROM customers WHERE id = al.entity_id::uuid
        )
        WHEN al.entity_type = 'order' THEN (
            SELECT order_number FROM orders WHERE id = al.entity_id::uuid
        )
        WHEN al.entity_type = 'album' THEN (
            SELECT title FROM albums WHERE id = al.entity_id::uuid
        )
        ELSE NULL
    END as entity_name
FROM activity_logs al
LEFT JOIN admin_profiles ap ON ap.id = al.admin_profile_id;

-- Update the log_activity function to include entity information
CREATE OR REPLACE FUNCTION log_activity(
    action TEXT,
    details JSONB DEFAULT NULL,
    entity_type TEXT DEFAULT NULL,
    entity_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
    admin_id UUID;
BEGIN
    -- Get the admin profile ID for the current user
    SELECT id INTO admin_id
    FROM admin_profiles
    WHERE id = auth.uid();

    INSERT INTO activity_logs (
        user_id, 
        admin_profile_id, 
        action, 
        details,
        entity_type,
        entity_id
    )
    VALUES (
        auth.uid(), 
        admin_id, 
        action, 
        details,
        entity_type,
        entity_id
    )
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view their own activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Users can insert their own activity logs" ON activity_logs;

-- Create new policies with better access control
CREATE POLICY "Allow admin read activity logs"
    ON activity_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            JOIN roles r ON r.id = ap.role_id
            JOIN role_permissions rp ON rp.role_id = r.id
            JOIN permissions p ON p.id = rp.permission_id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND (
                p.name = 'view_activity_logs' OR
                r.name IN ('super_admin', 'admin')
            )
        )
    );

CREATE POLICY "Allow admin insert activity logs"
    ON activity_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
        )
    );