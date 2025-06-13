-- Create usage_history table
CREATE TABLE IF NOT EXISTS usage_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    month VARCHAR(3) NOT NULL,
    storage DECIMAL(10,2) NOT NULL,
    bandwidth DECIMAL(10,2) NOT NULL,
    users INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create storage_breakdown table
CREATE TABLE IF NOT EXISTS storage_breakdown (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    size DECIMAL(10,2) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_category UNIQUE (category)
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_usage_history_updated_at
    BEFORE UPDATE ON usage_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_storage_breakdown_updated_at
    BEFORE UPDATE ON storage_breakdown
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial usage history data
INSERT INTO usage_history (month, storage, bandwidth, users) VALUES
    ('Sep', 0.32, 3.2, 89),
    ('Oct', 0.48, 4.8, 112),
    ('Nov', 0.61, 6.1, 134),
    ('Dec', 0.69, 7.8, 145),
    ('Jan', 0.73, 8.4, 156);

-- Insert initial storage breakdown data
INSERT INTO storage_breakdown (category, size, percentage) VALUES
    ('Album Images', 0.45, 45),
    ('Profile Pictures', 0.06, 6); 