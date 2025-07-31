# Service Migration Guide

This guide explains how to migrate from Astria AI to Fal AI and from Stripe to Polar Payment in your coolpix.me application.

## Overview

The application now supports multiple service providers:

### AI Services
- **Astria AI** (original) - Custom FLUX API for AI image generation
- **Fal AI** (new) - Modern AI infrastructure with better performance

### Payment Services
- **Stripe** (original) - Traditional payment processing
- **Polar Payment** (new) - Developer-focused payment platform with lower fees

## Quick Migration

Use the migration script to quickly switch between services:

```bash
# Migrate to Fal AI
node scripts/migrate-services.js ai fal

# Migrate to Polar Payment
node scripts/migrate-services.js payment polar

# Validate configuration
node scripts/migrate-services.js validate
```

## Manual Configuration

### Environment Variables

Add these to your `.env.local` file:

```bash
# Service Provider Configuration
AI_PROVIDER=fal              # 'astria' or 'fal'
PAYMENT_PROVIDER=polar       # 'stripe' or 'polar'

# Fal AI Configuration
FAL_AI_API_KEY=your_fal_ai_api_key

# Polar Payment Configuration
POLAR_ACCESS_TOKEN=your_polar_access_token
POLAR_WEBHOOK_SECRET=your_webhook_secret  # Optional
```

### API Keys Setup

#### Fal AI
1. Visit [Fal AI Dashboard](https://fal.ai/dashboard/keys)
2. Create a new API key
3. Add it to your `.env.local` as `FAL_AI_API_KEY`

#### Polar Payment
1. Visit [Polar Dashboard](https://polar.sh/dashboard)
2. Create a new access token
3. Add it to your `.env.local` as `POLAR_ACCESS_TOKEN`

## Service Differences

### AI Services Comparison

| Feature | Astria AI | Fal AI |
|---------|-----------|---------|
| Model Training | Custom LoRA training | Fast LoRA training |
| Image Generation | Batch processing | Real-time generation |
| Webhook Support | Yes | Yes |
| Performance | Good | Excellent |
| Cost | Higher | Lower |

### Payment Services Comparison

| Feature | Stripe | Polar Payment |
|---------|--------|---------------|
| Transaction Fees | 2.9% + 30¢ | 4% + 40¢ |
| Monthly Fees | None | None |
| Developer Experience | Good | Excellent |
| International Support | Excellent | Good |
| Merchant of Record | No | Yes |

## Migration Steps

### 1. Fal AI Migration

#### Prerequisites
- Fal AI account and API key
- Understanding of LoRA model training

#### Steps
1. **Install Dependencies**
   ```bash
   npm install @fal-ai/client
   ```

2. **Configure Environment**
   ```bash
   AI_PROVIDER=fal
   FAL_AI_API_KEY=your_api_key
   ```

3. **Update Image Domains** (already done)
   The `next.config.mjs` has been updated to include Fal AI domains.

4. **Test Integration**
   ```bash
   node scripts/migrate-services.js validate
   ```

#### Key Changes
- **Training**: Uses `fal-ai/flux-lora-fast-training` model
- **Generation**: Uses `fal-ai/flux-lora` for image generation
- **Storage**: Images stored on Fal AI's CDN
- **Webhooks**: New webhook endpoints for Fal AI callbacks

### 2. Polar Payment Migration

#### Prerequisites
- Polar account and access token
- Product setup in Polar dashboard

#### Steps
1. **Install Dependencies**
   ```bash
   npm install @polar-sh/nextjs
   ```

2. **Configure Environment**
   ```bash
   PAYMENT_PROVIDER=polar
   POLAR_ACCESS_TOKEN=your_access_token
   ```

3. **Set Up Products**
   - Create products in Polar dashboard
   - Update `src/app/checkout/pricingPlansPolar.json` with your product IDs

4. **Configure Webhooks**
   - Set webhook URL: `https://yourdomain.com/api/webhooks/polar`
   - Add webhook secret to environment variables

#### Key Changes
- **Checkout**: Uses Polar checkout sessions
- **Verification**: New payment verification flow
- **Webhooks**: Polar webhook handling for order events
- **Metadata**: User ID stored in checkout metadata

## Testing

### AI Service Testing
1. Upload test photos
2. Trigger model training
3. Verify webhook callbacks
4. Check image generation

### Payment Service Testing
1. Create test checkout session
2. Complete test payment
3. Verify webhook processing
4. Check database updates

## Rollback Plan

If you need to rollback to the original services:

```bash
# Rollback to Astria AI
node scripts/migrate-services.js ai astria

# Rollback to Stripe
node scripts/migrate-services.js payment stripe
```

## Troubleshooting

### Common Issues

#### Fal AI Issues
- **Training fails**: Check image URLs are accessible
- **Generation slow**: Reduce batch size in prompts
- **Webhook timeout**: Increase webhook timeout settings

#### Polar Payment Issues
- **Checkout fails**: Verify product IDs in pricing plans
- **Webhook not received**: Check webhook URL and secret
- **Payment not verified**: Ensure metadata includes user_id

### Debug Mode

Enable debug logging:
```bash
DEBUG=true
NODE_ENV=development
```

## Support

- **Fal AI**: [Documentation](https://docs.fal.ai/) | [Discord](https://discord.gg/fal-ai)
- **Polar Payment**: [Documentation](https://docs.polar.sh/) | [Discord](https://dub.sh/polar-discord)

## Migration Checklist

- [ ] Install new dependencies
- [ ] Configure environment variables
- [ ] Set up API keys
- [ ] Update product configurations
- [ ] Test AI training and generation
- [ ] Test payment flow
- [ ] Configure webhooks
- [ ] Update production environment
- [ ] Monitor for issues
- [ ] Update documentation

## Performance Improvements

After migration, you should see:
- **Faster AI processing** with Fal AI
- **Lower payment fees** with Polar (depending on volume)
- **Better developer experience** with both services
- **Improved reliability** and uptime
