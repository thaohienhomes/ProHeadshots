# Custom Domain Setup for ProHeadshots (coolpix.me)

## Step 1: Vercel Domain Configuration

### 1.1 Add Domain in Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your "pro-headshots" project
3. Go to "Settings" → "Domains"
4. Click "Add Domain"
5. Enter: `coolpix.me`
6. Click "Add"
7. Repeat for: `www.coolpix.me`

### 1.2 Get DNS Configuration
After adding the domain, Vercel will show you DNS records to configure:
- **A Record**: `coolpix.me` → `76.76.19.61` (Vercel IP)
- **CNAME Record**: `www.coolpix.me` → `cname.vercel-dns.com`

## Step 2: DNS Configuration

### 2.1 Access Your Domain Provider
1. Log into your domain registrar (where you bought coolpix.me)
2. Find DNS management/DNS settings
3. Look for "Manage DNS" or "DNS Records"

### 2.2 Configure DNS Records
Add these records in your DNS provider:

**A Record:**
- Type: A
- Name: @ (or leave blank for root domain)
- Value: 76.76.19.61
- TTL: 300 (or default)

**CNAME Record:**
- Type: CNAME  
- Name: www
- Value: cname.vercel-dns.com
- TTL: 300 (or default)

**Optional - Redirect www to non-www:**
- Some providers allow automatic www redirect
- Or you can set both to point to Vercel

## Step 3: SSL Certificate

### 3.1 Automatic SSL (Recommended)
- Vercel automatically provisions SSL certificates
- This happens within 24 hours of DNS propagation
- No action required on your part

### 3.2 Verify SSL Status
1. In Vercel dashboard → Domains
2. Check that both domains show "Valid Configuration"
3. SSL certificate status should be "Issued"

## Step 4: Update Environment Variables

### 4.1 Update Site URL
```bash
vercel env rm NEXT_PUBLIC_SITE_URL production
vercel env add NEXT_PUBLIC_SITE_URL production
# Enter: https://coolpix.me
```

### 4.2 Update Monitoring URLs
```bash
# Update uptime monitoring endpoints
vercel env rm UPTIME_CHECK_MAIN_SITE production
vercel env add UPTIME_CHECK_MAIN_SITE production
# Enter: https://coolpix.me

vercel env rm UPTIME_CHECK_API_HEALTH production  
vercel env add UPTIME_CHECK_API_HEALTH production
# Enter: https://coolpix.me/api/monitoring/health
```

## Step 5: Update External Services

### 5.1 Update Google Analytics
1. Go to https://analytics.google.com
2. Navigate to your ProHeadshots property
3. Go to Data Streams → Web Stream
4. Update the website URL to: https://coolpix.me

### 5.2 Update Sentry (if configured)
1. Go to https://sentry.io
2. Navigate to your ProHeadshots project
3. Go to Settings → General
4. Update the project URL to: https://coolpix.me

## Step 6: Deploy and Test

### 6.1 Deploy with New Domain
```bash
vercel --prod
```

### 6.2 Test Domain Configuration
```bash
# Test main domain
curl -I https://coolpix.me

# Test www redirect
curl -I https://www.coolpix.me

# Test health check
curl https://coolpix.me/api/monitoring/health
```

## Troubleshooting

### DNS Propagation
- DNS changes can take 24-48 hours to propagate globally
- Use https://dnschecker.org to check propagation status
- Test with: `nslookup coolpix.me`

### Common Issues
1. **"Domain not found"**: DNS not propagated yet
2. **SSL certificate pending**: Wait up to 24 hours
3. **Redirect loops**: Check DNS configuration
4. **404 errors**: Ensure deployment is complete

### Verification Commands
```bash
# Check DNS resolution
nslookup coolpix.me

# Check SSL certificate
openssl s_client -connect coolpix.me:443 -servername coolpix.me

# Test HTTP to HTTPS redirect
curl -I http://coolpix.me
```

## Expected Timeline
- **DNS Configuration**: 5 minutes
- **DNS Propagation**: 1-24 hours  
- **SSL Certificate**: 1-24 hours after DNS
- **Full Setup**: 24-48 hours maximum

## Benefits of Custom Domain
✅ Professional branding (coolpix.me vs vercel.app)
✅ Better SEO and user trust
✅ Consistent URLs across all services
✅ Custom email addresses possible
✅ Better analytics and tracking
