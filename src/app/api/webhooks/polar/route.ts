import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { verifyPolarWebhook, extractPlanTypeFromProductId } from "@/utils/polarPayment";
import { sendSimpleEmail } from "@/action/sendEmail";

export const dynamic = "force-dynamic";

// Environment variables for Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const polarWebhookSecret = process.env.POLAR_WEBHOOK_SECRET;

// Check for required environment variables
if (!supabaseUrl) {
  throw new Error("MISSING NEXT_PUBLIC_SUPABASE_URL!");
}

if (!supabaseServiceRoleKey) {
  throw new Error("MISSING SUPABASE_SERVICE_ROLE_KEY!");
}

export async function POST(request: Request) {
  try {
    // Get the raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get("polar-signature") || "";

    // Verify webhook signature if secret is configured
    if (polarWebhookSecret && !verifyPolarWebhook(body, signature, polarWebhookSecret)) {
      console.error("Invalid Polar webhook signature");
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse the webhook payload
    const webhookData = JSON.parse(body);
    console.log("Polar webhook received:", webhookData.type);

    // Create a Supabase client
    const supabase = createClient(
      supabaseUrl as string,
      supabaseServiceRoleKey as string,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    );

    // Handle different webhook events
    switch (webhookData.type) {
      case "checkout.created":
        console.log("Checkout created:", webhookData.data.id);
        break;

      case "checkout.updated":
        console.log("Checkout updated:", webhookData.data.id);
        break;

      case "order.created":
        await handleOrderCreated(webhookData.data, supabase);
        break;

      case "subscription.created":
        await handleSubscriptionCreated(webhookData.data, supabase);
        break;

      case "subscription.updated":
        await handleSubscriptionUpdated(webhookData.data, supabase);
        break;

      default:
        console.log("Unhandled Polar webhook event:", webhookData.type);
    }

    return NextResponse.json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Error processing Polar webhook:", error);
    return NextResponse.json(
      { message: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleOrderCreated(orderData: any, supabase: any) {
  console.log("Processing order created:", orderData.id);

  // Extract user ID from metadata
  const userId = orderData.metadata?.user_id;
  if (!userId) {
    console.error("No user_id found in order metadata");
    return;
  }

  // Extract plan type from product ID
  const planType = extractPlanTypeFromProductId(orderData.product_id);

  // Update user's payment status in the database
  const updateObject = {
    paymentStatus: "paid",
    amount: orderData.amount,
    planType: planType,
    paid_at: new Date().toISOString(),
    polarOrderId: orderData.id,
    polarCheckoutId: orderData.checkout_id,
  };

  const { data, error } = await supabase
    .from("userTable")
    .update(updateObject)
    .eq("id", userId)
    .select();

  if (error) {
    console.error("Error updating user payment status:", error);
    throw error;
  }

  console.log("User payment status updated successfully:", data);

  // Send admin notification email
  if (process.env.ADMIN_EMAIL) {
    const adminEmailHtml = `
      <h2>New Order via Polar Webhook</h2>
      <p><strong>Order ID:</strong> ${orderData.id}</p>
      <p><strong>Plan:</strong> ${planType}</p>
      <p><strong>Amount:</strong> $${(orderData.amount / 100).toFixed(2)}</p>
      <p><strong>User ID:</strong> ${userId}</p>
      <p><strong>Customer Email:</strong> ${orderData.customer_email || 'N/A'}</p>
      <p><strong>Product ID:</strong> ${orderData.product_id}</p>
    `;

    try {
      await sendSimpleEmail({
        to: process.env.ADMIN_EMAIL,
        from: process.env.NOREPLY_EMAIL || 'noreply@cvphoto.app',
        subject: `💰 New Polar Order: $${(orderData.amount / 100).toFixed(2)} - ${planType} Plan`,
        html: adminEmailHtml,
      });
      console.log('Admin notification email sent successfully');
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError);
    }
  }
}

async function handleSubscriptionCreated(subscriptionData: any, supabase: any) {
  console.log("Processing subscription created:", subscriptionData.id);
  
  // Handle subscription creation if needed
  // This would be used for recurring billing scenarios
}

async function handleSubscriptionUpdated(subscriptionData: any, supabase: any) {
  console.log("Processing subscription updated:", subscriptionData.id);
  
  // Handle subscription updates (cancellation, renewal, etc.)
  // This would be used for recurring billing scenarios
}
