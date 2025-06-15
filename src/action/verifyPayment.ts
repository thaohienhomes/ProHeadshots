// app/actions/verifyPayment.ts
'use server'
import { createClient } from "@/utils/supabase/server";
import Stripe from 'stripe';
import { sendSimpleEmail } from "./sendEmail";

export async function verifyPayment(sessionId: string) {
  if (!sessionId) {
    throw new Error('Missing session_id parameter');
  }

  try {
    console.log('Retrieving session:', sessionId);
    
    // Determine if this is a test or live session based on the session ID
    const isTestSession = sessionId.startsWith('cs_test_');
    const isLiveSession = sessionId.startsWith('cs_live_');
    
    console.log('Session ID type:', isTestSession ? 'TEST' : isLiveSession ? 'LIVE' : 'UNKNOWN');
    
    // Use the appropriate Stripe key based on session type
    let stripeKey: string;
    if (isTestSession) {
      stripeKey = process.env.STRIPE_TEST_SECRET_KEY!;
      console.log('Using TEST key');
    } else if (isLiveSession) {
      stripeKey = process.env.STRIPE_SECRET_KEY!;
      console.log('Using LIVE key');
    } else {
      throw new Error(`Invalid session ID format: ${sessionId}`);
    }

    if (!stripeKey) {
      throw new Error(`Missing Stripe ${isTestSession ? 'test' : 'live'} secret key`);
    }

    console.log('Using Stripe key ending in:', stripeKey.slice(-4));
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2025-02-24.acacia',
    });
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('Session retrieved successfully');
    
    // Extract planType from metadata and userId from client_reference_id
    const planType: string | undefined = session.metadata?.planType;
    const userId: string | null = session.client_reference_id;
    
    console.log('Plan Type:', planType);
    console.log('User ID from client_reference_id:', userId);

    if (!userId) {
      throw new Error('Missing user ID in payment session. User ID must be provided as client_reference_id.');
    }

    if (session.payment_status === 'paid') { 
      // Update user's plan in the database
      await updatePlan({ 
        paymentStatus: session.payment_status, 
        amount: session.amount_total ?? 0,
        planType: planType ?? 'default',
        userId: userId
      });
      console.log('Payment successful', session.payment_status);

      // Send admin notification email
      if (process.env.ADMIN_EMAIL) {
        const adminEmailHtml = `
          <h2>🎉 New Payment Received!</h2>
          <p><strong>Payment Details:</strong></p>
          <ul>
            <li><strong>Session ID:</strong> ${sessionId}</li>
            <li><strong>User ID:</strong> ${userId}</li>
            <li><strong>Environment:</strong> ${isTestSession ? 'TEST' : 'LIVE'}</li>
            <li><strong>Amount:</strong> $${((session.amount_total ?? 0) / 100).toFixed(2)} ${session.currency?.toUpperCase()}</li>
            <li><strong>Plan Type:</strong> ${planType || 'default'}</li>
            <li><strong>Customer Email:</strong> ${session.customer_details?.email || 'N/A'}</li>
            <li><strong>Customer Name:</strong> ${session.customer_details?.name || 'N/A'}</li>
            <li><strong>Payment Time:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          <p><strong>Customer Details:</strong></p>
          <ul>
            <li><strong>Phone:</strong> ${session.customer_details?.phone || 'N/A'}</li>
          </ul>
        `;

        try {
          await sendSimpleEmail({
            to: process.env.ADMIN_EMAIL,
            from: process.env.NOREPLY_EMAIL || 'noreply@cvphoto.app',
            subject: `💰 New Payment: $${((session.amount_total ?? 0) / 100).toFixed(2)} - ${planType || 'default'} Plan`,
            html: adminEmailHtml,
          });
          console.log('Admin notification email sent successfully');
        } catch (emailError) {
          console.error('Failed to send admin notification email:', emailError);
          // Don't throw error here to avoid affecting payment verification
        }
      } else {
        console.warn('ADMIN_EMAIL environment variable not set - skipping admin notification');
      }
    }

    return { 
      success: session.payment_status === 'paid', 
      status: session.payment_status,
      details: {
        id: session.id,
        customer: session.customer,
        amount_total: session.amount_total,
        currency: session.currency,
        payment_status: session.payment_status,
      }
    };
  } catch (error) {
    console.error('Error in verifyPayment:', error);
    throw error;
  }
}

async function updatePlan({paymentStatus, amount, planType, userId}: { paymentStatus: string, amount: number, planType: string, userId: string }) {
    const supabase = await createClient();

    const updateObject = { 
        paymentStatus, 
        amount, 
        planType,
        paid_at: new Date().toISOString()
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