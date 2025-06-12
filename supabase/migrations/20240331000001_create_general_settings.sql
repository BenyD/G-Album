-- Create general settings table
CREATE TABLE IF NOT EXISTS public.general_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number_prefix TEXT NOT NULL DEFAULT 'GA-',
    last_order_number INTEGER NOT NULL DEFAULT 2854,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Add RLS policies for general settings
ALTER TABLE public.general_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin read general settings"
    ON public.general_settings
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles
            WHERE admin_profiles.id = auth.uid()
        )
    );

CREATE POLICY "Allow admin update general settings"
    ON public.general_settings
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles
            WHERE admin_profiles.id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_profiles
            WHERE admin_profiles.id = auth.uid()
        )
    );

CREATE POLICY "Allow admin insert general settings"
    ON public.general_settings
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_profiles
            WHERE admin_profiles.id = auth.uid()
        )
    );

-- Drop old order settings table and function
DROP TABLE IF EXISTS public.order_settings;
DROP FUNCTION IF EXISTS public.generate_order_number();

-- Create new function to generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
    settings record;
    next_number integer;
    new_order_number text;
    settings_id uuid;
BEGIN
    -- Get the settings record, creating it if it doesn't exist
    SELECT id INTO settings_id
    FROM public.general_settings
    ORDER BY created_at ASC
    LIMIT 1;
    
    IF settings_id IS NULL THEN
        -- Create initial settings if none exist
        INSERT INTO public.general_settings 
            (order_number_prefix, last_order_number, created_by, updated_by)
        SELECT 
            'GA-', 
            2854, 
            auth.uid(), 
            auth.uid()
        RETURNING id INTO settings_id;
    END IF;
    
    -- Get current settings and lock the row
    SELECT * FROM public.general_settings 
    WHERE id = settings_id
    FOR UPDATE;
    
    -- Update the sequence number
    UPDATE public.general_settings 
    SET last_order_number = last_order_number + 1,
        updated_at = timezone('utc'::text, now()),
        updated_by = auth.uid()
    WHERE id = settings_id
    RETURNING order_number_prefix, last_order_number INTO settings;
    
    -- Generate the new order number
    new_order_number := settings.order_number_prefix || settings.last_order_number::text;
    
    RETURN new_order_number;
END;
$$ LANGUAGE plpgsql; 