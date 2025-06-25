# DNS Configuration Guide for coolpix.me

## Current Status
✅ Domain already added to pro-headshots project in Vercel
✅ Both coolpix.me and www.coolpix.me are configured
⚠️  DNS records need to be configured with your domain registrar

## Step 1: Find Your Domain Registrar
Your domain `coolpix.me` is registered with a third-party provider.
Common registrars include:
- Namecheap
- GoDaddy  
- Cloudflare
- Google Domains
- Porkbun

## Step 2: Access DNS Management
1. Login to your domain registrar's website
2. Find your domain: coolpix.me
3. Look for "DNS Management", "DNS Settings", or "Nameservers"
4. Choose "Custom DNS" or "Advanced DNS"

## Step 3: Configure DNS Records

### Delete Existing Records (if any)
- Remove any existing A records for @ (root)
- Remove any existing A records for www
- Remove any existing CNAME records for www

### Add New Records

**A Record for Root Domain:**
- Type: A
- Name: @ (or leave blank for root domain)
- Value: 76.76.19.61
- TTL: 300 (or Auto/Default)

**CNAME Record for www:**
- Type: CNAME
- Name: www
- Value: cname.vercel-dns.com
- TTL: 300 (or Auto/Default)

## Step 4: Verify Configuration
After saving the DNS records, you can verify:

```bash
# Check A record
nslookup coolpix.me

# Check CNAME record  
nslookup www.coolpix.me
```

## Step 5: Wait for Propagation
- DNS changes take 1-24 hours to propagate globally
- You can check propagation status at: https://dnschecker.org
- Enter: coolpix.me

## Step 6: Verify SSL Certificate
Once DNS propagates, Vercel will automatically:
- Issue SSL certificate
- Enable HTTPS
- Set up redirects

## Troubleshooting

### If DNS doesn't propagate:
1. Double-check the IP address: 76.76.19.61
2. Ensure TTL is set to 300 or lower
3. Clear your local DNS cache
4. Try from different networks/devices

### If SSL certificate doesn't issue:
1. Wait 24 hours after DNS propagation
2. Check Vercel dashboard for certificate status
3. Contact Vercel support if needed

## Expected Timeline
- DNS Configuration: 5 minutes
- DNS Propagation: 1-24 hours
- SSL Certificate: 1-24 hours after DNS
- Full Setup: 24-48 hours maximum

## Verification Commands
```bash
# Test when ready
curl -I https://coolpix.me
curl -I https://www.coolpix.me
curl https://coolpix.me/api/monitoring/health
```
