-- Drop existing policies
DROP POLICY IF EXISTS "Newsletter logs are viewable by approved admins" ON newsletter_logs;
DROP POLICY IF EXISTS "Approved admins can manage newsletters" ON newsletter_logs;

-- Create policy to allow service role to manage logs
CREATE POLICY "Allow service role to manage logs"
    ON newsletter_logs
    FOR ALL
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

-- Create policy to allow public to view logs
CREATE POLICY "Allow public to view logs"
    ON newsletter_logs
    FOR SELECT
    TO public
    USING (true); 