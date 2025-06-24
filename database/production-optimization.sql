-- Production Database Optimization for CVPHOTO
-- Run these queries in your Supabase SQL editor for production optimization

-- 1. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_userTable_id ON "userTable"(id);
CREATE INDEX IF NOT EXISTS idx_userTable_paymentStatus ON "userTable"("paymentStatus");
CREATE INDEX IF NOT EXISTS idx_userTable_workStatus ON "userTable"("workStatus");
CREATE INDEX IF NOT EXISTS idx_userTable_created_at ON "userTable"(created_at);

-- 2. Create index for email lookups (if you have email column)
-- CREATE INDEX IF NOT EXISTS idx_userTable_email ON "userTable"(email);

-- 3. Optimize JSON queries for userPhotos
CREATE INDEX IF NOT EXISTS idx_userTable_userPhotos_gin ON "userTable" USING gin("userPhotos");

-- 4. Create partial indexes for active users
CREATE INDEX IF NOT EXISTS idx_userTable_active_users 
ON "userTable"("paymentStatus", "workStatus") 
WHERE "paymentStatus" IS NOT NULL AND "paymentStatus" != 'NULL';

-- 5. Add database statistics update
ANALYZE "userTable";

-- 6. Create function for cleanup old data (run monthly)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
  -- Delete users who haven't completed payment after 30 days
  DELETE FROM "userTable" 
  WHERE ("paymentStatus" IS NULL OR "paymentStatus" = 'NULL')
    AND created_at < NOW() - INTERVAL '30 days';
    
  -- Log cleanup
  RAISE NOTICE 'Cleanup completed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- 7. Create function for database health check
CREATE OR REPLACE FUNCTION database_health_check()
RETURNS TABLE(
  metric_name text,
  metric_value text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 'total_users'::text, COUNT(*)::text FROM "userTable"
  UNION ALL
  SELECT 'paid_users'::text, COUNT(*)::text FROM "userTable" 
    WHERE "paymentStatus" IS NOT NULL AND "paymentStatus" != 'NULL'
  UNION ALL
  SELECT 'completed_users'::text, COUNT(*)::text FROM "userTable" 
    WHERE "workStatus" = 'completed'
  UNION ALL
  SELECT 'ongoing_users'::text, COUNT(*)::text FROM "userTable" 
    WHERE "workStatus" = 'ongoing';
END;
$$ LANGUAGE plpgsql;

-- 8. Set up Row Level Security (RLS) policies for production
ALTER TABLE "userTable" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY "Users can view own data" ON "userTable"
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data" ON "userTable"
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can insert their own data
CREATE POLICY "Users can insert own data" ON "userTable"
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 9. Create backup configuration (manual backup strategy)
-- Note: Supabase handles automated backups, but you can create manual snapshots

-- 10. Performance monitoring view
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as new_users,
  COUNT(CASE WHEN "paymentStatus" IS NOT NULL AND "paymentStatus" != 'NULL' THEN 1 END) as paid_users,
  COUNT(CASE WHEN "workStatus" = 'completed' THEN 1 END) as completed_users
FROM "userTable"
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- 11. Create function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(days_back integer DEFAULT 7)
RETURNS TABLE(
  total_users bigint,
  new_users_last_n_days bigint,
  conversion_rate numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM "userTable") as total_users,
    (SELECT COUNT(*) FROM "userTable" WHERE created_at >= NOW() - (days_back || ' days')::interval) as new_users_last_n_days,
    CASE 
      WHEN (SELECT COUNT(*) FROM "userTable" WHERE created_at >= NOW() - (days_back || ' days')::interval) > 0
      THEN ROUND(
        (SELECT COUNT(*) FROM "userTable" 
         WHERE created_at >= NOW() - (days_back || ' days')::interval 
         AND "paymentStatus" IS NOT NULL AND "paymentStatus" != 'NULL')::numeric / 
        (SELECT COUNT(*) FROM "userTable" WHERE created_at >= NOW() - (days_back || ' days')::interval)::numeric * 100, 2
      )
      ELSE 0
    END as conversion_rate;
END;
$$ LANGUAGE plpgsql;
