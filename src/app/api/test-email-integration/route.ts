import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerEmail, planType, amount, orderId } = body;

    // Simulate order confirmation email data
    const emailData = {
      to: customerEmail || 'test@gmail.com',
      from: 'noreply@coolpix.me',
      subject: `Order Confirmation - ${planType || 'Basic'} Plan`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Thank you for your order!</h1>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">Order Details</h2>
            <p><strong>Plan:</strong> ${planType || 'Basic'} Plan</p>
            <p><strong>Amount:</strong> $${((amount || 2900) / 100).toFixed(2)}</p>
            <p><strong>Order ID:</strong> ${orderId || 'test-order-123'}</p>
            <p><strong>Email:</strong> ${customerEmail || 'test@gmail.com'}</p>
          </div>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2d5a2d; margin-top: 0;">What's Next?</h3>
            <p>Your payment has been processed successfully. You can now:</p>
            <ul>
              <li>Upload your photos to start creating headshots</li>
              <li>Access your dashboard to manage your account</li>
              <li>Contact support if you have any questions</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://coolpix.me/forms" 
               style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Start Creating Headshots
            </a>
          </div>
          
          <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px; color: #666; font-size: 14px;">
            <p>This email was sent from Coolpix.me - Professional AI Headshots</p>
            <p>If you have any questions, please contact us at support@coolpix.me</p>
          </div>
        </div>
      `
    };

    // Test email configuration
    const isEmailConfigured = () => {
      const apiKey = process.env.RESEND_API_KEY;
      return apiKey && apiKey !== 'YOUR_RESEND_API_KEY' && apiKey.startsWith('re_');
    };

    if (!isEmailConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'Email service not configured',
        emailData: emailData,
        message: 'RESEND_API_KEY not properly configured'
      });
    }

    // Import Resend dynamically to avoid server-side import issues
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY as string);

    // Send the email
    const emailResult = await resend.emails.send(emailData);

    return NextResponse.json({
      success: true,
      message: 'Order confirmation email sent successfully',
      emailResult: emailResult,
      emailData: {
        to: emailData.to,
        subject: emailData.subject,
        from: emailData.from
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Email integration test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Test email configuration
  const isEmailConfigured = () => {
    const apiKey = process.env.RESEND_API_KEY;
    return apiKey && apiKey !== 'YOUR_RESEND_API_KEY' && apiKey.startsWith('re_');
  };

  return NextResponse.json({
    message: 'Email integration test endpoint - use POST to test email sending',
    configuration: {
      emailConfigured: isEmailConfigured(),
      environment: process.env.NODE_ENV || 'development',
      fromDomain: 'coolpix.me'
    },
    testPayload: {
      customerEmail: 'test@gmail.com',
      planType: 'Basic',
      amount: 2900,
      orderId: 'test-order-123'
    }
  });
}
