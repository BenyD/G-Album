-- Add admin_profile_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'activity_logs' 
        AND column_name = 'admin_profile_id'
    ) THEN
        ALTER TABLE activity_logs 
        ADD COLUMN admin_profile_id UUID REFERENCES admin_profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create index if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'activity_logs' 
        AND indexname = 'activity_logs_admin_profile_id_idx'
    ) THEN
        CREATE INDEX activity_logs_admin_profile_id_idx ON activity_logs(admin_profile_id);
    END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Users can insert their own activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Super admins can view all activity logs" ON activity_logs;

-- Create policies
CREATE POLICY "Users can view their own activity logs"
ON activity_logs FOR SELECT
USING (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM admin_profiles ap
        JOIN roles r ON r.id = ap.role_id
        WHERE ap.id = auth.uid()
        AND r.name = 'super_admin'
    )
);

CREATE POLICY "Users can insert their own activity logs"
ON activity_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create or replace function to log activity
CREATE OR REPLACE FUNCTION log_activity(
    action TEXT,
    details JSONB DEFAULT NULL
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

    INSERT INTO activity_logs (user_id, admin_profile_id, action, details)
    VALUES (auth.uid(), admin_id, action, details)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 