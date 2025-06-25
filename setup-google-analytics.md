# Google Analytics 4 Setup Guide for ProHeadshots

## Step 1: Create Google Analytics Account
1. Go to https://analytics.google.com
2. Sign in with your Google account
3. Click "Start measuring"
4. Account name: "ProHeadshots" or "CoolPix.me"

## Step 2: Create Property
1. Property name: "ProHeadshots"
2. Reporting time zone: Your timezone
3. Currency: USD (or your preferred currency)

## Step 3: Set Up Data Stream
1. Choose platform: "Web"
2. Website URL: https://coolpix.me
3. Stream name: "ProHeadshots Website"
4. Click "Create stream"

## Step 4: Get Measurement ID
1. After creating the stream, you'll see the Measurement ID
2. Copy the ID (looks like: G-XXXXXXXXXX)
3. Keep this for the next step

## Step 5: Configure Environment Variable
Run this command and paste your Measurement ID when prompted:
```bash
vercel env add NEXT_PUBLIC_GA_MEASUREMENT_ID production
```

## Step 6: Enable Enhanced Measurement (Recommended)
1. In your GA4 property, go to "Data Streams"
2. Click on your web stream
3. Toggle ON "Enhanced measurement"
4. This automatically tracks:
   - Page views
   - Scrolls
   - Outbound clicks
   - Site search
   - Video engagement
   - File downloads

## Step 7: Set Up Conversion Events
1. Go to "Events" in GA4
2. Mark these as conversions:
   - `sign_up` (user registration)
   - `purchase` (payment completion)
   - `ai_generation_complete` (successful AI generation)

## What You'll Get:
✅ Real-time user analytics
✅ Conversion funnel tracking
✅ User journey analysis
✅ Revenue tracking
✅ Custom event monitoring
✅ Audience insights
✅ Performance correlation
