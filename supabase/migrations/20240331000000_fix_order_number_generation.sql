-- Drop the existing function
DROP FUNCTION IF EXISTS public.generate_order_number();

-- Create function to generate next order number with fixed implementation
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
    settings record;
    next_number integer;
    new_order_number text;
    settings_id uuid;
BEGIN
    -- Get the first settings ID
    SELECT id INTO settings_id
    FROM public.order_settings
    ORDER BY created_at ASC
    LIMIT 1;
    
    -- Get current settings and lock the row
    SELECT * FROM public.order_settings 
    WHERE id = settings_id
    FOR UPDATE;
    
    -- Update the sequence number
    UPDATE public.order_settings 
    SET last_sequence_number = last_sequence_number + 1,
        updated_at = timezone('utc'::text, now())
    WHERE id = settings_id
    RETURNING prefix, last_sequence_number INTO settings;
    
    -- Generate the new order number
    new_order_number := settings.prefix || settings.last_sequence_number::text;
    
    RETURN new_order_number;
END;
$$ LANGUAGE plpgsql; 