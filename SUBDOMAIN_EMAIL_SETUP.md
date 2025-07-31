# Subdomain Email Setup Guide - mail.coolpix.me

This guide explains how to set up subdomain-based email addresses for Coolpix.me using Resend.com.

## 🎯 **Why Use a Subdomain for Emails?**

### **Benefits of mail.coolpix.me:**
- ✅ **Better Deliverability**: Separates transactional emails from your main domain
- ✅ **Professional Organization**: Clear separation of email types
- ✅ **DNS Management**: Easier to manage email-specific DNS records
- ✅ **Security**: Isolates email infrastructure from main website
- ✅ **Scalability**: Easier to add new email addresses as needed

## 📧 **How Resend Works with Domains**

### **Important Concept:**
- ❌ **You DON'T create individual email addresses** in Resend
- ✅ **You verify the DOMAIN** (`mail.coolpix.me`) in Resend
- ✅ **You can send FROM any address** on that verified domain

### **Example:**
Once `mail.coolpix.me` is verified, you can send from:
- `noreply@mail.coolpix.me`
- `admin@mail.coolpix.me`
- `support@mail.coolpix.me`
- `orders@mail.coolpix.me`
- Any other `@mail.coolpix.me` address

## 🔧 **Step 1: Add Domain to Resend Dashboard**

### **Process:**
1. **Login to Resend**: https://resend.com/login
2. **Go to Domains**: https://resend.com/domains
3. **Click**: "Add Domain"
4. **Enter**: `mail.coolpix.me` (NOT individual email addresses)
5. **Click**: "Add Domain"

### **Verification:**
Resend will provide DNS records to add to your domain registrar.

## 🌐 **Step 2: DNS Configuration**

### **Required DNS Records for mail.coolpix.me:**

| Record Type | Host | Value | Purpose |
|-------------|------|-------|---------|
| **CNAME** | `mail` | `coolpix.me` | Points subdomain to main domain |
| **TXT** | `mail` | `v=spf1 include:amazonses.com ~all` | SPF authentication |
| **TXT** | `resend._domainkey.mail` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...` | DKIM signing |
| **TXT** | `_dmarc.mail` | `v=DMARC1; p=none; rua=mailto:dmarc.reports@mail.coolpix.me;` | DMARC policy |
| **MX** | `mail` | `feedback-smtp.us-east-1.amazonses.com` | Mail routing |

### **DNS Setup Instructions:**
1. **Login to your domain registrar** (where you bought coolpix.me)
2. **Go to DNS management**
3. **Add the records above**
4. **Wait for DNS propagation** (5-30 minutes)
5. **Verify in Resend dashboard**

## 📧 **Step 3: Recommended Email Addresses**

### **Current Configuration:**
```bash
NOREPLY_EMAIL=noreply@mail.coolpix.me
ADMIN_EMAIL=admin@mail.coolpix.me
```

### **Recommended Additional Addresses:**

#### **Core System Emails:**
- `noreply@mail.coolpix.me` - System notifications (no replies expected)
- `admin@mail.coolpix.me` - Administrative communications
- `system@mail.coolpix.me` - System-generated emails

#### **Customer-Facing Emails:**
- `support@mail.coolpix.me` - Customer support inquiries
- `orders@mail.coolpix.me` - Order confirmations and updates
- `notifications@mail.coolpix.me` - Processing status updates
- `billing@mail.coolpix.me` - Payment and billing emails

#### **Marketing & Communication:**
- `hello@mail.coolpix.me` - General inquiries
- `updates@mail.coolpix.me` - Product updates and announcements
- `newsletter@mail.coolpix.me` - Newsletter communications

### **Email Address Mapping for Your App:**

| Email Type | Recommended Address | Purpose |
|------------|-------------------|---------|
| **Welcome Emails** | `noreply@mail.coolpix.me` | New user onboarding |
| **Order Confirmations** | `orders@mail.coolpix.me` | Purchase confirmations |
| **Processing Updates** | `notifications@mail.coolpix.me` | AI generation status |
| **Completion Notices** | `notifications@mail.coolpix.me` | Headshots ready |
| **Password Resets** | `noreply@mail.coolpix.me` | Security emails |
| **Support Responses** | `support@mail.coolpix.me` | Customer service |
| **Admin Notifications** | `admin@mail.coolpix.me` | Internal alerts |

## 🔧 **Step 4: Update Environment Variables**

### **Current .env.local Configuration:**
```bash
# Resend.com Email Service (Subdomain Configuration)
RESEND_API_KEY=re_DpK2YtTH_MKzdsCJfJwLjAuak85BjKBE7

