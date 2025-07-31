# 🗄️ **POLAR COLUMNS MIGRATION GUIDE**
## Adding Polar Payment Columns to userTable

**Date**: January 24, 2025  
**Purpose**: Add Polar-specific payment tracking columns to userTable  
**Status**: Ready for execution

---

## 📋 **OVERVIEW**

This migration adds four new columns to the `userTable` to support Polar payment integration:

| Column Name | Type | Purpose |
|-------------|------|---------|
| `polarCheckoutId` | TEXT | Stores Polar checkout session ID |
| `polarOrderId` | TEXT | Stores Polar order ID after payment |
| `polarCustomerId` | TEXT | Stores Polar customer ID for recurring payments |
| `polarSubscriptionId` | TEXT | Stores Polar subscription ID for subscriptions |

---

## 🚀 **STEP-BY-STEP EXECUTION**

### **Step 1: Access Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **"New Query"**

### **Step 2: Run the Migration**
1. Copy the contents of `database/add-polar-columns.sql`
2. Paste it into the SQL Editor
3. Click **"Run"** to execute the migration
4. Verify you see the success messages

### **Step 3: Verify the Migration**
1. Copy the contents of `database/test-polar-columns.sql`
2. Paste it into a new SQL query
3. Click **"Run"** to verify the columns were added correctly
4. Check that all 4 columns appear in the results

---

## 📁 **FILES INCLUDED**

### **1. `add-polar-columns.sql`**
- Main migration script
- Adds all 4 Polar columns
- Creates performance indexes
- Includes documentation comments

### **2. `test-polar-columns.sql`**
- Verification script
- Tests column existence
- Checks index creation
- Provides sample queries

### **3. This guide (`POLAR_COLUMNS_MIGRATION_GUIDE.md`)**
- Complete instructions
- Troubleshooting tips
- Rollback procedures

---

## ✅ **EXPECTED RESULTS**

After running the migration, you should see:

```sql
-- Column verification results:
column_name          | data_type | is_nullable
---------------------|-----------|------------
polarCheckoutId      | text      | YES
polarCustomerId      | text      | YES  
polarOrderId         | text      | YES
polarSubscriptionId  | text      | YES

-- Index verification results:
indexname                           | indexdef
------------------------------------|------------------------------------------
idx_userTable_polarCheckoutId       | CREATE INDEX ... ON "userTable"("polarCheckoutId")
idx_userTable_polarCustomerId       | CREATE INDEX ... ON "userTable"("polarCustomerId")  
idx_userTable_polarOrderId          | CREATE INDEX ... ON "userTable"("polarOrderId")
```

---

## 🔧 **INTEGRATION STATUS**

### **✅ Already Updated Files:**
- `src/action/verifyPaymentPolar.ts` - Uses new columns
- `src/app/api/webhooks/polar/route.ts` - Uses new columns

### **🎯 Ready for Use:**
- Polar checkout verification will now store checkout IDs
- Webhook handlers will store order IDs
- Payment tracking is fully functional

---

## 🚨 **TROUBLESHOOTING**

### **Issue: Permission Denied**
```
ERROR: permission denied for table userTable
```
**Solution**: Make sure you're using the service role key or have proper permissions

### **Issue: Column Already Exists**
```
ERROR: column "polarCheckoutId" of relation "userTable" already exists
```
**Solution**: This is normal if you've run the migration before. The `IF NOT EXISTS` clause prevents errors.

### **Issue: Index Creation Failed**
```
ERROR: relation "idx_userTable_polarCheckoutId" already exists
```
**Solution**: This is normal if indexes already exist. The `IF NOT EXISTS` clause prevents errors.

---

## 🔄 **ROLLBACK PROCEDURE**

If you need to remove the columns (not recommended after data is stored):

```sql
-- WARNING: This will delete all Polar payment data!
-- Only run if absolutely necessary

ALTER TABLE public."userTable" 
DROP COLUMN IF EXISTS "polarCheckoutId",
DROP COLUMN IF EXISTS "polarOrderId", 
DROP COLUMN IF EXISTS "polarCustomerId",
DROP COLUMN IF EXISTS "polarSubscriptionId";

-- Drop indexes
DROP INDEX IF EXISTS idx_userTable_polarCheckoutId;
DROP INDEX IF EXISTS idx_userTable_polarOrderId;
DROP INDEX IF EXISTS idx_userTable_polarCustomerId;
```

---

## 🎉 **POST-MIGRATION TESTING**

After running the migration, test the Polar payment flow:

1. **Development Testing**:
   ```
   http://localhost:3006/postcheckout-polar?checkout_id=mock_checkout_123
   ```

2. **Production Testing**:
   - Complete a real Polar checkout
   - Verify data is stored in the new columns
   - Check webhook processing

---

## 📞 **SUPPORT**

If you encounter any issues:
1. Check the Supabase logs for detailed error messages
2. Verify your database permissions
3. Ensure you're connected to the correct project
4. Review the troubleshooting section above

**Migration Ready**: Execute `add-polar-columns.sql` when ready! 🚀
