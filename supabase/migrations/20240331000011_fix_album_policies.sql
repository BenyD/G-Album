-- Drop existing policies
DROP POLICY IF EXISTS "Allow public to view albums" ON public.albums;
DROP POLICY IF EXISTS "Allow public to view album images" ON public.album_images;
DROP POLICY IF EXISTS "Allow admins to manage albums" ON public.albums;
DROP POLICY IF EXISTS "Allow admins to manage album images" ON public.album_images;

-- Create a function to check if user is an approved admin
CREATE OR REPLACE FUNCTION is_approved_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM admin_profiles ap
        WHERE ap.id = auth.uid()
        AND ap.status = 'approved'
        AND ap.role_id IN (
            SELECT id FROM roles WHERE name IN ('super_admin', 'admin')
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy for viewing albums (public access)
CREATE POLICY "Allow public to view albums"
    ON public.albums
    FOR SELECT
    TO public
    USING (true);

-- Policy for viewing album images (public access)
CREATE POLICY "Allow public to view album images"
    ON public.album_images
    FOR SELECT
    TO public
    USING (true);

-- Policy for creating/updating/deleting albums (admin only)
CREATE POLICY "Allow admins to manage albums"
    ON public.albums
    FOR ALL
    TO authenticated
    USING (is_approved_admin());

-- Policy for managing album images (admin only)
CREATE POLICY "Allow admins to manage album images"
    ON public.album_images
    FOR ALL
    TO authenticated
    USING (is_approved_admin()); 