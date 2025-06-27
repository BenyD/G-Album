-- Create materialized view for monthly analytics
CREATE MATERIALIZED VIEW monthly_analytics_mv AS
SELECT
  date_trunc('month', o.created_at) as month,
  COUNT(DISTINCT o.id) as total_orders,
  COUNT(DISTINCT o.customer_id) as total_customers,
  COALESCE(SUM(o.total_amount), 0) as total_revenue,
  COALESCE(AVG(o.total_amount), 0) as average_order_value,
  COUNT(DISTINCT CASE WHEN o.created_at >= date_trunc('month', CURRENT_DATE) THEN o.id END) as monthly_orders,
  COALESCE(SUM(CASE WHEN o.created_at >= date_trunc('month', CURRENT_DATE) THEN o.total_amount END), 0) as monthly_revenue
FROM orders o
GROUP BY date_trunc('month', o.created_at)
ORDER BY month DESC;

-- Create index on the materialized view
CREATE UNIQUE INDEX monthly_analytics_mv_month_idx ON monthly_analytics_mv (month);

-- Create materialized view for order status analytics
CREATE MATERIALIZED VIEW order_status_analytics_mv AS
SELECT
  o.status,
  COUNT(*) as count,
  CASE
    WHEN o.status = 'pending' THEN '#FFA500'
    WHEN o.status = 'processing' THEN '#3B82F6'
    WHEN o.status = 'shipped' THEN '#10B981'
    WHEN o.status = 'delivered' THEN '#059669'
    WHEN o.status = 'cancelled' THEN '#EF4444'
    ELSE '#6B7280'
  END as color
FROM orders o
GROUP BY o.status;

-- Create index on the materialized view
CREATE UNIQUE INDEX order_status_analytics_mv_status_idx ON order_status_analytics_mv (status);

-- Create materialized view for customer analytics
CREATE MATERIALIZED VIEW customer_analytics_mv AS
SELECT
  date_trunc('month', c.created_at) as month,
  COUNT(DISTINCT c.id) as total_customers,
  COUNT(DISTINCT CASE WHEN c.created_at >= date_trunc('month', CURRENT_DATE) THEN c.id END) as new_customers,
  COUNT(DISTINCT CASE 
    WHEN o.created_at >= date_trunc('month', CURRENT_DATE) AND o.customer_id = c.id 
    THEN o.id 
  END) as returning_customers,
  COALESCE(AVG(customer_stats.total_spent), 0) as average_customer_value
FROM customers c
LEFT JOIN (
  SELECT 
    customer_id,
    COUNT(id) as total_orders,
    COALESCE(SUM(total_amount), 0) as total_spent
  FROM orders
  GROUP BY customer_id
) customer_stats ON customer_stats.customer_id = c.id
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY date_trunc('month', c.created_at)
ORDER BY month DESC;

-- Create index on the materialized view
CREATE UNIQUE INDEX customer_analytics_mv_month_idx ON customer_analytics_mv (month);

-- Create function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_analytics_mv;
  REFRESH MATERIALIZED VIEW CONCURRENTLY order_status_analytics_mv;
  REFRESH MATERIALIZED VIEW CONCURRENTLY customer_analytics_mv;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to refresh views when data changes
CREATE OR REPLACE FUNCTION refresh_analytics_views_trigger()
RETURNS trigger AS $$
BEGIN
  PERFORM refresh_analytics_views();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for relevant tables
CREATE TRIGGER refresh_analytics_on_order_change
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_analytics_views_trigger();

CREATE TRIGGER refresh_analytics_on_customer_change
AFTER INSERT OR UPDATE OR DELETE ON customers
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_analytics_views_trigger();

-- Grant necessary permissions
GRANT SELECT ON monthly_analytics_mv TO authenticated;
GRANT SELECT ON order_status_analytics_mv TO authenticated;
GRANT SELECT ON customer_analytics_mv TO authenticated; 