-- Drop existing policies
DROP POLICY IF EXISTS "Allow public to insert submissions" ON public.contact_submissions;

-- Create new policy to allow public insert
CREATE POLICY "Allow public to insert submissions"
    ON public.contact_submissions
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Create policy to allow admins to view submissions
CREATE POLICY "Allow admins to view submissions"
    ON public.contact_submissions
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

-- Create policy to allow admins to update submissions
CREATE POLICY "Allow admins to update submissions"
    ON public.contact_submissions
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

-- Create policy to allow admins to delete submissions
CREATE POLICY "Allow admins to delete submissions"
    ON public.contact_submissions
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