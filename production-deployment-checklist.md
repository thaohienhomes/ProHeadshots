# 🚀 coolpix.me Production Deployment Checklist

## ✅ COMPLETED ITEMS
- [x] Application builds successfully
- [x] Fal AI integration working perfectly
- [x] Database schema validated
- [x] Authentication flow tested
- [x] TypeScript errors resolved (build working)

## 🔧 IMMEDIATE ACTIONS REQUIRED

### 1. Update Polar Access Token (CRITICAL - BLOCKING)
**Status**: ❌ Current token expired
**Action**: 
1. Go to https://polar.sh/dashboard
2. Navigate to Settings → API Keys
3. Create new token with permissions: Read products, Create checkouts, Read orders, Webhook access
4. Run: `node update-polar-token.mjs YOUR_NEW_TOKEN`

### 2. Configure SendGrid (HIGH PRIORITY)
**Status**: ❌ Placeholder API key
**Action**:
1. Go to https://sendgrid.com/
2. Sign up for free account (100 emails/day)
3. Create API key with Mail Send permissions
4. Run: `node setup-sendgrid.mjs YOUR_SENDGRID_KEY`

## 📋 PRODUCTION ENVIRONMENT VARIABLES

### Required for Vercel Deployment
```bash
# Database & Auth
NEXT_PUBLIC_SUPABASE_URL=https://dfcpphcozngsbtvslrkf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmY3BwaGNvem5nc2J0dnNscmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NTA2NTgsImV4cCI6MjA1NzUyNjY1OH0.3YVRK1zBW4_ge09ZKX2ZCE5XcNUOh7fLsloVJ8loLJ8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmY3BwaGNvem5nc2J0dnNscmtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTk1MDY1OCwiZXhwIjoyMDU3NTI2NjU4fQ.bKEcGZbgc3bM7ft7R-qXVvXS6wmBV9gNx_qaX964rQw

# AI Service
AI_PROVIDER=fal
FAL_AI_API_KEY=b33325f9-e7b7-4256-b0c4-38c44ee25cfd:44d18d3a6404f2856275482ea1093a5b

# Payment Service
PAYMENT_PROVIDER=polar
POLAR_ACCESS_TOKEN=[NEW_TOKEN_FROM_STEP_1]
POLAR_WEBHOOK_SECRET=POLAR_WEBHOOK_SECRET_2024

# Email Service
SENDGRID_API_KEY=[NEW_KEY_FROM_STEP_2]
NOREPLY_EMAIL=noreply@cvphoto.app
ADMIN_EMAIL=admin@cvphoto.app

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://coolpix.me
APP_WEBHOOK_SECRET=COOLPIX_PRODUCTION_WEBHOOK_SECRET_2024

# Service Toggles
AI_ENABLED=true
PAYMENT_ENABLED=true
```

## 🌐 DOMAIN & DNS SETUP

### Domain Configuration
- **Primary Domain**: coolpix.me
- **Redirect**: www.coolpix.me → coolpix.me

### DNS Records Needed
```
Type    Name    Value
A       @       76.76.19.61 (Vercel IP)
CNAME   www     cname.vercel-dns.com
```

## 🔐 OAUTH & WEBHOOK UPDATES

### Google OAuth Console
**Update Authorized Redirect URIs**:
- Add: `https://dfcpphcozngsbtvslrkf.supabase.co/auth/v1/callback`
- Keep existing localhost for development

### Supabase Auth Configuration
**Update Site URL**: 
- Change from `http://localhost:3000` to `https://cvphoto.app`
- Add redirect URLs: `https://cvphoto.app`, `https://www.cvphoto.app`

### Polar Webhook Configuration
**Update webhook URL**:
- Set to: `https://cvphoto.app/api/webhooks/polar`

## 📊 TESTING CHECKLIST

### Pre-Deployment Tests
- [ ] Run: `node test-integrations.mjs` (all should pass)
- [ ] Run: `npm run build` (should succeed)
- [ ] Test Polar payment: `node test-polar-integration.mjs`
- [ ] Test SendGrid: `node setup-sendgrid.mjs` (without args to test)

### Post-Deployment Tests
- [ ] Visit https://cvphoto.app (loads correctly)
- [ ] Test Google OAuth login
- [ ] Test payment flow (use test mode)
- [ ] Test AI image generation
- [ ] Test email notifications

## 🚀 DEPLOYMENT STEPS

### 1. Vercel Deployment
```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
# Or use CLI: vercel env add VARIABLE_NAME
```

### 2. Domain Setup
1. In Vercel dashboard, go to Project Settings → Domains
2. Add custom domain: `cvphoto.app`
3. Add redirect: `www.cvphoto.app` → `cvphoto.app`
4. Update DNS records as shown above

### 3. SSL Certificate
- Vercel automatically provisions SSL certificates
- Verify HTTPS is working: https://cvphoto.app

## 🔍 MONITORING SETUP

### Essential Monitoring
- [ ] Vercel Analytics (already configured)
- [ ] Error tracking (Sentry recommended)
- [ ] Uptime monitoring (UptimeRobot or similar)

### Performance Monitoring
- [ ] Core Web Vitals tracking
- [ ] API response time monitoring
- [ ] Database query performance

## 🎯 SUCCESS CRITERIA

### Application Must:
- [x] Build and deploy without errors
- [ ] Handle user registration and login
- [ ] Process payments successfully
- [ ] Generate AI headshots
- [ ] Send email notifications
- [ ] Work on mobile devices

### Performance Targets:
- Page load time: < 3 seconds
- Time to Interactive: < 5 seconds
- Core Web Vitals: All green

## 🆘 TROUBLESHOOTING

### Common Issues:
1. **Build Failures**: Check TypeScript errors, missing env vars
2. **OAuth Issues**: Verify redirect URIs match exactly
3. **Payment Failures**: Check Polar token and webhook URL
4. **Email Issues**: Verify SendGrid key and template IDs

### Emergency Contacts:
- Vercel Support: https://vercel.com/help
- Supabase Support: https://supabase.com/support
- Polar Support: https://polar.sh/support

---

## 📞 NEXT IMMEDIATE STEPS

1. **Get Polar token** (5 minutes)
2. **Get SendGrid key** (10 minutes)  
3. **Test integrations** (5 minutes)
4. **Deploy to Vercel** (15 minutes)
5. **Configure domain** (10 minutes)
6. **Final testing** (15 minutes)

**Total estimated time: 1 hour**
