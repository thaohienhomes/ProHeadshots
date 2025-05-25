// app/actions/verifyPayment.ts
'use server'
import { createClient } from "@/utils/supabase/server";
import Stripe from 'stripe';

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
    
    // Extract planType from metadata
    const planType: string | undefined = session.metadata?.planType;
    console.log('Plan Type:', planType);

    if (session.payment_status === 'paid') { 
      // Update user's plan in the database
      await updatePlan({ 
        paymentStatus: session.payment_status, 
        amount: session.amount_total ?? 0,
        planType: planType ?? 'default'
      });
      console.log('Payment successful', session.payment_status);
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

async function updatePlan({paymentStatus, amount, planType}: { paymentStatus: string, amount: number, planType: string }) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("User not authenticated");
    }

    const updateObject = { 
        paymentStatus, 
        amount, 
        planType,
        paid_at: new Date().toISOString()
    };  

    const { data, error } = await supabase
      .from("userTable")
      .update(updateObject)
      .eq('id', user.id)
      .select();

    if (error) {
        console.error("Error updating plan:", error);
        throw error;
    }

    return data;
}