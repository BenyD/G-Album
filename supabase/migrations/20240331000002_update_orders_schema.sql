-- Drop old order settings table and its dependencies
DROP TABLE IF EXISTS public.order_settings CASCADE;

-- Update orders table to ensure order_number is required and unique
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_order_number_key,
ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);

-- Update the generate_order_number function to use general_settings
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