# Vercel Domain Setup Instructions

## Step 1: Access Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Login with your account
3. Find and click on your "pro-headshots" project

## Step 2: Navigate to Domain Settings
1. In your project dashboard, click "Settings" (top navigation)
2. Click "Domains" in the left sidebar
3. You'll see the current Vercel URL listed

## Step 3: Add Custom Domain
1. Click the "Add" button or "Add Domain" button
2. Enter: `coolpix.me`
3. Click "Add"
4. Vercel will show you DNS configuration instructions

## Step 4: Add www Subdomain
1. Click "Add" again
2. Enter: `www.coolpix.me`
3. Click "Add"
4. This ensures both www and non-www work

## Step 5: Note DNS Configuration
Vercel will display DNS records like:

**For coolpix.me:**
- Type: A
- Name: @ (or leave blank)
- Value: 76.76.19.61

**For www.coolpix.me:**
- Type: CNAME
- Name: www
- Value: cname.vercel-dns.com

## Important Notes:
- Don't configure DNS yet - wait for next step
- Keep this tab open for reference
- Vercel may show different IP addresses - use what they provide
