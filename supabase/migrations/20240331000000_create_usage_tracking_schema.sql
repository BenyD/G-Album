-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create storage usage history table
CREATE TABLE IF NOT EXISTS storage_usage_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    month DATE NOT NULL,
    storage_size BIGINT NOT NULL,
    database_size BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on month for faster queries
CREATE INDEX IF NOT EXISTS idx_storage_usage_history_month ON storage_usage_history(month);

-- Function to get database statistics
CREATE OR REPLACE FUNCTION get_database_stats()
RETURNS TABLE (
    total_size bigint,
    table_count integer,
    index_count integer
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT
        pg_database_size(current_database()) as total_size,
        (SELECT count(*) FROM pg_tables WHERE schemaname = 'public') as table_count,
        (SELECT count(*) FROM pg_indexes WHERE schemaname = 'public') as index_count;
END;
$$;

-- Function to get storage usage
CREATE OR REPLACE FUNCTION get_storage_usage()
RETURNS TABLE (
    total_size bigint,
    bucket_sizes jsonb
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(size), 0) as total_size,
        jsonb_object_agg(
            name,
            jsonb_build_object(
                'size', size,
                'count', count
            )
        ) as bucket_sizes
    FROM (
        SELECT
            name,
            COALESCE(SUM(size), 0) as size,
            COUNT(*) as count
        FROM storage.objects
        GROUP BY name
    ) as bucket_stats;
END;
$$;

-- Function to record monthly storage usage
CREATE OR REPLACE FUNCTION record_monthly_storage_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_month VARCHAR(3);
    storage_stats RECORD;
    db_stats RECORD;
    total_users INTEGER;
BEGIN
    -- Get current month
    current_month := to_char(CURRENT_DATE, 'Mon');

    -- Check if we already have a record for this month
    IF EXISTS (
        SELECT 1 FROM usage_history
        WHERE month = current_month
    ) THEN
        RETURN;
    END IF;

    -- Get storage usage
    SELECT * INTO storage_stats FROM get_storage_usage();
    
    -- Get database usage
    SELECT * INTO db_stats FROM get_database_stats();

    -- Get total users
    SELECT COUNT(*) INTO total_users FROM admin_profiles;

    -- Insert the record
    INSERT INTO usage_history (month, storage, bandwidth, users)
    VALUES (
        current_month,
        storage_stats.total_size::DECIMAL / (1024 * 1024 * 1024), -- Convert to GB
        db_stats.total_size::DECIMAL / (1024 * 1024 * 1024), -- Convert to GB
        total_users
    );

    -- Update storage breakdown
    DELETE FROM storage_breakdown;
    INSERT INTO storage_breakdown (category, size, percentage)
    SELECT
        key as category,
        (value->>'size')::DECIMAL / (1024 * 1024 * 1024) as size, -- Convert to GB
        ((value->>'size')::DECIMAL / NULLIF(storage_stats.total_size, 0) * 100) as percentage
    FROM jsonb_each(storage_stats.bucket_sizes);
END;
$$;

-- Function to get usage history
CREATE OR REPLACE FUNCTION get_usage_history(months integer DEFAULT 5)
RETURNS TABLE (
    month DATE,
    storage_size BIGINT,
    database_size BIGINT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        suh.month,
        suh.storage_size,
        suh.database_size
    FROM storage_usage_history suh
    ORDER BY suh.month DESC
    LIMIT months;
END;
$$; 