-- Test Polar Columns in userTable
-- Run this after adding the columns to verify they work correctly

-- Test 1: Check if columns exist
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'userTable' 
  AND table_schema = 'public'
  AND column_name IN ('polarCheckoutId', 'polarOrderId', 'polarCustomerId', 'polarSubscriptionId')
ORDER BY column_name;

-- Test 2: Check indexes were created
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'userTable' 
  AND indexname LIKE '%polar%'
ORDER BY indexname;

-- Test 3: Sample update query (don't run this unless you have test data)
-- UPDATE public."userTable" 
-- SET 
--     "polarCheckoutId" = 'test_checkout_123',
--     "polarOrderId" = 'test_order_456'
-- WHERE id = 'your-test-user-id';

-- Test 4: Sample select query to verify data structure
-- SELECT 
--     id,
--     email,
--     paymentStatus,
--     planType,
--     amount,
--     paid_at,
--     polarCheckoutId,
--     polarOrderId,
--     polarCustomerId,
--     polarSubscriptionId
-- FROM public."userTable" 
-- WHERE polarCheckoutId IS NOT NULL
-- LIMIT 5;

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE 'Polar columns test completed successfully';
    RAISE NOTICE 'Check the results above to verify columns were added correctly';
END $$;
