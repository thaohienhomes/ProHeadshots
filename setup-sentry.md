# Sentry Setup Guide for ProHeadshots

## Step 1: Create Sentry Account
1. Go to https://sentry.io
2. Sign up with your GitHub account (recommended)
3. Choose "Create a new organization" 
4. Organization name: "ProHeadshots" or "CoolPixMe"

## Step 2: Create Project
1. Click "Create Project"
2. Select platform: "Next.js"
3. Project name: "proheadshots"
4. Set alert frequency: "On every new issue"

## Step 3: Get DSN
1. After project creation, you'll see the DSN
2. Copy the DSN (looks like: https://xxxxx@xxxxx.ingest.sentry.io/xxxxx)
3. Keep this for the next step

## Step 4: Configure Environment Variable
Run this command and paste your DSN when prompted:
```bash
vercel env add SENTRY_DSN production
```

## Step 5: Optional - Set Organization and Project
```bash
vercel env add SENTRY_ORG production
# Enter: proheadshots (or your org name)

vercel env add SENTRY_PROJECT production  
# Enter: proheadshots
```

## What You'll Get:
✅ Real-time error tracking
✅ Performance monitoring
✅ User context with errors
✅ Email alerts for new issues
✅ Error grouping and trends
✅ Release tracking
