-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Replied')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contact_submissions_updated_at
    BEFORE UPDATE ON public.contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow admins with manage_roles or manage_albums permissions to view submissions
CREATE POLICY "Allow admins to view submissions" ON public.contact_submissions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            JOIN roles r ON r.id = ap.role_id
            JOIN role_permissions rp ON rp.role_id = r.id
            JOIN permissions p ON p.id = rp.permission_id
            WHERE ap.id = auth.uid()
            AND p.name IN ('manage_roles', 'manage_albums')
        )
    );

-- Allow admins with manage_roles or manage_albums permissions to update submissions
CREATE POLICY "Allow admins to update submissions" ON public.contact_submissions
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            JOIN roles r ON r.id = ap.role_id
            JOIN role_permissions rp ON rp.role_id = r.id
            JOIN permissions p ON p.id = rp.permission_id
            WHERE ap.id = auth.uid()
            AND p.name IN ('manage_roles', 'manage_albums')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            JOIN roles r ON r.id = ap.role_id
            JOIN role_permissions rp ON rp.role_id = r.id
            JOIN permissions p ON p.id = rp.permission_id
            WHERE ap.id = auth.uid()
            AND p.name IN ('manage_roles', 'manage_albums')
        )
    );

-- Allow admins with manage_roles or manage_albums permissions to delete submissions
CREATE POLICY "Allow admins to delete submissions" ON public.contact_submissions
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            JOIN roles r ON r.id = ap.role_id
            JOIN role_permissions rp ON rp.role_id = r.id
            JOIN permissions p ON p.id = rp.permission_id
            WHERE ap.id = auth.uid()
            AND p.name IN ('manage_roles', 'manage_albums')
        )
    );

-- Allow anyone to insert submissions (for the contact form)
CREATE POLICY "Allow public to insert submissions" ON public.contact_submissions
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Create index for faster status filtering
CREATE INDEX idx_contact_submissions_status ON public.contact_submissions(status);

-- Create index for faster date filtering
CREATE INDEX idx_contact_submissions_created_at ON public.contact_submissions(created_at); 