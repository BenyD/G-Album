-- Drop existing policies
DROP POLICY IF EXISTS "Newsletter subscribers are viewable by approved admins" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Approved admins can manage subscribers" ON newsletter_subscribers;

-- Create policy to allow public insert
CREATE POLICY "Allow public to subscribe"
    ON newsletter_subscribers
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Create policy to allow admins to view subscribers
CREATE POLICY "Allow admins to view subscribers"
    ON newsletter_subscribers
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            JOIN roles r ON ap.role_id = r.id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND r.name IN ('super_admin', 'admin', 'editor')
        )
    );

-- Create policy to allow admins to update subscribers
CREATE POLICY "Allow admins to update subscribers"
    ON newsletter_subscribers
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            JOIN roles r ON ap.role_id = r.id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND r.name IN ('super_admin', 'admin', 'editor')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            JOIN roles r ON ap.role_id = r.id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND r.name IN ('super_admin', 'admin', 'editor')
        )
    );

-- Create policy to allow admins to delete subscribers
CREATE POLICY "Allow admins to delete subscribers"
    ON newsletter_subscribers
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            JOIN roles r ON ap.role_id = r.id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND r.name IN ('super_admin', 'admin', 'editor')
        )
    ); 