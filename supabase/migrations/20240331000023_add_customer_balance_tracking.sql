-- Create customer_previous_balances table
CREATE TABLE IF NOT EXISTS public.customer_previous_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Create customer_balance_payments table to track payments
CREATE TABLE IF NOT EXISTS public.customer_balance_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    payment_method TEXT NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Create customer_balance_logs table
CREATE TABLE IF NOT EXISTS public.customer_balance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX idx_customer_previous_balances_customer_id ON public.customer_previous_balances(customer_id);
CREATE INDEX idx_customer_balance_payments_customer_id ON public.customer_balance_payments(customer_id);
CREATE INDEX idx_customer_balance_logs_customer_id ON public.customer_balance_logs(customer_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_customer_balance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating updated_at
CREATE TRIGGER update_customer_previous_balances_updated_at
    BEFORE UPDATE ON public.customer_previous_balances
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_balance_updated_at();

-- Create view for customer balance summary
CREATE OR REPLACE VIEW public.customer_balance_summary AS
SELECT 
    c.id as customer_id,
    c.studio_name,
    c.email,
    c.phone,
    COALESCE(pb.total_amount, 0.00) as previous_balance_total,
    COALESCE(pb.amount_paid, 0.00) as previous_balance_paid,
    COALESCE(pb.total_amount - pb.amount_paid, 0.00) as previous_balance_remaining,
    c.total_spent,
    COALESCE(o.pending_amount, 0.00) as pending_orders_amount,
    COALESCE(pb.total_amount - pb.amount_paid, 0.00) + COALESCE(o.pending_amount, 0.00) as total_balance
FROM public.customers c
LEFT JOIN public.customer_previous_balances pb ON pb.customer_id = c.id
LEFT JOIN (
    SELECT 
        customer_id,
        SUM(total_amount - amount_paid) as pending_amount
    FROM public.orders
    WHERE status != 'delivered'
    GROUP BY customer_id
) o ON o.customer_id = c.id;

-- Enable RLS
ALTER TABLE public.customer_previous_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_balance_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_balance_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for customer_previous_balances
CREATE POLICY "Allow admin read customer previous balances"
    ON public.customer_previous_balances
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles ap
            JOIN public.roles r ON r.id = ap.role_id
            JOIN public.role_permissions rp ON rp.role_id = r.id
            JOIN public.permissions p ON p.id = rp.permission_id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND (
                p.name = 'view_customers' OR
                p.name = 'manage_customers' OR
                r.name IN ('super_admin', 'admin')
            )
        )
    );

CREATE POLICY "Allow admin manage customer previous balances"
    ON public.customer_previous_balances
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles ap
            JOIN public.roles r ON r.id = ap.role_id
            JOIN public.role_permissions rp ON rp.role_id = r.id
            JOIN public.permissions p ON p.id = rp.permission_id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND (
                p.name = 'manage_customers' OR
                r.name IN ('super_admin', 'admin')
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_profiles ap
            JOIN public.roles r ON r.id = ap.role_id
            JOIN public.role_permissions rp ON rp.role_id = r.id
            JOIN public.permissions p ON p.id = rp.permission_id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND (
                p.name = 'manage_customers' OR
                r.name IN ('super_admin', 'admin')
            )
        )
    );

-- Create policies for customer_balance_payments
CREATE POLICY "Allow admin read customer balance payments"
    ON public.customer_balance_payments
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles ap
            JOIN public.roles r ON r.id = ap.role_id
            JOIN public.role_permissions rp ON rp.role_id = r.id
            JOIN public.permissions p ON p.id = rp.permission_id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND (
                p.name = 'view_customers' OR
                p.name = 'manage_customers' OR
                r.name IN ('super_admin', 'admin')
            )
        )
    );

CREATE POLICY "Allow admin insert customer balance payments"
    ON public.customer_balance_payments
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_profiles ap
            JOIN public.roles r ON r.id = ap.role_id
            JOIN public.role_permissions rp ON rp.role_id = r.id
            JOIN public.permissions p ON p.id = rp.permission_id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND (
                p.name = 'manage_customers' OR
                r.name IN ('super_admin', 'admin')
            )
        )
    );

-- Create policies for customer_balance_logs
CREATE POLICY "Allow admin read customer balance logs"
    ON public.customer_balance_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles ap
            JOIN public.roles r ON r.id = ap.role_id
            JOIN public.role_permissions rp ON rp.role_id = r.id
            JOIN public.permissions p ON p.id = rp.permission_id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND (
                p.name = 'view_customers' OR
                p.name = 'manage_customers' OR
                r.name IN ('super_admin', 'admin')
            )
        )
    );

CREATE POLICY "Allow admin insert customer balance logs"
    ON public.customer_balance_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_profiles ap
            JOIN public.roles r ON r.id = ap.role_id
            JOIN public.role_permissions rp ON rp.role_id = r.id
            JOIN public.permissions p ON p.id = rp.permission_id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND (
                p.name = 'manage_customers' OR
                r.name IN ('super_admin', 'admin')
            )
        )
    ); 