-- Drop all existing storage usage functions
DROP FUNCTION IF EXISTS get_storage_usage();

-- Create function to get storage usage across all buckets
CREATE OR REPLACE FUNCTION get_storage_usage()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    storage_limit BIGINT := (CAST(1 AS BIGINT) * CAST(1024 AS BIGINT) * CAST(1024 AS BIGINT) * CAST(1024 AS BIGINT)); -- 1GB in bytes for free tier
    total_used BIGINT;
BEGIN
    -- Calculate total used size from storage.objects metadata
    SELECT COALESCE(
        SUM(
            CASE 
                WHEN metadata->>'size' IS NULL OR metadata->>'size' = '' THEN 0
                ELSE CAST(CAST(metadata->>'size' AS TEXT) AS BIGINT)
            END
        ),
        0
    ) INTO total_used
    FROM storage.objects
    WHERE bucket_id IN ('albums', 'avatars')
    AND metadata->>'size' IS NOT NULL;

    -- Return as a JSON object matching the frontend interface
    RETURN jsonb_build_object(
        'used', total_used,
        'total', storage_limit
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_storage_usage() TO authenticated; 