// app/actions/verifyPaymentPolar.ts
'use server'
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { paymentAnalytics } from "@/utils/paymentAnalytics";
import {
  getPolarCheckoutSession,
  getPolarOrder,
  extractPlanTypeFromProductId
} from "@/utils/polarPayment";
import { sendSimpleEmail } from "./sendEmail";
import { logger } from "@/utils/logger";
import { trackConversion } from "@/utils/analytics";

// Simple in-memory cache to prevent duplicate API calls
const paymentCache = new Map<string, { result: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

export async function verifyPaymentPolar(checkoutId: string) {
  console.log('🔍 Starting Polar payment verification for checkout ID:', checkoutId);

  // Track verification started
  await paymentAnalytics.trackEvent({
    event_type: 'verification_started',
    checkout_id: checkoutId,
    metadata: { timestamp: new Date().toISOString() }
  });

  if (!checkoutId) {
    console.error('❌ Missing checkout_id parameter');
    throw new Error('Missing checkout_id parameter');
  }

  // Check cache first
  const cached = paymentCache.get(checkoutId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('📋 Using cached payment result for checkout:', checkoutId);
    return cached.result;
  }

  try {
    console.log('📡 Retrieving Polar checkout session:', checkoutId);

    // Get the checkout session from Polar
    const checkoutSession = await getPolarCheckoutSession(checkoutId);
    console.log('✅ Checkout session retrieved successfully:', {
      id: checkoutSession.id,
      status: checkoutSession.status,
      product_id: checkoutSession.product_id,
      customer_email: checkoutSession.customer_email
    });
    
    // Extract plan type from product ID
    const planType = extractPlanTypeFromProductId(checkoutSession.product_id);
    const customerEmail = checkoutSession.customer_email;
    const customerName = checkoutSession.customer_name;
    
    console.log('Plan Type:', planType);
    console.log('Customer Email:', customerEmail);
    console.log('Customer Name:', customerName);

    // Get user ID from metadata (should be set when creating checkout)
    let userId = checkoutSession.metadata?.user_id;

    // In development with mock sessions, try to get the current user if no user ID in metadata
    if (!userId && process.env.NODE_ENV === 'development' && checkoutId.startsWith('mock_checkout_')) {
      console.log('🧪 Development mode: Mock checkout without user ID, attempting to get current user');

      try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (user && !error) {
          userId = user.id;
          console.log('✅ Found current authenticated user for mock checkout:', userId);
        } else {
          console.log('⚠️ No authenticated user found, using mock user ID');
          userId = '00000000-0000-0000-0000-000000000001'; // Use proper UUID format for testing
        }
      } catch (authError) {
        console.log('⚠️ Error getting current user, using mock user ID:', authError);
        userId = '00000000-0000-0000-0000-000000000001'; // Use proper UUID format for testing
      }
    }

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

      // In development with mock checkout, skip database update to avoid RLS issues
      if (process.env.NODE_ENV === 'development' && checkoutId.startsWith('mock_checkout_')) {
        console.log('🧪 Development mode: Skipping database update for mock checkout');
        console.log('✅ Mock payment verification completed successfully');
      } else {
        // Update user's plan in the database for real payments
        console.log('💾 Updating user plan in database:', {
          userId,
          planType,
          amount: orderAmount,
          checkoutId
        });

        await updatePlan({
          paymentStatus: 'paid',
          amount: orderAmount,
          planType: planType,
          userId: userId,
          checkoutId: checkoutId,
          orderId: orderId,
          customerEmail: customerEmail,
          customerName: customerName,
        });

        console.log('✅ User plan updated successfully');
      }

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

    const result = {
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

    // Cache the result
    paymentCache.set(checkoutId, { result, timestamp: Date.now() });

    // Track verification completed
    await paymentAnalytics.trackEvent({
      event_type: 'verification_completed',
      checkout_id: checkoutId,
      user_id: userId,
      plan_type: planType,
      amount: orderAmount ? orderAmount / 100 : undefined,
      metadata: {
        success: result.success,
        status: checkoutSession.status,
        timestamp: new Date().toISOString()
      }
    });

    return result;
  } catch (error) {
    console.error('❌ Error in verifyPaymentPolar:', error);

    // Track verification error
    await paymentAnalytics.trackEvent({
      event_type: 'verification_completed',
      checkout_id: checkoutId,
      error_message: error instanceof Error ? error.message : 'Unknown error',
      metadata: {
        success: false,
        error_type: error instanceof Error ? error.constructor.name : 'Unknown',
        timestamp: new Date().toISOString()
      }
    });

    // Provide more helpful error messages for common issues
    if (error instanceof Error) {
      if (error.message.includes('POLAR_ACCESS_TOKEN is not configured')) {
        throw new Error('Payment verification is not properly configured. Please contact support.');
      } else if (error.message.includes('Checkout session not found')) {
        throw new Error('This payment session was not found or has expired. Please try creating a new payment.');
      } else if (error.message.includes('Authentication failed')) {
        throw new Error('Payment verification failed due to configuration issues. Please contact support.');
      } else if (error.message.includes('Request timed out')) {
        throw new Error('Payment verification timed out. Please try again in a moment.');
      } else if (error.message.includes('Missing user ID')) {
        throw new Error('Payment session is missing required user information. Please try creating a new payment.');
      }
    }

    // For any other errors, provide a generic message
    throw new Error('Payment verification failed. Please try again or contact support if the issue persists.');
  }
}

async function updatePlan({
  paymentStatus,
  amount,
  planType,
  userId,
  checkoutId,
  orderId,
  customerEmail,
  customerName
}: {
  paymentStatus: string;
  amount: number;
  planType: string;
  userId: string;
  checkoutId: string;
  orderId: string;
  customerEmail?: string;
  customerName?: string;
}) {
  // Use service client for payment operations to bypass RLS
  const supabase = createServiceClient();

  const updateObject = {
    paymentStatus,
    amount,
    planType,
    paid_at: new Date().toISOString(),
    // Store Polar-specific payment details
    polarCheckoutId: checkoutId,
    polarOrderId: orderId,
  };

  console.log('📝 Attempting to update user plan with data:', updateObject);

  // First, check if the user exists in the userTable
  const { data: existingUser, error: checkError } = await supabase
    .from("userTable")
    .select('id, email')
    .eq('id', userId)
    .single();

  if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
    console.error("❌ Error checking user existence:", checkError);
    throw checkError;
  }

  if (!existingUser) {
    console.log('⚠️ User not found in userTable, attempting to create user record');

    // In development with mock checkout, create a test user record
    if (process.env.NODE_ENV === 'development' && checkoutId.startsWith('mock_checkout_')) {
      console.log('🧪 Development mode: Creating test user record for mock checkout');

      const { data: newUser, error: createError } = await supabase
        .from("userTable")
        .insert({
          id: userId,
          email: 'test@coolpix.me',
          name: 'Test User',
          created_at: new Date().toISOString(),
          ...updateObject
        })
        .select();

      if (createError) {
        console.error("❌ Error creating test user record:", createError);
        throw createError;
      }

      console.log('✅ Test user record created successfully:', newUser);
      return newUser;
    }

    // For production or real users, try to get user info from auth first
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (user && !authError) {
      // Create user record using authenticated user info
      const { data: newUser, error: createError } = await supabase
        .from("userTable")
        .insert({
          id: userId,
          email: user.email,
          ...updateObject
        })
        .select();

      if (createError) {
        console.error("❌ Error creating user record:", createError);
        throw createError;
      }

      console.log('✅ User record created successfully:', newUser);
      return newUser;
    } else {
      console.log("⚠️ No authenticated user found, attempting to create user record with checkout session data");

      // Try to create user record using checkout session data
      // This can happen when users complete payment but aren't logged in during verification
      const { data: newUser, error: createError } = await supabase
        .from("userTable")
        .insert({
          id: userId,
          email: customerEmail || 'unknown@coolpix.me', // Use customer email from checkout
          name: customerName || null, // Use customer name from checkout
          ...updateObject
        })
        .select();

      if (createError) {
        console.error("❌ Error creating user record with checkout data:", createError);
        throw createError;
      }

      console.log('✅ User record created successfully with checkout data:', newUser);
      return newUser;
    }
  }

  // Update existing user
  const { data, error } = await supabase
    .from("userTable")
    .update(updateObject)
    .eq('id', userId)
    .select();

  if (error) {
    console.error("❌ Error updating user plan:", error);
    throw error;
  }

  console.log('✅ User plan updated successfully:', data);

  // Track conversion for analytics and affiliate attribution
  try {
    await trackConversion(
      'payment',
      amount / 100, // Convert cents to dollars
      userId,
      checkoutId,
      {
        orderId: orderId,
        currency: 'USD', // Polar typically uses USD
        planType: planType,
        customerEmail: customerEmail,
        paymentMethod: 'polar',
        transactionId: orderId,
        checkoutId: checkoutId
      }
    );
    console.log('✅ Conversion tracking completed for Polar payment');
  } catch (conversionError) {
    console.error('❌ Failed to track conversion:', conversionError);
    // Don't fail the payment verification if conversion tracking fails
  }

  return data;
}
