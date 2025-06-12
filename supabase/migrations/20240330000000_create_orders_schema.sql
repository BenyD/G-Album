-- Create orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'delivered')),
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Create order payments table to track payment history
CREATE TABLE public.order_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    payment_method TEXT NOT NULL,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Create order settings table for order number sequence
CREATE TABLE public.order_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prefix TEXT NOT NULL DEFAULT 'GA-',
    last_sequence_number INTEGER NOT NULL DEFAULT 2854,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Insert default order settings
INSERT INTO public.order_settings (prefix, last_sequence_number, updated_by)
SELECT 'GA-', 2854, id
FROM auth.users
WHERE email = 'admin@g-album.com'
LIMIT 1;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function to generate next order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
    settings record;
    next_number integer;
    new_order_number text;
BEGIN
    -- Get current settings and lock the row
    SELECT * FROM public.order_settings 
    WHERE id = (SELECT MIN(id) FROM public.order_settings)
    FOR UPDATE;
    
    -- Update the sequence number
    UPDATE public.order_settings 
    SET last_sequence_number = last_sequence_number + 1,
        updated_at = timezone('utc'::text, now())
    WHERE id = (SELECT MIN(id) FROM public.order_settings)
    RETURNING prefix, last_sequence_number INTO settings;
    
    -- Generate the new order number
    new_order_number := settings.prefix || settings.last_sequence_number::text;
    
    RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_order_settings_updated_at ON public.order_settings;
CREATE TRIGGER update_order_settings_updated_at
    BEFORE UPDATE ON public.order_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_order_payments_order_id ON public.order_payments(order_id);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow admin read orders"
    ON public.orders
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles
            WHERE admin_profiles.id = auth.uid()
        )
    );

CREATE POLICY "Allow admin insert orders"
    ON public.orders
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_profiles
            WHERE admin_profiles.id = auth.uid()
        )
    );

CREATE POLICY "Allow admin update orders"
    ON public.orders
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

-- Policies for order payments
CREATE POLICY "Allow admin read order payments"
    ON public.order_payments
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles
            WHERE admin_profiles.id = auth.uid()
        )
    );

CREATE POLICY "Allow admin insert order payments"
    ON public.order_payments
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_profiles
            WHERE admin_profiles.id = auth.uid()
        )
    );

-- Policies for order settings
CREATE POLICY "Allow admin read order settings"
    ON public.order_settings
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles
            WHERE admin_profiles.id = auth.uid()
        )
    );

CREATE POLICY "Allow admin update order settings"
    ON public.order_settings
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

-- Drop the old delete policy if it exists
DROP POLICY IF EXISTS "Allow admin delete orders" ON public.orders;

-- Add new delete policy: allow any admin to delete their own orders, but super_admins can delete any order
CREATE POLICY "Allow admin delete orders"
    ON public.orders
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles ap
            JOIN public.roles r ON ap.role_id = r.id
            WHERE ap.id = auth.uid()
            AND (
                r.name = 'super_admin' -- super_admin can delete any order
                OR ap.id = orders.created_by -- regular admin can delete their own orders
            )
        )
    );

-- Create view for order summary
CREATE OR REPLACE VIEW public.order_summary AS
SELECT 
    o.id,
    o.order_number,
    o.customer_id,
    c.studio_name as customer_name,
    c.email as customer_email,
    c.phone as customer_phone,
    o.status,
    o.total_amount,
    o.amount_paid,
    (o.total_amount - o.amount_paid) as balance_amount,
    o.notes,
    o.created_at,
    o.updated_at,
    (SELECT COUNT(*) FROM public.order_payments op WHERE op.order_id = o.id) as payment_count
FROM 
    public.orders o
    JOIN public.customers c ON c.id = o.customer_id; 