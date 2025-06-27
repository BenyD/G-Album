-- Drop the existing view
DROP VIEW IF EXISTS public.order_summary;

-- Create view for order summary with proper null handling
CREATE OR REPLACE VIEW public.order_summary AS
SELECT 
    o.id,
    o.order_number,
    o.customer_id,
    c.studio_name as customer_name,
    c.email as customer_email,
    c.phone as customer_phone,
    o.status,
    COALESCE(o.total_amount, 0.00) as total_amount,
    COALESCE(o.amount_paid, 0.00) as amount_paid,
    COALESCE(o.total_amount, 0.00) - COALESCE(o.amount_paid, 0.00) as balance_amount,
    o.notes,
    o.created_at,
    o.updated_at,
    (SELECT COUNT(*) FROM public.order_payments op WHERE op.order_id = o.id) as payment_count
FROM 
    public.orders o
    JOIN public.customers c ON c.id = o.customer_id; 