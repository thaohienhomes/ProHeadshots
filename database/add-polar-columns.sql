-- Add Polar Payment Columns to userTable
-- Run this SQL in your Supabase SQL Editor
-- Date: 2025-01-24

-- Add Polar-specific payment tracking columns
ALTER TABLE public."userTable" 
ADD COLUMN IF NOT EXISTS "polarCheckoutId" TEXT,
ADD COLUMN IF NOT EXISTS "polarOrderId" TEXT,
ADD COLUMN IF NOT EXISTS "polarCustomerId" TEXT,
ADD COLUMN IF NOT EXISTS "polarSubscriptionId" TEXT;

-- Add indexes for better query performance on new columns
CREATE INDEX IF NOT EXISTS idx_userTable_polarCheckoutId ON public."userTable"("polarCheckoutId");
CREATE INDEX IF NOT EXISTS idx_userTable_polarOrderId ON public."userTable"("polarOrderId");
CREATE INDEX IF NOT EXISTS idx_userTable_polarCustomerId ON public."userTable"("polarCustomerId");

-- Add comments to document the new columns
COMMENT ON COLUMN public."userTable"."polarCheckoutId" IS 'Polar checkout session ID for payment tracking';
COMMENT ON COLUMN public."userTable"."polarOrderId" IS 'Polar order ID after successful payment';
COMMENT ON COLUMN public."userTable"."polarCustomerId" IS 'Polar customer ID for recurring payments';
COMMENT ON COLUMN public."userTable"."polarSubscriptionId" IS 'Polar subscription ID for subscription-based plans';

-- Verify the columns were added successfully
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'userTable' 
  AND table_schema = 'public'
  AND column_name LIKE 'polar%'
ORDER BY column_name;

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'SUCCESS: Polar payment columns added to userTable';
    RAISE NOTICE 'Added columns: polarCheckoutId, polarOrderId, polarCustomerId, polarSubscriptionId';
    RAISE NOTICE 'Added indexes for better query performance';
END $$;
