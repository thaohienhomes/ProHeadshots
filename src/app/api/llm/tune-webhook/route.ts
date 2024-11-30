import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createPrompt } from "../prompt/createPrompt";

export const dynamic = "force-dynamic";

// Environment variables for Supabase and webhook secret1
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // Supabase URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Supabase service role key
const appWebhookSecret = process.env.APP_WEBHOOK_SECRET; // Webhook secret for authentication

// Check for required environment variables
if (!supabaseUrl) {
  throw new Error("MISSING NEXT_PUBLIC_SUPABASE_URL!"); // Error if Supabase URL is missing
}

if (!supabaseServiceRoleKey) {
  throw new Error("MISSING SUPABASE_SERVICE_ROLE_KEY!"); // Error if service role key is missing
}

if (!appWebhookSecret) {
  throw new Error("MISSING APP_WEBHOOK_SECRET!"); // Error if webhook secret is missing
}

export async function POST(request: Request) {
  // Define the structure of incoming tune data
  type TuneData = {
    id: number | string;
    title: string;
    name: string;
    steps: null;
    trained_at: null;
    started_training_at: null;
    created_at: string;
    updated_at: string;
    expires_at: null;
  };

  // Parse incoming JSON data
  const incomingData = (await request.json()) as { tune: TuneData };
  const { tune } = incomingData;

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

  // Create a Supabase admin client
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

  // Fetch user from userTable by ID using admin access
  const { data: userData, error } = await supabase
    .from('userTable')
    .select()
    .eq('id', user_id)
    .single();

  // Handle errors in fetching user
  if (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      {
        message: "Error fetching user data",
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

  try {
    // Update model status in the database
    const { data: modelUpdated, error: modelUpdatedError } = await supabase
      .from("userTable")
      .update({
        tuneStatus: "completed",
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

    // Call createPrompt function
    console.log("Attempting to create prompts...");
    const promptResults = await createPrompt([userData]);

    if ('error' in promptResults && promptResults.error) {
      console.error("Error creating prompts:", promptResults.message);
      return NextResponse.json(
        {
          message: "Error creating prompts",
        },
        { status: 500 }
      );
    }

    console.log("Prompts created successfully:", promptResults);

    // Log success response
    console.log("Success response:", { message: "success", userId: userData.id, modelUpdated, promptResults });
    return NextResponse.json(
      {
        message: `Webhook Callback Success! User ID: ${userData.id}, Model Updated: ${modelUpdated ? 'Yes' : 'No'}, Prompts Created: ${promptResults}`,
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