-- Create newsletter logs table
CREATE TABLE IF NOT EXISTS newsletter_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'draft')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on sent_at for faster queries
CREATE INDEX IF NOT EXISTS idx_newsletter_logs_sent_at ON newsletter_logs(sent_at);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_newsletter_logs_updated_at
    BEFORE UPDATE ON newsletter_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 