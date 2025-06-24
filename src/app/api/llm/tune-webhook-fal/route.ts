import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createPromptFal } from "../prompt/createPromptFal";

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
  // Define the structure of incoming Fal AI webhook data
  type FalAIWebhookData = {
    request_id: string;
    status: "completed" | "failed" | "in_progress";
    result?: {
      diffusers_lora_file: {
        url: string;
        file_name: string;
        file_size: number;
      };
      config_file: {
        url: string;
        file_name: string;
        file_size: number;
      };
    };
    error?: string;
  };

  // Parse incoming JSON data
  const incomingData = (await request.json()) as FalAIWebhookData;

  // Extract user_id and webhook_secret from the request URL
  const urlObj = new URL(request.url);
  const user_id = urlObj.searchParams.get("user_id");
  const webhook_secret = urlObj.searchParams.get("webhook_secret");

  // Check for webhook_secret in the URL
  if (!webhook_secret) {
    return NextResponse.json(
      {
        message: "Malformed URL, no webhook_secret detected!",
      },
      { status: 500 }
    );
  }

  // Validate the webhook_secret against the stored secret
  if (webhook_secret.toLowerCase() !== appWebhookSecret?.toLowerCase()) {
    return NextResponse.json(
      {
        message: "Unauthorized!",
      },
      { status: 401 }
    );
  }

  // Check for user_id in the URL
  if (!user_id) {
    return NextResponse.json(
      {
        message: "Malformed URL, no user_id detected!",
      },
      { status: 500 }
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
    .from("userTable")
    .select("*")
    .eq("id", user_id)
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

  // Only process completed training
  if (incomingData.status !== "completed") {
    console.log(`Training not completed yet. Status: ${incomingData.status}`);
    return NextResponse.json(
      {
        message: `Training status: ${incomingData.status}`,
      },
      { status: 200 }
    );
  }

  // Check if training failed
  if (incomingData.status === "failed") {
    console.error("Training failed:", incomingData.error);
    
    // Update tune status to failed
    await supabase
      .from("userTable")
      .update({
        tuneStatus: "failed",
      })
      .eq("id", user_id);

    return NextResponse.json(
      {
        message: "Training failed",
        error: incomingData.error,
      },
      { status: 500 }
    );
  }

  try {
    // Update apiStatus with the training result
    const updatedApiStatus = {
      ...userData.apiStatus,
      status: "completed",
      result: incomingData.result,
      lora_url: incomingData.result?.diffusers_lora_file?.url,
      completed_at: new Date().toISOString(),
    };

    // Update model status in the database
    const { data: modelUpdated, error: modelUpdatedError } = await supabase
      .from("userTable")
      .update({
        tuneStatus: "completed",
        apiStatus: updatedApiStatus,
      })
      .eq("id", user_id)
      .select();

    // Handle errors in updating model
    if (modelUpdatedError) {
      console.error({ modelUpdatedError });
      return NextResponse.json(
        {
          message: "Something went wrong!",
        },
        { status: 500 }
      );
    }

    // Check if model was updated
    if (!modelUpdated) {
      console.error("No model updated!");
      console.error({ modelUpdated });
    }

    // Log the user object received from Supabase
    console.log("User received from Supabase:", [userData]);

    // Now that tune training is complete, create the prompts
    console.log("Fal AI tune training completed, starting prompt creation...");
    try {
      const promptResults = await createPromptFal([{ ...userData, apiStatus: updatedApiStatus }]);
      if ('error' in promptResults && promptResults.error) {
        console.error("Error creating prompts:", promptResults.message);
        // Don't fail the webhook, just log the error
      } else {
        console.log('Prompts initiated successfully after Fal AI tune completion');
      }
    } catch (promptError) {
      console.error("Error initiating prompts:", promptError);
      // Don't fail the webhook
    }

    // Log success response
    console.log("Success response:", { message: "success", userId: userData.id, modelUpdated });
    return NextResponse.json(
      {
        message: `Webhook Callback Success! User ID: ${userData.id}, Model Updated: ${modelUpdated ? 'Yes' : 'No'}, Fal AI Tune Training Complete`,
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
