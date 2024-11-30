// app/actions/verifyPayment.ts
'use server'
import { createClient } from "@/utils/supabase/server";
import Stripe from 'stripe';

const stripeKey = process.env.ENVIRONMENT === 'DEVELOPMENT' 
  ? process.env.STRIPE_TEST_SECRET_KEY! 
  : process.env.STRIPE_SECRET_KEY!;

const stripe = new Stripe(stripeKey, {
  apiVersion: '2024-06-20',
});

export async function verifyPayment(sessionId: string) {
  if (!sessionId) {
    throw new Error('Missing session_id parameter');
  }

  try {
    console.log('Retrieving session:', sessionId);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('Session retrieved:', session);
    // Extract planType from metadata
    const planType: string | undefined = session.metadata?.planType;

    // Console log the planType
    console.log('Plan Type:', planType);

    if (session.payment_status === 'paid') { 
      // Update user's plan in the database
      await updatePlan({ 
        paymentStatus: session.payment_status, 
        amount: session.amount_total ?? 0,
        planType: planType ?? 'default' // Pass planType to updatePlan
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
    const supabase = createClient();
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