#!/bin/bash

# Setup Vercel Environment Variables for ProHeadshots
# Run this script after installing Vercel CLI: npm i -g vercel

echo "Setting up Vercel environment variables for ProHeadshots..."

# Supabase Configuration
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Payment Configuration
vercel env add POLAR_ACCESS_TOKEN production
vercel env add PAYMENT_PROVIDER production

# AI Configuration
vercel env add FAL_AI_API_KEY production
vercel env add AI_PROVIDER production

# Email Configuration
vercel env add SENDGRID_API_KEY production
vercel env add NOREPLY_EMAIL production

# Site Configuration
vercel env add NEXT_PUBLIC_SITE_URL production
vercel env add ENVIRONMENT production

# Security
vercel env add APP_WEBHOOK_SECRET production
vercel env add POLAR_WEBHOOK_SECRET production

# Google OAuth
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production

# Service Toggles
vercel env add AI_ENABLED production
vercel env add PAYMENT_ENABLED production

# Monitoring & Analytics Configuration
echo "📊 Setting up monitoring and analytics..."

# Error Tracking (Sentry)
vercel env add SENTRY_DSN production
vercel env add SENTRY_ORG production
vercel env add SENTRY_PROJECT production

# Google Analytics
vercel env add NEXT_PUBLIC_GA_MEASUREMENT_ID production

# Performance Monitoring
vercel env add PERFORMANCE_MONITORING_ENABLED production
vercel env add PERFORMANCE_SAMPLE_RATE production
vercel env add WEB_VITALS_ENABLED production

# Uptime Monitoring
vercel env add UPTIME_MONITORING_ENABLED production
vercel env add UPTIME_CHECK_INTERVAL production
vercel env add HEALTH_CHECK_TIMEOUT production

# Logging Configuration
vercel env add LOG_LEVEL production
vercel env add ENABLE_CONSOLE_LOGGING production
vercel env add ENABLE_ERROR_TRACKING production

# Alert Configuration
vercel env add ALERT_EMAIL production
vercel env add SLACK_WEBHOOK_URL production

# Monitoring Dashboard
vercel env add MONITORING_DASHBOARD_ENABLED production
vercel env add HEALTH_CHECK_API_ENABLED production

# Analytics Configuration
vercel env add ANALYTICS_ENABLED production
vercel env add CONVERSION_TRACKING_ENABLED production
vercel env add BUSINESS_METRICS_ENABLED production

# Performance Thresholds
vercel env add PERFORMANCE_LCP_THRESHOLD production
vercel env add PERFORMANCE_FID_THRESHOLD production
vercel env add PERFORMANCE_CLS_THRESHOLD production
vercel env add PERFORMANCE_FCP_THRESHOLD production
vercel env add PERFORMANCE_TTFB_THRESHOLD production

# Error Tracking Configuration
vercel env add ERROR_TRACKING_SAMPLE_RATE production
vercel env add ERROR_TRACKING_BREADCRUMBS_ENABLED production
vercel env add ERROR_TRACKING_USER_CONTEXT_ENABLED production

# External Service Monitoring
vercel env add MONITOR_SUPABASE production
vercel env add MONITOR_FAL_AI production
vercel env add MONITOR_POLAR_PAYMENT production

# Monitoring Data Retention
vercel env add MONITORING_DATA_RETENTION_DAYS production
vercel env add PERFORMANCE_DATA_RETENTION_DAYS production
vercel env add ERROR_DATA_RETENTION_DAYS production

echo "✅ Core environment variables setup complete!"
echo "� Monitoring and analytics variables configured!"
echo ""
echo "🔧 NEXT STEPS:"
echo "1. Set actual values for monitoring variables:"
echo "   - SENTRY_DSN: Get from https://sentry.io"
echo "   - NEXT_PUBLIC_GA_MEASUREMENT_ID: Get from Google Analytics"
echo "   - ALERT_EMAIL: Your monitoring alerts email"
echo ""
echo "2. Deploy monitoring endpoints:"
echo "   vercel --prod"
echo ""
echo "3. Verify monitoring systems:"
echo "   curl https://coolpix.me/api/monitoring/health"
echo ""
echo "🚀 Production deployment ready!"
