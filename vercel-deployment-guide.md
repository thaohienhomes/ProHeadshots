# 🚀 Vercel Deployment Guide for CoolPix.me

## 📋 **Pre-Deployment Checklist**
- ✅ Code pushed to GitHub: https://github.com/thaohienhomes/ProHeadshots
- ✅ All integrations tested and working
- ✅ Domain configuration updated to coolpix.me
- ✅ Environment variables prepared

---

## 🌐 **Step 1: Deploy to Vercel**

### **Option A: Deploy via Vercel Dashboard (Recommended)**

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Sign in with your GitHub account

2. **Import Project**
   - Click **"Add New"** → **"Project"**
   - Select **"Import Git Repository"**
   - Choose: `thaohienhomes/ProHeadshots`

3. **Configure Project**
   - **Project Name**: `coolpix-me` or `proheadshots`
   - **Framework**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

4. **Add Environment Variables**
   - Click **"Environment Variables"**
   - Add each variable from the list below
   - Set **Environment**: Production

5. **Deploy**
   - Click **"Deploy"**
   - Wait for deployment to complete (~2-3 minutes)

### **Option B: Deploy via CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Follow prompts:
# - Link to existing project? No
# - Project name: coolpix-me
# - Directory: ./
```

---

## 🔧 **Step 2: Environment Variables**

Add these in Vercel Dashboard → Project Settings → Environment Variables:

```bash
# Database & Authentication
NEXT_PUBLIC_SUPABASE_URL=https://dfcpphcozngsbtvslrkf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmY3BwaGNvem5nc2J0dnNscmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NTA2NTgsImV4cCI6MjA1NzUyNjY1OH0.3YVRK1zBW4_ge09ZKX2ZCE5XcNUOh7fLsloVJ8loLJ8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmY3BwaGNvem5nc2J0dnNscmtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTk1MDY1OCwiZXhwIjoyMDU3NTI2NjU4fQ.bKEcGZbgc3bM7ft7R-qXVvXS6wmBV9gNx_qaX964rQw

# AI Service
AI_PROVIDER=fal
AI_ENABLED=true
FAL_AI_API_KEY=b33325f9-e7b7-4256-b0c4-38c44ee25cfd:44d18d3a6404f2856275482ea1093a5b

# Payment Service
PAYMENT_PROVIDER=polar
PAYMENT_ENABLED=true
POLAR_ACCESS_TOKEN=polar_oat_kDl1QpSbBKGX2RcOIBxEgYB8FotkX9knBAugc0Lahed
POLAR_WEBHOOK_SECRET=POLAR_WEBHOOK_SECRET_2024

# Email Service
SENDGRID_API_KEY=YOUR_SENDGRID_API_KEY
NOREPLY_EMAIL=noreply@coolpix.me
ADMIN_EMAIL=admin@coolpix.me

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://coolpix.me
APP_WEBHOOK_SECRET=COOLPIX_PRODUCTION_WEBHOOK_SECRET_2024

# Environment
ENVIRONMENT=PRODUCTION
```

---

## 🌐 **Step 3: Configure Custom Domain**

### **In Vercel Dashboard:**

1. **Go to Project Settings**
   - Select your deployed project
   - Click **"Domains"** tab

2. **Add Custom Domain**
   - Click **"Add"**
   - Enter: `coolpix.me`
   - Click **"Add"**

3. **Add WWW Redirect**
   - Click **"Add"** again
   - Enter: `www.coolpix.me`
   - Select **"Redirect to coolpix.me"**
   - Click **"Add"**

### **DNS Configuration:**

Update your domain DNS settings (at your domain registrar):

```
Type    Name    Value                           TTL
A       @       76.76.19.61                     300
CNAME   www     cname.vercel-dns.com           300
```

**Alternative (if A record doesn't work):**
```
Type    Name    Value                           TTL
CNAME   @       cname.vercel-dns.com           300
CNAME   www     cname.vercel-dns.com           300
```

---

## 🔐 **Step 4: Update OAuth & Webhook URLs**

### **Google OAuth Console:**
1. Go to: https://console.cloud.google.com/
2. Select your project
3. **APIs & Services** → **Credentials**
4. Edit your OAuth client
5. **Authorized JavaScript origins:**
   - Add: `https://coolpix.me`
   - Add: `https://www.coolpix.me`
6. **Authorized redirect URIs:**
   - Keep: `https://dfcpphcozngsbtvslrkf.supabase.co/auth/v1/callback`

### **Supabase Auth Configuration:**
1. Go to: https://supabase.com/dashboard
2. Select your project
3. **Authentication** → **URL Configuration**
4. **Site URL**: Change to `https://coolpix.me`
5. **Redirect URLs**: Add `https://coolpix.me` and `https://www.coolpix.me`

### **Polar Webhook Configuration:**
1. Go to: https://polar.sh/dashboard
2. **Settings** → **Webhooks**
3. Update webhook URL to: `https://coolpix.me/api/webhooks/polar`

---

## 🧪 **Step 5: Test Deployment**

### **Basic Tests:**
- [ ] Visit https://coolpix.me (loads correctly)
- [ ] Check https://www.coolpix.me redirects to https://coolpix.me
- [ ] SSL certificate is active (green lock icon)

### **Functionality Tests:**
- [ ] Google OAuth login works
- [ ] User registration flow
- [ ] Payment processing (test mode)
- [ ] AI image generation
- [ ] Email notifications

### **Performance Tests:**
- [ ] Page load speed < 3 seconds
- [ ] Mobile responsiveness
- [ ] Core Web Vitals (check in Vercel Analytics)

---

## 🎯 **Expected Results**

After successful deployment:
- **URL**: https://coolpix.me
- **SSL**: Automatically provisioned by Vercel
- **Performance**: Optimized with Vercel's global CDN
- **Analytics**: Available in Vercel dashboard

---

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **Domain not working:**
   - Check DNS propagation: https://dnschecker.org/
   - Wait up to 24 hours for DNS changes

2. **OAuth errors:**
   - Verify redirect URIs match exactly
   - Check Google Console configuration

3. **Build failures:**
   - Check environment variables are set
   - Review build logs in Vercel dashboard

4. **API errors:**
   - Verify all API keys are correct
   - Check webhook URLs are updated

---

## 📞 **Support Resources**

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/help
- **DNS Help**: https://vercel.com/docs/concepts/projects/custom-domains

---

**Ready to deploy? Let's start with Step 1!** 🚀
