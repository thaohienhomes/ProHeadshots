# ProHeadshots Email Templates Setup Guide

This guide explains how to set up and use the comprehensive email template system for ProHeadshots using SendGrid.

## 📧 Email Templates Overview

The ProHeadshots application includes 8 professional email templates:

1. **Welcome Email** - New user onboarding
2. **Order Confirmation** - Purchase confirmation
3. **Processing Started** - AI generation started notification
4. **Processing Complete** - Headshots ready for download
5. **Payment Confirmation** - Payment receipt and confirmation
6. **Password Reset** - Secure password reset
7. **Promotional** - Marketing campaigns and offers
8. **Support Response** - Customer service responses

## 🚀 Quick Setup

### 1. SendGrid Configuration

First, ensure your SendGrid API key is configured:

```bash
# In your .env file
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
NOREPLY_EMAIL=noreply@coolpix.me
ADMIN_EMAIL=admin@coolpix.me
```

### 2. Create SendGrid Templates

You need to create templates in your SendGrid account and update the template IDs in `src/utils/emailTemplates.ts`:

```typescript
export const SENDGRID_TEMPLATE_IDS = {
  welcome: 'd-your_welcome_template_id',
  order_confirmation: 'd-your_order_confirmation_template_id',
  processing_started: 'd-your_processing_started_template_id',
  processing_complete: 'd-your_processing_complete_template_id',
  payment_confirmation: 'd-your_payment_confirmation_template_id',
  password_reset: 'd-your_password_reset_template_id',
  promotional: 'd-your_promotional_template_id',
  support_response: 'd-your_support_response_template_id'
} as const;
```

### 3. Upload HTML Templates to SendGrid

Use the HTML files in `src/templates/email/` as the basis for your SendGrid templates:

- `welcome.html` → Welcome template
- `order-confirmation.html` → Order confirmation template
- `processing-started.html` → Processing started template
- `processing-complete.html` → Processing complete template
- `payment-confirmation.html` → Payment confirmation template
- `password-reset.html` → Password reset template
- `promotional.html` → Promotional template
- `support-response.html` → Support response template

## 📝 Template Variables

Each template uses Handlebars syntax for dynamic content. Here are the variables for each template:

### Welcome Email
```typescript
{
  firstName: string;
  dashboardUrl: string;
}
```

### Order Confirmation
```typescript
{
  firstName: string;
  orderId: string;
  planName: string;
  amount: number;
  currency: string;
  orderDate: string;
  dashboardUrl: string;
}
```

### Processing Started
```typescript
{
  firstName: string;
  estimatedTime: string;
  dashboardUrl: string;
  supportUrl: string;
}
```

### Processing Complete
```typescript
{
  firstName: string;
  downloadUrl: string;
  dashboardUrl: string;
  imageCount: number;
  expiryDate: string;
}
```

### Payment Confirmation
```typescript
{
  firstName: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  receiptUrl: string;
  dashboardUrl: string;
}
```

### Password Reset
```typescript
{
  firstName: string;
  resetUrl: string;
  expiryTime: string;
}
```

### Promotional
```typescript
{
  firstName: string;
  offerTitle: string;
  offerDescription: string;
  discountCode?: string;
  ctaUrl: string;
  expiryDate?: string;
}
```

### Support Response
```typescript
{
  firstName: string;
  ticketId: string;
  subject: string;
  responseMessage: string;
  dashboardUrl: string;
}
```

## 🔧 Usage Examples

### Basic Email Sending

```typescript
import { sendWelcomeEmail } from '@/utils/emailTemplates';

// Send welcome email
await sendWelcomeEmail({
  firstName: 'John',
  email: 'john@example.com',
  dashboardUrl: 'https://coolpix.me/dashboard'
});
```

### Workflow Integration

