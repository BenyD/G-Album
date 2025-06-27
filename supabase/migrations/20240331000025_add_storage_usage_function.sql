-- Create function to get storage usage across all buckets
CREATE OR REPLACE FUNCTION get_storage_usage()
RETURNS TABLE (
    used_size BIGINT,
    total_size BIGINT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CAST(o.metadata->>'size' AS BIGINT)), 0) as used_size,
        1024 * 1024 * 1024 * 10 as total_size  -- 10GB total storage limit
    FROM storage.objects o;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_storage_usage() TO authenticated; 