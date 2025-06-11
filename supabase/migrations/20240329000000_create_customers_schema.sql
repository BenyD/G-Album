-- Drop existing view first since it depends on the customers table
DROP VIEW IF EXISTS public.active_customer_flags;

-- Drop existing tables if they exist (in correct order due to dependencies)
DROP TABLE IF EXISTS public.customer_flags;
DROP TABLE IF EXISTS public.customers;

-- Create customers table
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    reference_phone TEXT,
    reference_name TEXT,
    is_active BOOLEAN DEFAULT true,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create customer flags table
CREATE TABLE public.customer_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id),
    resolution_note TEXT,
    CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id),
    CONSTRAINT fk_resolved_by FOREIGN KEY (resolved_by) REFERENCES auth.users(id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customer_flags_customer_id ON public.customer_flags(customer_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;

-- Create trigger for updating updated_at
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_flags ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow admin read customers" ON public.customers;
DROP POLICY IF EXISTS "Allow admin insert customers" ON public.customers;
DROP POLICY IF EXISTS "Allow admin update customers" ON public.customers;
DROP POLICY IF EXISTS "Allow admin read customer flags" ON public.customer_flags;
DROP POLICY IF EXISTS "Allow admin insert customer flags" ON public.customer_flags;
DROP POLICY IF EXISTS "Allow admin update customer flags" ON public.customer_flags;

-- Policies for customers table
CREATE POLICY "Allow admin read customers"
    ON public.customers
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles
            WHERE admin_profiles.id = auth.uid()
        )
    );

CREATE POLICY "Allow admin insert customers"
    ON public.customers
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_profiles
            WHERE admin_profiles.id = auth.uid()
        )
    );

CREATE POLICY "Allow admin update customers"
    ON public.customers
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

-- Add delete policy for customers
CREATE POLICY "Allow admin delete customers"
    ON public.customers
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles
            WHERE admin_profiles.id = auth.uid()
        )
    );

-- Policies for customer_flags table
CREATE POLICY "Allow admin read customer flags"
    ON public.customer_flags
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles
            WHERE admin_profiles.id = auth.uid()
        )
    );

CREATE POLICY "Allow admin insert customer flags"
    ON public.customer_flags
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_profiles
            WHERE admin_profiles.id = auth.uid()
        )
    );

CREATE POLICY "Allow admin update customer flags"
    ON public.customer_flags
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

-- Create view for active flags
CREATE VIEW public.active_customer_flags AS
SELECT 
    cf.*,
    c.studio_name,
    c.email
FROM public.customer_flags cf
JOIN public.customers c ON c.id = cf.customer_id
WHERE cf.resolved_at IS NULL; 