```typescript
import { handlePolarPaymentSuccess } from '@/utils/emailWorkflowIntegration';

// Handle payment success workflow
await handlePolarPaymentSuccess({
  userId: 'user123',
  email: 'john@example.com',
  firstName: 'John',
  orderId: 'order456',
  planName: 'Professional Package',
  amount: 29.99,
  currency: 'USD',
  paymentMethod: 'Credit Card',
  transactionId: 'txn789'
});
```

### Scheduled Emails

```typescript
import { sendScheduledProcessingCompleteEmail } from '@/utils/emailTemplates';

// Schedule email to be sent in 2 hours
await sendScheduledProcessingCompleteEmail(
  'user@example.com',
  7200 // 2 hours in seconds
);
```

## 🎨 Customization

### Branding
All templates use the ProHeadshots brand colors and styling:
- Primary: `#667eea` to `#764ba2` (gradient)
- Success: `#10b981` to `#059669` (gradient)
- Warning: `#f59e0b` to `#d97706` (gradient)
- Error: `#ef4444` to `#dc2626` (gradient)

### Responsive Design
All templates are fully responsive and tested across major email clients:
- Gmail
- Outlook
- Apple Mail
- Yahoo Mail
- Mobile devices

### Dark Mode Support
Templates include proper contrast ratios and fallback colors for dark mode email clients.

## 🔗 Integration Points

### Polar Payment Integration
```typescript
// In your Polar webhook handler
import { handlePolarPaymentSuccess } from '@/utils/emailWorkflowIntegration';

export async function POST(request: Request) {
  // ... webhook verification ...
  
  if (event.type === 'checkout.completed') {
    await handlePolarPaymentSuccess({
      // ... payment data ...
    });
  }
}
```

### Fal AI Integration
```typescript
// In your Fal AI webhook handlers
import { 
  handleFalAIProcessingStarted,
  handleFalAIProcessingCompleted 
} from '@/utils/emailWorkflowIntegration';

// When processing starts
await handleFalAIProcessingStarted({
  userId,
  email,
  firstName,
  requestId
});

// When processing completes
await handleFalAIProcessingCompleted({
  userId,
  email,
  firstName,
  requestId,
  imageCount,
  downloadUrls
});
```

## 📊 Analytics & Tracking

### Email Engagement Tracking
SendGrid automatically tracks:
- Open rates
- Click rates
- Bounce rates
- Unsubscribe rates

### Custom Event Tracking
```typescript
// Track email events in your analytics
logger.info('Email sent successfully', 'EMAIL_ANALYTICS', {
  templateType: 'welcome',
  userId,
  email,
  timestamp: new Date().toISOString()
});
```

## 🛡️ Security & Compliance

### Data Privacy
- All templates comply with GDPR requirements
- Unsubscribe links included in promotional emails
- Personal data handling follows privacy policy

### Email Authentication
- SPF records configured
- DKIM signing enabled
- DMARC policy implemented

## 🧪 Testing

### Template Testing
```typescript
import { validateEmailData } from '@/utils/emailTemplates';

// Validate template data before sending
const isValid = validateEmailData('welcome', {
  firstName: 'John',
  email: 'john@example.com',
  dashboardUrl: 'https://coolpix.me/dashboard'
});
```

### Preview Templates
Use SendGrid's preview feature to test templates across different email clients before going live.

## 📈 Performance Optimization

### Email Delivery
- Templates optimized for fast loading
- Images hosted on CDN
- Minimal CSS for better compatibility

### Rate Limiting
- Built-in rate limiting to prevent spam
- Queue system for bulk emails
- Retry logic for failed sends

## 🆘 Troubleshooting

### Common Issues

1. **Template not found**: Check SendGrid template IDs
2. **Variables not rendering**: Verify Handlebars syntax
3. **Emails not sending**: Check SendGrid API key and quotas
4. **Styling issues**: Test across different email clients

### Debug Mode
```typescript
// Enable debug logging
process.env.EMAIL_DEBUG = 'true';
```

## 📞 Support

For issues with email templates:
1. Check SendGrid dashboard for delivery status
2. Review application logs for errors
3. Test templates in SendGrid preview
4. Contact support at support@coolpix.me
