// app/actions/verifyPaymentPolar.ts
'use server'
import { createClient } from "@/utils/supabase/server";
import {
  getPolarCheckoutSession,
  getPolarOrder,
  extractPlanTypeFromProductId
} from "@/utils/polarPayment";
import { sendSimpleEmail } from "./sendEmail";
import { logger } from "@/utils/logger";

export async function verifyPaymentPolar(checkoutId: string) {
  if (!checkoutId) {
    throw new Error('Missing checkout_id parameter');
  }

  try {
    console.log('Retrieving Polar checkout session:', checkoutId);
    
    // Get the checkout session from Polar
    const checkoutSession = await getPolarCheckoutSession(checkoutId);
    console.log('Checkout session retrieved successfully');
    
    // Extract plan type from product ID
    const planType = extractPlanTypeFromProductId(checkoutSession.product_id);
    const customerEmail = checkoutSession.customer_email;
    const customerName = checkoutSession.customer_name;
    
    console.log('Plan Type:', planType);
    console.log('Customer Email:', customerEmail);
    console.log('Customer Name:', customerName);

    // Get user ID from metadata (should be set when creating checkout)
    const userId = checkoutSession.metadata?.user_id;
    
    if (!userId) {
      throw new Error('Missing user ID in checkout session metadata. User ID must be provided when creating checkout.');
    }

    // Initialize order details variables
    let orderAmount = 0;
    let orderId = '';

    if (checkoutSession.status === 'complete') {
      // For completed checkouts, we might need to get the order details
      try {
        // Try to get order details if available
        if (checkoutSession.metadata?.order_id) {
          const order = await getPolarOrder(checkoutSession.metadata.order_id);
          orderAmount = order.amount;
          orderId = order.id;
        }
      } catch (orderError) {
        console.warn('Could not retrieve order details:', orderError);
        // Continue without order details
      }
      
      // Update user's plan in the database
      await updatePlan({ 
        paymentStatus: 'paid', 
        amount: orderAmount,
        planType: planType,
        userId: userId,
        checkoutId: checkoutId,
        orderId: orderId,
      });

      // Send admin notification email if configured
      if (process.env.ADMIN_EMAIL) {
        const adminEmailHtml = `
          <h2>New Payment Received via Polar</h2>
          <p><strong>Plan:</strong> ${planType}</p>
          <p><strong>Amount:</strong> $${(orderAmount / 100).toFixed(2)}</p>
          <p><strong>Checkout ID:</strong> ${checkoutId}</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>User ID:</strong> ${userId}</p>
          <p><strong>Customer Email:</strong> ${customerEmail || 'N/A'}</p>
          <p><strong>Customer Name:</strong> ${customerName || 'N/A'}</p>
        `;

        try {
          await sendSimpleEmail({
            to: process.env.ADMIN_EMAIL,
            from: process.env.NOREPLY_EMAIL || 'noreply@cvphoto.app',
            subject: `💰 New Polar Payment: $${(orderAmount / 100).toFixed(2)} - ${planType} Plan`,
            html: adminEmailHtml,
          });
          logger.info('Admin notification email sent successfully', 'PAYMENT', {
            amount: orderAmount / 100,
            planType,
            userId: userId
          });
        } catch (emailError) {
          logger.error('Failed to send admin notification email', emailError as Error, 'PAYMENT', {
            amount: orderAmount / 100,
            planType,
            userId: userId
          });
          // Don't throw error here to avoid affecting payment verification
        }
      } else {
        logger.warn('ADMIN_EMAIL environment variable not set - skipping admin notification', 'PAYMENT');
      }
    }

    return { 
      success: checkoutSession.status === 'complete', 
      status: checkoutSession.status,
      details: {
        id: checkoutSession.id,
        customer_email: checkoutSession.customer_email,
        customer_name: checkoutSession.customer_name,
        product_id: checkoutSession.product_id,
        amount: orderAmount || 0,
        currency: 'USD', // Polar typically uses USD
        payment_status: checkoutSession.status,
      }
    };
  } catch (error) {
    console.error('Error in verifyPaymentPolar:', error);
    throw error;
  }
}

async function updatePlan({
  paymentStatus, 
  amount, 
  planType, 
  userId, 
  checkoutId, 
  orderId
}: { 
  paymentStatus: string;
  amount: number;
  planType: string;
  userId: string;
  checkoutId: string;
  orderId: string;
}) {
  const supabase = await createClient();

  const updateObject = { 
    paymentStatus, 
    amount, 
    planType,
    paid_at: new Date().toISOString(),
    // Store Polar-specific payment details
    polarCheckoutId: checkoutId,
    polarOrderId: orderId,
  };  

  const { data, error } = await supabase
    .from("userTable")
    .update(updateObject)
    .eq('id', userId)
    .select();

  if (error) {
    console.error("Error updating plan:", error);
    throw error;
  }

  return data;
}
