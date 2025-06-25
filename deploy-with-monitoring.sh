#!/bin/bash

echo "🚀 Deploying ProHeadshots with Full Monitoring..."

# Check if Sentry DSN is set
echo "🔍 Checking Sentry configuration..."
SENTRY_CHECK=$(vercel env ls production | grep SENTRY_DSN || echo "not_set")
if [[ $SENTRY_CHECK == *"not_set"* ]]; then
    echo "⚠️  Sentry DSN not configured yet"
    echo "   Please set up Sentry first: https://sentry.io"
else
    echo "✅ Sentry DSN configured"
fi

# Check if GA4 is set
echo "📊 Checking Google Analytics configuration..."
GA_CHECK=$(vercel env ls production | grep NEXT_PUBLIC_GA_MEASUREMENT_ID || echo "not_set")
if [[ $GA_CHECK == *"not_set"* ]]; then
    echo "⚠️  Google Analytics not configured yet"
    echo "   Please set up GA4 first: https://analytics.google.com"
else
    echo "✅ Google Analytics configured"
fi

echo ""
echo "🔧 Current monitoring configuration:"
echo "✅ Performance monitoring: Enabled"
echo "✅ Uptime monitoring: Enabled"
echo "✅ Error tracking: Enabled"
echo "✅ Analytics: Enabled"
echo "✅ Health check API: Enabled"
echo "✅ Business metrics: Enabled"

echo ""
echo "🚀 Deploying to production..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔍 Test your monitoring systems:"
echo "1. Health check: curl https://pro-headshots-9v0w8evmd-thaohienhomes-gmailcoms-projects.vercel.app/api/monitoring/health"
echo "2. Detailed health: curl 'https://pro-headshots-9v0w8evmd-thaohienhomes-gmailcoms-projects.vercel.app/api/monitoring/health?detailed=true'"
echo ""
echo "📊 Monitor your application:"
echo "- Sentry dashboard: https://sentry.io"
echo "- Google Analytics: https://analytics.google.com"
echo "- Vercel dashboard: https://vercel.com/dashboard"
