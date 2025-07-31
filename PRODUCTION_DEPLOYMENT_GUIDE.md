# 🚀 Production Deployment Guide

## Overview
This guide provides comprehensive instructions for deploying the Coolpix.me Professional Headshots application to production with enterprise-grade security, performance, and reliability.

## 📋 Pre-Deployment Checklist

### ✅ Environment Setup
- [ ] Production domain configured and verified
- [ ] SSL certificates installed and validated
- [ ] CDN configured for global performance
- [ ] Database production instance ready
- [ ] Monitoring and alerting systems configured
- [ ] Backup and disaster recovery procedures tested

### ✅ Security Verification
- [ ] All environment variables secured
- [ ] API keys rotated for production
- [ ] Webhook secrets configured
- [ ] Security audit completed
- [ ] Vulnerability scanning passed
- [ ] Access controls implemented

## 🔧 Production Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://coolpix.me
NEXT_PUBLIC_APP_NAME="Coolpix Professional Headshots"

# Database Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
SUPABASE_ANON_KEY=your_production_anon_key

# Authentication
NEXTAUTH_URL=https://coolpix.me
NEXTAUTH_SECRET=your_production_nextauth_secret_min_32_chars

# Email Service (Resend.com)
RESEND_API_KEY=re_your_production_resend_api_key
NOREPLY_EMAIL=noreply@coolpix.me
ADMIN_EMAIL=admin@coolpix.me

# Payment Processing (Polar)
POLAR_ACCESS_TOKEN=your_production_polar_access_token
POLAR_WEBHOOK_SECRET=your_production_polar_webhook_secret
POLAR_ORGANIZATION_ID=your_production_organization_id

# AI Services
FAL_KEY=your_production_fal_api_key
WEBHOOK_SECRET=your_production_webhook_secret

# Monitoring & Analytics
SENTRY_DSN=your_production_sentry_dsn
ANALYTICS_ID=your_production_analytics_id

# Security
ENCRYPTION_KEY=your_production_encryption_key_32_chars
JWT_SECRET=your_production_jwt_secret_min_32_chars
```

## 🚀 Deployment Steps

### 1. Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Configure environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# ... add all other environment variables
```

### 2. Alternative: Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### 3. Database Setup

```sql
-- Run in Supabase SQL Editor

-- Ensure all tables are created
\i database/create-tables.sql

-- Add production-specific indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_userTable_paymentStatus 
ON public."userTable"("paymentStatus");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_userTable_workStatus 
ON public."userTable"("workStatus");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_userTable_created_at 
ON public."userTable"("created_at");

-- Enable Row Level Security
ALTER TABLE public."userTable" ENABLE ROW LEVEL SECURITY;

-- Create production RLS policies
CREATE POLICY "Users can view own data" ON public."userTable"
FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own data" ON public."userTable"
FOR UPDATE USING (auth.uid()::text = id);
```

## 🔒 Security Configuration

### 1. Supabase Security

```sql
-- Enable additional security features
ALTER DATABASE postgres SET log_statement = 'all';
ALTER DATABASE postgres SET log_min_duration_statement = 1000;

-- Create audit triggers
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (table_name, operation, old_data, new_data, user_id, timestamp)
  VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid(), NOW());
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. API Security Headers

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

## 📊 Monitoring Setup

### 1. Application Monitoring

```javascript
// lib/monitoring.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.authorization;
    }
    return event;
  },
});
```

### 2. Performance Monitoring

```javascript
// lib/analytics.js
export const trackPerformance = (metric) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'timing_complete', {
      name: metric.name,
      value: Math.round(metric.value),
      event_category: 'Performance',
    });
  }
};
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/production.yml
name: Production Deployment

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📈 Performance Optimization

### 1. Caching Strategy

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300'
          }
        ]
      }
    ];
  }
};
```

### 2. Image Optimization

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-cdn-domain.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
  }
};
```

## 🚨 Incident Response

### 1. Monitoring Alerts

Set up alerts for:
- API response time > 1 second
- Error rate > 1%
- Database connection failures
- Payment processing failures
- AI service timeouts

### 2. Rollback Procedure

```bash
# Quick rollback to previous version
vercel rollback --timeout 30s

# Or using specific deployment
vercel rollback [deployment-url]
```

## 📚 Post-Deployment Verification

### 1. Health Checks

```bash
# Test critical endpoints
curl -f https://coolpix.me/api/health
curl -f https://coolpix.me/api/webhooks/polar
curl -f https://coolpix.me/dashboard
```

### 2. Performance Testing

```bash
# Load testing with Artillery
npm install -g artillery
artillery run load-test.yml
```

## 🎯 Success Metrics

Monitor these KPIs post-deployment:
- **Uptime**: > 99.9%
- **Page Load Time**: < 2 seconds
- **API Response Time**: < 500ms
- **Error Rate**: < 0.1%
- **User Satisfaction**: > 4.5/5

## 📞 Support & Maintenance

### Emergency Contacts
- **Technical Lead**: [Your contact]
- **DevOps Engineer**: [Your contact]
- **Product Manager**: [Your contact]

### Regular Maintenance
- Weekly security updates
- Monthly performance reviews
- Quarterly security audits
- Annual disaster recovery testing

## 🔧 Production Configuration Files

### Environment Configuration Template

Create these files for production deployment:

#### `.env.production.template`
```bash
# Copy this file to .env.production and fill in your production values

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME="Your App Name"

# Database Configuration (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here

# Authentication (NextAuth.js)
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_32_char_secret_here

# Email Service (Resend.com)
RESEND_API_KEY=re_your_resend_api_key
NOREPLY_EMAIL=noreply@your-domain.com
ADMIN_EMAIL=admin@your-domain.com

# Payment Processing (Polar)
POLAR_ACCESS_TOKEN=your_polar_access_token
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret
POLAR_ORGANIZATION_ID=your_polar_org_id

# AI Services (Fal AI)
FAL_KEY=your_fal_api_key
WEBHOOK_SECRET=your_webhook_secret

# Monitoring (Optional)
SENTRY_DSN=your_sentry_dsn
ANALYTICS_ID=your_analytics_id
```

#### `vercel.json` (for Vercel deployment)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "headers": {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300"
      }
    }
  ],
  "functions": {
    "app/api/**/*.js": {
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

---

## ✅ Deployment Complete!

Your Coolpix.me application is now ready for production with enterprise-grade security, performance, and reliability. Monitor the success metrics and maintain regular updates for optimal performance.

🚀 **Welcome to Production!** 🚀