# Email Addresses (Domain: mail.coolpix.me)
NOREPLY_EMAIL=noreply@mail.coolpix.me
ADMIN_EMAIL=admin@mail.coolpix.me

# Additional Email Addresses (Optional - for future use)
# SUPPORT_EMAIL=support@mail.coolpix.me
# ORDERS_EMAIL=orders@mail.coolpix.me
# NOTIFICATIONS_EMAIL=notifications@mail.coolpix.me
```

### **To Add More Email Types:**
1. **Uncomment** the additional email variables
2. **Add new variables** as needed:
   ```bash
   BILLING_EMAIL=billing@mail.coolpix.me
   HELLO_EMAIL=hello@mail.coolpix.me
   ```

## 🧪 **Step 5: Testing Your Configuration**

### **Test Script:**
```bash
node scripts/test-subdomain-email.mjs
```

### **Manual Testing:**
1. **Start your app**: `npm run dev`
2. **Create a test user** to trigger welcome email
3. **Check your inbox** for the email
4. **Verify sender** shows as `noreply@mail.coolpix.me`

## 📊 **Step 6: Monitoring & Analytics**

### **Resend Dashboard:**
- **Email Logs**: https://resend.com/emails
- **Analytics**: https://resend.com/analytics
- **Domain Status**: https://resend.com/domains

### **Key Metrics to Monitor:**
- ✅ **Delivery Rate**: Percentage of emails delivered
- ✅ **Bounce Rate**: Emails that couldn't be delivered
- ✅ **Open Rate**: User engagement with emails
- ✅ **Click Rate**: Link clicks in emails

## 🔧 **Troubleshooting**

### **Common Issues:**

#### **"Domain not found" Error:**
- **Solution**: Add `mail.coolpix.me` to Resend dashboard
- **Check**: Domain verification status

#### **DNS Propagation Issues:**
- **Wait**: Up to 24 hours for full propagation
- **Test**: Use DNS checker tools
- **Verify**: All DNS records are correctly added

#### **Email Not Sending:**
- **Check**: API key is from correct Resend account
- **Verify**: Domain status is "Verified" in dashboard
- **Test**: Send test email from Resend dashboard

## 🎉 **Benefits of Your Setup**

### **Professional Email Infrastructure:**
- ✅ **Subdomain Separation**: Clean organization
- ✅ **Multiple Purposes**: Different addresses for different functions
- ✅ **Scalable**: Easy to add new email types
- ✅ **Professional**: Branded email addresses
- ✅ **Reliable**: Resend.com infrastructure

### **Best Practices Implemented:**
- ✅ **Domain-based approach**: Not individual email creation
- ✅ **Subdomain isolation**: Separate from main website
- ✅ **Purpose-specific addresses**: Clear email categorization
- ✅ **Professional naming**: Consistent and recognizable

## 📞 **Next Steps**

1. **Add `mail.coolpix.me`** to Resend dashboard
2. **Configure DNS records** with your registrar
3. **Wait for verification** (5-30 minutes)
4. **Test email sending** through your app
5. **Monitor delivery** in Resend dashboard
6. **Add additional email addresses** as needed

Your subdomain email setup will provide a professional, scalable, and reliable email infrastructure for Coolpix.me! 🚀
