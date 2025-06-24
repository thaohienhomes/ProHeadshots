import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

// Environment variables for Supabase and webhook secret
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const appWebhookSecret = process.env.APP_WEBHOOK_SECRET;

// Check for required environment variables
if (!supabaseUrl) {
  throw new Error("MISSING NEXT_PUBLIC_SUPABASE_URL!");
}

if (!supabaseServiceRoleKey) {
  throw new Error("MISSING SUPABASE_SERVICE_ROLE_KEY!");
}

if (!appWebhookSecret) {
  throw new Error("MISSING APP_WEBHOOK_SECRET!");
}

export async function POST(request: Request) {
  // Parse incoming JSON data from Fal AI
  const incomingData = await request.json() as unknown;

  // Extract user_id and webhook_secret from the request URL
  const urlObj = new URL(request.url);
  const user_id = urlObj.searchParams.get("user_id");
  const webhook_secret = urlObj.searchParams.get("webhook_secret");

  // Check for webhook_secret in the URL
  if (!webhook_secret) {
    return NextResponse.json(
      { message: "Malformed URL, no webhook_secret detected!" },
      { status: 400 }
    );
  }

  // Validate the webhook_secret against the stored secret
  if (webhook_secret.toLowerCase() !== appWebhookSecret?.toLowerCase()) {
    return NextResponse.json({ message: "Unauthorized!" }, { status: 401 });
  }

  // Check for user_id in the URL
  if (!user_id) {
    return NextResponse.json(
      { message: "Malformed URL, no user_id detected!" },
      { status: 400 }
    );
  }

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

  // Fetch user data from the custom userTable
  const { data: userData, error: userError } = await supabase
    .from('userTable')
    .select('*')
    .eq('id', user_id)
    .single();

  // Handle errors in fetching user data
  if (userError) {
    console.error({ userError });
    return NextResponse.json(
      {
        message: "Something went wrong!",
      },
      { status: 500 }
    );
  }

  // Check if user exists
  if (!userData) {
    console.log("User not found");
    return NextResponse.json(
      {
        message: "User not found",
      },
      { status: 404 }
    );
  }

  // Get plan limits for validation
  const getPlanLimit = (planType: string): number => {
    switch (planType?.toLowerCase()) {
      case 'basic': return 10;
      case 'professional': return 100;
      case 'executive': return 200;
      default: return 10;
    }
  };

  const allowedPrompts = getPlanLimit(userData.planType);

  // Get the current promptsResult array or initialize it if it doesn't exist
  const currentPromptsResult = Array.isArray(userData.promptsResult) 
    ? userData.promptsResult 
    : [];

  // Add the new prompt result
  const updatedPromptsResult = [...currentPromptsResult];

  try {
    console.log('Incoming Fal AI webhook data:', JSON.stringify(incomingData, null, 2));

    const timestamp = new Date().toISOString();
    const newPromptResult = { timestamp, data: incomingData };

    updatedPromptsResult.push(newPromptResult);

    // Check if we've exceeded the plan limit
    const currentPromptCount = updatedPromptsResult.length;

    if (currentPromptCount > allowedPrompts) {
      return NextResponse.json(
        {
          message: "Prompt limit exceeded for your plan.",
        },
        { status: 403 }
      );
    }

    // Check if this is the last allowed prompt
    const isLastAllowedPrompt = currentPromptCount === allowedPrompts;

    // Prepare the update object
    const updateObject: { promptsResult: any[]; workStatus?: string } = {
      promptsResult: updatedPromptsResult
    };

    // If current workStatus is "ongoing", change it to "complete"
    if (userData.workStatus === 'ongoing') {
      updateObject.workStatus = 'complete';
      console.log("Work status changed from ongoing to complete");
    }

    console.log("updateObject:", JSON.stringify(updateObject, null, 2));

    // Update promptsResult and potentially workStatus in the database
    const { data: userUpdated, error: userUpdatedError } = await supabase
      .from('userTable')
      .update(updateObject)
      .eq('id', user_id);

    // Handle errors in updating user
    if (userUpdatedError) {
      console.error({ userUpdatedError });
      return NextResponse.json(
        {
          message: "Something went wrong!",
        },
        { status: 500 }
      );
    }

    // Log success response
    console.log("Success response:", { message: "success", userId: user_id, userUpdated, isLastAllowedPrompt });
    
    return NextResponse.json(
      {
        message: `Fal AI Webhook Callback Success! User ID: ${user_id}, User Updated: ${userUpdated ? 'Yes' : 'No'}, Last Allowed Prompt: ${isLastAllowedPrompt}`,
      },
      { status: 200, statusText: "Success" }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        message: "Something went wrong!",
      },
      { status: 500 }
    );
  }
}
