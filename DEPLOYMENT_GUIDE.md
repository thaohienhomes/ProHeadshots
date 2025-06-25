# ProHeadshots Deployment Guide

This guide will help you deploy ProHeadshots with the complete email integration system.

## 🚀 **Deployment Checklist**

### ✅ **Pre-Deployment (Completed)**
- [x] SendGrid templates created and configured
- [x] Email template IDs updated in code
- [x] Email workflow integration implemented
- [x] Environment variables configured
- [x] All dependencies installed
- [x] Email system tested

### 📋 **Deployment Steps**

## **Step 1: Prepare for Deployment**

### **1A. Build and Test Locally**
```bash
# Install dependencies
npm install

# Build the application
npm run build

# Test the build locally
npm start
```

### **1B. Verify Email Configuration**
```bash
# Run final pre-deployment check
node scripts/pre-deployment-check.mjs

# Test email integration one more time
node scripts/test-email-integration.mjs your@email.com
```

## **Step 2: Deploy to Vercel**

### **2A. Connect to Vercel**
```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link
```

### **2B. Set Environment Variables**

**Option 1: Via Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Copy all variables from `vercel-env-vars.txt`

**Option 2: Via Vercel CLI**
```bash
# Set critical environment variables
vercel env add SENDGRID_API_KEY
vercel env add POLAR_ACCESS_TOKEN
vercel env add FAL_AI_API_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### **2C. Deploy**
```bash
# Deploy to production
vercel --prod
```

## **Step 3: Post-Deployment Verification**

### **3A. Test Core Functionality**
1. **Visit your live site**: https://coolpix.me
2. **Test user registration** (should trigger welcome email)
3. **Test payment flow** (should trigger order confirmation)
4. **Test AI processing** (should trigger processing emails)

### **3B. Test Email System**
```bash
# Test emails on production
curl -X POST https://coolpix.me/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","template":"welcome"}'
```

### **3C. Monitor Logs**
```bash
# View deployment logs
vercel logs

# Monitor real-time logs
vercel logs --follow
```

## **Step 4: Domain and DNS Configuration**

### **4A. Custom Domain Setup**
1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add `coolpix.me` and `www.coolpix.me`
3. Configure DNS records as instructed by Vercel

### **4B. Email Domain Authentication**
1. **SendGrid Domain Authentication**:
   - Go to SendGrid → Settings → Sender Authentication
   - Add domain `coolpix.me`
   - Configure DNS records for DKIM/SPF

2. **Update DNS Records**:
   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:sendgrid.net ~all
   
   Type: CNAME
   Name: s1._domainkey
   Value: s1.domainkey.u[YOUR_ID].wl.sendgrid.net
   
   Type: CNAME
   Name: s2._domainkey
   Value: s2.domainkey.u[YOUR_ID].wl.sendgrid.net
   ```

## **Step 5: Production Testing**

### **5A. End-to-End User Journey Test**
1. **New User Registration**
   - Sign up with a test email
   - Verify welcome email received
   - Check email formatting and links

2. **Purchase Flow**
   - Select a plan and proceed to checkout
   - Complete payment with test card
   - Verify order confirmation email
   - Verify payment confirmation email

3. **AI Processing Flow**
   - Upload photos for processing
   - Verify processing started email
   - Wait for completion
   - Verify processing complete email with download links

4. **Support Flow**
   - Test password reset email
   - Test support response email (if applicable)

### **5B. Email Deliverability Test**
Test with multiple email providers:
- Gmail
- Outlook/Hotmail
- Yahoo Mail
- Apple iCloud
- Corporate email addresses

### **5C. Performance Monitoring**
1. **SendGrid Analytics**
   - Monitor delivery rates
   - Check open/click rates
   - Watch for bounces/spam reports

2. **Application Monitoring**
   - Monitor email sending errors in logs
   - Check API response times
   - Verify webhook processing

## **Step 6: Ongoing Maintenance**

### **6A. Email Template Updates**
```bash
# To update email templates:
1. Modify HTML files in src/templates/email/
2. Run: node scripts/setup-sendgrid-templates.mjs
3. Deploy updated application
```

### **6B. Monitoring and Alerts**
- Set up SendGrid alerts for delivery issues
- Monitor Vercel function logs for email errors
- Track email engagement metrics

### **6C. Backup and Recovery**
- Email templates are version controlled in Git
- SendGrid templates can be exported via API
- Environment variables documented in repository

## **🔧 Troubleshooting**

### **Common Issues**

**1. Emails Not Sending**
```bash
# Check SendGrid API key
curl -X GET "https://api.sendgrid.com/v3/user/profile" \
  -H "Authorization: Bearer YOUR_SENDGRID_API_KEY"

# Check application logs
vercel logs --follow
```

**2. Template Not Found Errors**
- Verify template IDs in `src/utils/emailTemplates.ts`
- Check SendGrid dashboard for template status

**3. Environment Variable Issues**
```bash
# List all environment variables
vercel env ls

# Pull environment variables locally
vercel env pull .env.local
```

**4. Domain Authentication Issues**
- Verify DNS records are properly configured
- Check SendGrid domain authentication status
- Allow 24-48 hours for DNS propagation

### **Support Resources**
- SendGrid Documentation: https://docs.sendgrid.com/
- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs

## **🎉 Success Metrics**

Your deployment is successful when:
- ✅ All email templates are sending correctly
- ✅ Email delivery rate > 95%
- ✅ No critical errors in application logs
- ✅ User journey emails are received within 2 minutes
- ✅ Email formatting looks correct across email clients
- ✅ All links in emails are working
- ✅ Unsubscribe links are functional

## **📞 Emergency Contacts**

If you encounter critical issues:
1. Check Vercel status page: https://vercel-status.com/
2. Check SendGrid status page: https://status.sendgrid.com/
3. Review application logs for specific error messages
4. Test email functionality with the provided test scripts

---

**Deployment completed successfully!** 🚀

Your ProHeadshots application with comprehensive email integration is now live at https://coolpix.me
