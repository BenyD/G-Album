-- Create view for monthly revenue and orders
CREATE OR REPLACE VIEW public.monthly_analytics AS
SELECT 
    DATE_TRUNC('month', o.created_at) as month,
    COUNT(*) as total_orders,
    SUM(o.total_amount) as total_revenue,
    AVG(o.total_amount) as average_order_value,
    COUNT(DISTINCT o.customer_id) as unique_customers
FROM public.orders o
GROUP BY DATE_TRUNC('month', o.created_at)
ORDER BY month DESC;

-- Create view for order status distribution
CREATE OR REPLACE VIEW public.order_status_analytics AS
SELECT 
    status,
    COUNT(*) as count,
    CASE 
        WHEN status = 'completed' THEN '#22c55e'
        WHEN status = 'in_progress' THEN '#f59e0b'
        WHEN status = 'pending' THEN '#ef4444'
        ELSE '#6b7280'
    END as color
FROM public.orders
GROUP BY status;

-- Create view for customer analytics
CREATE OR REPLACE VIEW public.customer_analytics AS
SELECT 
    DATE_TRUNC('month', o.created_at) as month,
    COUNT(DISTINCT CASE WHEN c.total_orders = 1 THEN c.id END) as new_customers,
    COUNT(DISTINCT CASE WHEN c.total_orders > 1 THEN c.id END) as returning_customers,
    AVG(c.total_spent) as average_customer_value
FROM public.orders o
JOIN public.customers c ON c.id = o.customer_id
GROUP BY DATE_TRUNC('month', o.created_at)
ORDER BY month DESC;

-- Create function to get revenue breakdown by order type
CREATE OR REPLACE FUNCTION get_revenue_breakdown(start_date DATE, end_date DATE)
RETURNS TABLE (
    category TEXT,
    revenue DECIMAL,
    percentage DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH total_revenue AS (
        SELECT SUM(total_amount) as total
        FROM public.orders
        WHERE created_at BETWEEN start_date AND end_date
    )
    SELECT 
        CASE 
            WHEN estimated_delivery_date - created_at <= 3 THEN 'Rush Orders'
            WHEN estimated_delivery_date - created_at <= 7 THEN 'Standard Orders'
            ELSE 'Custom Orders'
        END as category,
        SUM(total_amount) as revenue,
        (SUM(total_amount) * 100.0 / (SELECT total FROM total_revenue)) as percentage
    FROM public.orders
    WHERE created_at BETWEEN start_date AND end_date
    GROUP BY 
        CASE 
            WHEN estimated_delivery_date - created_at <= 3 THEN 'Rush Orders'
            WHEN estimated_delivery_date - created_at <= 7 THEN 'Standard Orders'
            ELSE 'Custom Orders'
        END
    ORDER BY revenue DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get order processing time metrics
CREATE OR REPLACE FUNCTION get_order_processing_metrics()
RETURNS TABLE (
    order_type TEXT,
    avg_processing_time DECIMAL,
    order_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN o.estimated_delivery_date - o.created_at <= 3 THEN 'Rush Orders'
            WHEN o.estimated_delivery_date - o.created_at <= 7 THEN 'Standard Orders'
            ELSE 'Custom Orders'
        END as order_type,
        AVG(EXTRACT(EPOCH FROM (o.updated_at - o.created_at)) / 86400) as avg_processing_time,
        COUNT(*) as order_count
    FROM public.orders o
    WHERE o.status IN ('completed', 'delivered')
    GROUP BY 
        CASE 
            WHEN o.estimated_delivery_date - o.created_at <= 3 THEN 'Rush Orders'
            WHEN o.estimated_delivery_date - o.created_at <= 7 THEN 'Standard Orders'
            ELSE 'Custom Orders'
        END;
END;
$$ LANGUAGE plpgsql;

-- Create function to get customer lifetime value metrics
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
        AVG(c.total_spent) as avg_value,
        COUNT(*) as customer_count
    FROM public.customers c
    GROUP BY 
        CASE 
            WHEN c.total_spent >= 25000 THEN 'Premium Customers'
            WHEN c.total_spent >= 10000 THEN 'Regular Customers'
            ELSE 'New Customers'
        END;
END;
$$ LANGUAGE plpgsql; 