-- Update status check constraint to include 'deleted'
ALTER TABLE newsletter_subscribers 
DROP CONSTRAINT IF EXISTS newsletter_subscribers_status_check;

ALTER TABLE newsletter_subscribers 
ADD CONSTRAINT newsletter_subscribers_status_check 
CHECK (status IN ('active', 'inactive', 'unsubscribed', 'deleted'));

-- Add metadata fields for tracking changes
ALTER TABLE newsletter_subscribers
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMP WITH TIME ZONE;

-- Create function to handle subscriber deletion
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

-- Create trigger for handling deletion
DROP TRIGGER IF EXISTS handle_subscriber_deletion_trigger ON newsletter_subscribers;
CREATE TRIGGER handle_subscriber_deletion_trigger
    BEFORE UPDATE ON newsletter_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION handle_subscriber_deletion(); 