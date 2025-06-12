-- Create transaction management functions
CREATE OR REPLACE FUNCTION begin_transaction()
RETURNS void AS $$
BEGIN
    -- Start a new transaction
    PERFORM pg_advisory_xact_lock(1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION commit_transaction()
RETURNS void AS $$
BEGIN
    -- Release the lock
    PERFORM pg_advisory_xact_unlock(1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION rollback_transaction()
RETURNS void AS $$
BEGIN
    -- Release the lock
    PERFORM pg_advisory_xact_unlock(1);
    -- Force a rollback
    RAISE EXCEPTION 'Transaction rolled back';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add delete policy for orders
CREATE POLICY "Allow admin delete orders"
    ON public.orders
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles
            WHERE admin_profiles.id = auth.uid()
        )
    );

-- Add delete policy for order payments
CREATE POLICY "Allow admin delete order payments"
    ON public.order_payments
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles
            WHERE admin_profiles.id = auth.uid()
        )
    );

-- Add delete policy for order logs
CREATE POLICY "Allow admin delete order logs"
    ON public.order_logs
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles
            WHERE admin_profiles.id = auth.uid()
        )
    ); 