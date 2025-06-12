-- Create order_logs table
CREATE TABLE IF NOT EXISTS public.order_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Create index for faster lookups
CREATE INDEX idx_order_logs_order_id ON public.order_logs(order_id);
CREATE INDEX idx_order_logs_created_at ON public.order_logs(created_at);

-- Enable RLS
ALTER TABLE public.order_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow admin read order logs"
    ON public.order_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles
            WHERE admin_profiles.id = auth.uid()
        )
    );

CREATE POLICY "Allow admin insert order logs"
    ON public.order_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_profiles
            WHERE admin_profiles.id = auth.uid()
        )
    ); 