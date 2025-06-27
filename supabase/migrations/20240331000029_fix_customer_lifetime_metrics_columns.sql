-- Drop existing function
DROP FUNCTION IF EXISTS get_customer_lifetime_metrics();

-- Recreate function with consistent column names
CREATE OR REPLACE FUNCTION get_customer_lifetime_metrics()
RETURNS TABLE (
    segment TEXT,
    avg_value DECIMAL,
    customer_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN c.total_spent >= 25000 THEN 'Premium Customers'
            WHEN c.total_spent >= 10000 THEN 'Regular Customers'
            ELSE 'New Customers'
        END as segment,
        COALESCE(AVG(c.total_spent), 0) as avg_value,
        COUNT(*) as customer_count
    FROM public.customers c
    GROUP BY 
        CASE 
            WHEN c.total_spent >= 25000 THEN 'Premium Customers'
            WHEN c.total_spent >= 10000 THEN 'Regular Customers'
            ELSE 'New Customers'
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 