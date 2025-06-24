# Production Deployment Guide for CVPHOTO

## Prerequisites

1. **Domain Setup**
   - Purchase domain: `cvphoto.app`
   - Configure DNS to point to Vercel
   - Set up www redirect

2. **Vercel Account**
   - Create Vercel account
   - Connect GitHub repository
   - Configure custom domain

## Step 1: Environment Variables Setup

### Vercel Environment Variables
Copy these from `.env.production` to your Vercel dashboard:

```bash
# Environment
ENVIRONMENT=PRODUCTION
NODE_ENV=production

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://cvphoto.app

# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://dfcpphcozngsbtvslrkf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Payment (Production)
PAYMENT_PROVIDER=polar
POLAR_ACCESS_TOKEN=your_production_polar_token
POLAR_WEBHOOK_SECRET=your_production_webhook_secret

# AI Configuration
AI_PROVIDER=fal
FAL_AI_API_KEY=your_production_fal_api_key

# Email (Production)
SENDGRID_API_KEY=your_production_sendgrid_key
NOREPLY_EMAIL=noreply@cvphoto.app
ADMIN_EMAIL=admin@cvphoto.app

# Google OAuth (Production)
GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret

# Security
APP_WEBHOOK_SECRET=your_production_webhook_secret

# Service Configuration
AI_ENABLED=true
PAYMENT_ENABLED=true
```

## Step 2: Database Optimization

1. **Run Production SQL Scripts**
   ```sql
   -- Execute the queries in database/production-optimization.sql
   -- in your Supabase SQL editor
   ```

2. **Configure Supabase for Production**
   - Enable Row Level Security
   - Set up proper backup schedule
   - Configure connection pooling
   - Set up monitoring alerts

## Step 3: Third-Party Service Configuration

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Update OAuth redirect URIs:
   - `https://cvphoto.app/auth/callback`
   - `https://www.cvphoto.app/auth/callback`

### Polar Payment Setup
1. Update webhook URLs in Polar dashboard:
   - `https://cvphoto.app/api/webhooks/polar`

### SendGrid Setup
1. Verify domain: `cvphoto.app`
2. Set up DKIM and SPF records
3. Create production email templates

## Step 4: Deployment Process

### Automatic Deployment (Recommended)
1. Push to `main` branch
2. Vercel automatically deploys
3. Monitor deployment logs

### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

## Step 5: Post-Deployment Checklist

### Functionality Testing
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] Google OAuth works
- [ ] Payment flow works (test mode first)
- [ ] AI generation works
- [ ] Email notifications work
- [ ] All protected routes work

### Performance Testing
- [ ] Page load speeds < 3 seconds
- [ ] Image optimization working
- [ ] CDN serving static assets
- [ ] Database queries optimized

### Security Testing
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] API endpoints secured
- [ ] Rate limiting working
- [ ] CORS configured correctly

### SEO Testing
- [ ] Sitemap accessible: `/sitemap.xml`
- [ ] Robots.txt accessible: `/robots.txt`
- [ ] Meta tags present
- [ ] Structured data valid

## Step 6: Monitoring Setup

### Error Tracking
- Set up Sentry or similar service
- Configure error alerts
- Monitor API error rates

### Performance Monitoring
- Set up Vercel Analytics
- Monitor Core Web Vitals
- Track conversion rates

### Uptime Monitoring
- Set up uptime monitoring service
- Configure alerts for downtime
- Monitor API response times

## Step 7: Backup Strategy

### Database Backups
- Supabase provides automatic backups
- Set up additional manual backup schedule
- Test backup restoration process

### Code Backups
- GitHub repository serves as code backup
- Tag releases for easy rollback
- Maintain staging environment

## Rollback Plan

### Quick Rollback
1. Revert to previous Vercel deployment
2. Update DNS if needed
3. Notify users if necessary

### Database Rollback
1. Restore from Supabase backup
2. Update application if schema changed
3. Test functionality thoroughly

## Production URLs

- **Main Site**: https://cvphoto.app
- **Admin Panel**: https://cvphoto.app/admin (when implemented)
- **API Health**: https://cvphoto.app/api/health (when implemented)
- **Status Page**: https://status.cvphoto.app (when implemented)

## Support Contacts

- **Technical Issues**: tech@cvphoto.app
- **Business Issues**: business@cvphoto.app
- **Emergency Contact**: emergency@cvphoto.app
