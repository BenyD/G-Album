-- Drop existing triggers and functions if they exist
DROP TRIGGER IF EXISTS update_newsletter_subscribers_updated_at ON newsletter_subscribers;
DROP TRIGGER IF EXISTS handle_subscriber_deletion_trigger ON newsletter_subscribers;
DROP TRIGGER IF EXISTS update_newsletter_logs_updated_at ON newsletter_logs;

-- Ensure the shared update_updated_at_column function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure newsletter_subscribers table has all required columns and constraints
DO $$ 
BEGIN
    -- Add deleted_at and unsubscribed_at if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'newsletter_subscribers' 
                  AND column_name = 'deleted_at') THEN
        ALTER TABLE newsletter_subscribers 
        ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'newsletter_subscribers' 
                  AND column_name = 'unsubscribed_at') THEN
        ALTER TABLE newsletter_subscribers 
        ADD COLUMN unsubscribed_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Update status check constraint
    ALTER TABLE newsletter_subscribers 
    DROP CONSTRAINT IF EXISTS newsletter_subscribers_status_check;

    ALTER TABLE newsletter_subscribers 
    ADD CONSTRAINT newsletter_subscribers_status_check 
    CHECK (status IN ('active', 'inactive', 'unsubscribed', 'deleted'));
END $$;

-- Create or replace the subscriber deletion handler function
CREATE OR REPLACE FUNCTION handle_subscriber_deletion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'deleted' THEN
        NEW.deleted_at = TIMEZONE('utc'::text, NOW());
        -- Keep only the email and name, clear other fields
        NEW.tags = '{}';
        NEW.metadata = jsonb_build_object(
            'deleted_at', NEW.deleted_at,
            'original_email', NEW.email,
            'original_name', NEW.name
        );
    ELSIF NEW.status = 'unsubscribed' THEN
        NEW.unsubscribed_at = TIMEZONE('utc'::text, NOW());
        NEW.metadata = NEW.metadata || jsonb_build_object(
            'unsubscribed_at', NEW.unsubscribed_at
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate triggers
CREATE TRIGGER update_newsletter_subscribers_updated_at
    BEFORE UPDATE ON newsletter_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER handle_subscriber_deletion_trigger
    BEFORE UPDATE ON newsletter_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION handle_subscriber_deletion();

CREATE TRIGGER update_newsletter_logs_updated_at
    BEFORE UPDATE ON newsletter_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_logs_sent_at ON newsletter_logs(sent_at);

-- Ensure RLS is enabled
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_logs ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies
DROP POLICY IF EXISTS "Newsletter subscribers are viewable by approved admins" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Approved admins can manage subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Newsletter logs are viewable by approved admins" ON newsletter_logs;
DROP POLICY IF EXISTS "Approved admins can manage newsletters" ON newsletter_logs;

-- Policies for newsletter_subscribers
CREATE POLICY "Newsletter subscribers are viewable by approved admins"
    ON newsletter_subscribers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
        )
    );

CREATE POLICY "Approved admins can manage subscribers"
    ON newsletter_subscribers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            INNER JOIN roles r ON ap.role_id = r.id
            INNER JOIN role_permissions rp ON r.id = rp.role_id
            INNER JOIN permissions p ON rp.permission_id = p.id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND p.name = 'manage_subscribers'
        )
    );

-- Policies for newsletter_logs
CREATE POLICY "Newsletter logs are viewable by approved admins"
    ON newsletter_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
        )
    );

CREATE POLICY "Approved admins can manage newsletters"
    ON newsletter_logs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            INNER JOIN roles r ON ap.role_id = r.id
            INNER JOIN role_permissions rp ON r.id = rp.role_id
            INNER JOIN permissions p ON rp.permission_id = p.id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND p.name = 'send_newsletters'
        )
    ); 