-- Create albums table
CREATE TABLE IF NOT EXISTS public.albums (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    featured BOOLEAN DEFAULT false,
    cover_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create album_images table
CREATE TABLE IF NOT EXISTS public.album_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    album_id UUID REFERENCES public.albums(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RLS policies
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public to view albums" ON public.albums;
DROP POLICY IF EXISTS "Allow public to view album images" ON public.album_images;
DROP POLICY IF EXISTS "Allow admins to manage albums" ON public.albums;
DROP POLICY IF EXISTS "Allow admins to manage album images" ON public.album_images;

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
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles ap
            WHERE ap.id = auth.uid()
            AND EXISTS (
                SELECT 1 FROM public.roles r
                WHERE r.id = ap.role_id
                AND r.name IN ('super_admin', 'admin')
            )
        )
    );

-- Policy for managing album images (admin only)
CREATE POLICY "Allow admins to manage album images"
    ON public.album_images
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles ap
            WHERE ap.id = auth.uid()
            AND EXISTS (
                SELECT 1 FROM public.roles r
                WHERE r.id = ap.role_id
                AND r.name IN ('super_admin', 'admin')
            )
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_albums_updated_at ON public.albums;

-- Create trigger for updating updated_at
CREATE TRIGGER update_albums_updated_at
    BEFORE UPDATE ON public.albums
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for albums if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('albums', 'albums', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Access" ON storage.objects;

-- Create storage policies for the albums bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'albums' );

CREATE POLICY "Admin Insert Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'albums' AND
    EXISTS (
        SELECT 1 FROM public.admin_profiles ap
        WHERE ap.id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.roles r
            WHERE r.id = ap.role_id
            AND r.name IN ('super_admin', 'admin')
        )
    )
);

CREATE POLICY "Admin Update Access"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'albums' AND
    EXISTS (
        SELECT 1 FROM public.admin_profiles ap
        WHERE ap.id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.roles r
            WHERE r.id = ap.role_id
            AND r.name IN ('super_admin', 'admin')
        )
    )
);

CREATE POLICY "Admin Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'albums' AND
    EXISTS (
        SELECT 1 FROM public.admin_profiles ap
        WHERE ap.id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.roles r
            WHERE r.id = ap.role_id
            AND r.name IN ('super_admin', 'admin')
        )
    )
); 