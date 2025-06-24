#!/bin/bash

# Set default values for monitoring environment variables
# Run this script to set production-ready defaults for monitoring

echo "🔧 Setting monitoring environment variable defaults..."

# Error Tracking (Sentry) - Leave empty for manual setup
echo "Setting Sentry configuration..."
echo "" | vercel env add SENTRY_DSN production
echo "proheadshots" | vercel env add SENTRY_ORG production  
echo "proheadshots" | vercel env add SENTRY_PROJECT production

# Google Analytics - Leave empty for manual setup
echo "Setting Google Analytics configuration..."
echo "" | vercel env add NEXT_PUBLIC_GA_MEASUREMENT_ID production

# Performance Monitoring - Production defaults
echo "Setting performance monitoring defaults..."
echo "true" | vercel env add PERFORMANCE_MONITORING_ENABLED production
echo "0.1" | vercel env add PERFORMANCE_SAMPLE_RATE production
echo "true" | vercel env add WEB_VITALS_ENABLED production

# Uptime Monitoring - Production defaults
echo "Setting uptime monitoring defaults..."
echo "true" | vercel env add UPTIME_MONITORING_ENABLED production
echo "60000" | vercel env add UPTIME_CHECK_INTERVAL production
echo "10000" | vercel env add HEALTH_CHECK_TIMEOUT production

# Logging Configuration - Production defaults
echo "Setting logging configuration..."
echo "info" | vercel env add LOG_LEVEL production
echo "true" | vercel env add ENABLE_CONSOLE_LOGGING production
echo "true" | vercel env add ENABLE_ERROR_TRACKING production

# Alert Configuration - Set your email
echo "Setting alert configuration..."
echo "alerts@coolpix.me" | vercel env add ALERT_EMAIL production
echo "" | vercel env add SLACK_WEBHOOK_URL production

# Monitoring Dashboard - Enable all
echo "Setting monitoring dashboard configuration..."
echo "true" | vercel env add MONITORING_DASHBOARD_ENABLED production
echo "true" | vercel env add HEALTH_CHECK_API_ENABLED production

# Analytics Configuration - Enable all
echo "Setting analytics configuration..."
echo "true" | vercel env add ANALYTICS_ENABLED production
echo "true" | vercel env add CONVERSION_TRACKING_ENABLED production
echo "true" | vercel env add BUSINESS_METRICS_ENABLED production

# Performance Thresholds - Web Vitals standards
echo "Setting performance thresholds..."
echo "2500" | vercel env add PERFORMANCE_LCP_THRESHOLD production
echo "100" | vercel env add PERFORMANCE_FID_THRESHOLD production
echo "0.1" | vercel env add PERFORMANCE_CLS_THRESHOLD production
echo "1800" | vercel env add PERFORMANCE_FCP_THRESHOLD production
echo "800" | vercel env add PERFORMANCE_TTFB_THRESHOLD production

# Error Tracking Configuration - Production optimized
echo "Setting error tracking configuration..."
echo "1.0" | vercel env add ERROR_TRACKING_SAMPLE_RATE production
echo "true" | vercel env add ERROR_TRACKING_BREADCRUMBS_ENABLED production
echo "true" | vercel env add ERROR_TRACKING_USER_CONTEXT_ENABLED production

# External Service Monitoring - Enable all
echo "Setting external service monitoring..."
echo "true" | vercel env add MONITOR_SUPABASE production
echo "true" | vercel env add MONITOR_FAL_AI production
echo "true" | vercel env add MONITOR_POLAR_PAYMENT production

# Monitoring Data Retention - Reasonable defaults
echo "Setting data retention policies..."
echo "30" | vercel env add MONITORING_DATA_RETENTION_DAYS production
echo "7" | vercel env add PERFORMANCE_DATA_RETENTION_DAYS production
echo "90" | vercel env add ERROR_DATA_RETENTION_DAYS production

echo ""
echo "✅ Monitoring environment defaults set!"
echo ""
echo "🔧 MANUAL SETUP REQUIRED:"
echo "1. Sentry DSN: Get from https://sentry.io and update SENTRY_DSN"
echo "2. Google Analytics: Get measurement ID and update NEXT_PUBLIC_GA_MEASUREMENT_ID"
echo "3. Slack Webhook: Optional - update SLACK_WEBHOOK_URL for alerts"
echo ""
echo "📊 To update a specific variable:"
echo "   vercel env rm VARIABLE_NAME production"
echo "   vercel env add VARIABLE_NAME production"
echo ""
echo "🚀 Deploy after setting up external services:"
echo "   vercel --prod"
