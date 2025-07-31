-- Payment Analytics Tables for Enhanced Monitoring
-- Run this to add payment tracking and analytics capabilities

-- 1. Payment Events Table for detailed tracking
CREATE TABLE IF NOT EXISTS public.payment_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'checkout_created', 
        'payment_started', 
        'payment_completed', 
        'payment_failed', 
        'verification_started', 
        'verification_completed'
    )),
    checkout_id TEXT NOT NULL,
    user_id UUID REFERENCES public."userTable"(id),
    plan_type TEXT,
    amount DECIMAL(10,2),
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Payment Sessions Table for tracking checkout sessions
CREATE TABLE IF NOT EXISTS public.payment_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    checkout_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public."userTable"(id),
    status TEXT NOT NULL DEFAULT 'created' CHECK (status IN (
        'created', 'pending', 'processing', 'completed', 'failed', 'expired'
    )),
    plan_type TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    polar_product_id TEXT,
    polar_customer_id TEXT,
    expires_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Webhook Deliveries Table for tracking webhook processing
CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    webhook_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'processing', 'delivered', 'failed', 'retrying'
    )),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    error_message TEXT,
    scheduled_at TIMESTAMPTZ DEFAULT NOW(),
    last_attempt_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_events_checkout_id ON public.payment_events(checkout_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_user_id ON public.payment_events(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_timestamp ON public.payment_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_payment_events_type_timestamp ON public.payment_events(event_type, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_payment_sessions_checkout_id ON public.payment_sessions(checkout_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_user_id ON public.payment_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_status ON public.payment_sessions(status);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_created_at ON public.payment_sessions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON public.webhook_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_event_type ON public.webhook_deliveries(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_scheduled_at ON public.webhook_deliveries(scheduled_at);

-- 5. Create updated_at trigger for payment_sessions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payment_sessions_updated_at 
    BEFORE UPDATE ON public.payment_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Add RLS policies for security
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- Allow service role to access all data
CREATE POLICY "Service role can access all payment_events" ON public.payment_events
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all payment_sessions" ON public.payment_sessions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all webhook_deliveries" ON public.webhook_deliveries
    FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to view their own payment data
CREATE POLICY "Users can view their own payment events" ON public.payment_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own payment sessions" ON public.payment_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- 7. Create a view for payment analytics
CREATE OR REPLACE VIEW public.payment_analytics AS
SELECT 
    DATE_TRUNC('day', pe.timestamp) as date,
    COUNT(*) FILTER (WHERE pe.event_type = 'checkout_created') as checkouts_created,
    COUNT(*) FILTER (WHERE pe.event_type = 'payment_started') as payments_started,
    COUNT(*) FILTER (WHERE pe.event_type = 'payment_completed') as payments_completed,
    COUNT(*) FILTER (WHERE pe.event_type = 'payment_failed') as payments_failed,
    SUM(pe.amount) FILTER (WHERE pe.event_type = 'payment_completed') as revenue,
    ROUND(
        (COUNT(*) FILTER (WHERE pe.event_type = 'payment_completed')::DECIMAL / 
         NULLIF(COUNT(*) FILTER (WHERE pe.event_type = 'checkout_created'), 0)) * 100, 
        2
    ) as conversion_rate
FROM public.payment_events pe
WHERE pe.timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', pe.timestamp)
ORDER BY date DESC;

-- 8. Grant necessary permissions
GRANT SELECT ON public.payment_analytics TO authenticated;
GRANT SELECT ON public.payment_events TO authenticated;
GRANT SELECT ON public.payment_sessions TO authenticated;

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE 'Payment analytics tables created successfully!';
    RAISE NOTICE 'Tables created: payment_events, payment_sessions, webhook_deliveries';
    RAISE NOTICE 'View created: payment_analytics';
    RAISE NOTICE 'Indexes and RLS policies applied';
END $$;
