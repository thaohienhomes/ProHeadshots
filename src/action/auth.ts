'use server'

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AuthError } from "@supabase/supabase-js";
import { sendEmail } from "./sendEmail";

async function sendWelcomeEmail(email: string) {
  return await sendEmail({
    to: email,
    from: process.env.NOREPLY_EMAIL || 'noreply@cvphoto.app',
    templateId: 'd-def6b236e0a64721a3420e36b19cd379',
  });
}

export async function signInWithGoogleAction(): Promise<never> {
  const supabase = await createClient();

  // Get the redirect URL - prioritize production domain over localhost
  const getRedirectUrl = () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    
    // If we're in development, use localhost
    if ((process.env.NODE_ENV as string) === 'development' || (process.env.NODE_ENV as string) === 'DEVELOPMENT') {
      return `${siteUrl || 'http://localhost:3000'}/auth/callback`;
    }
    
    // For production, never use localhost
    if (siteUrl && !siteUrl.includes('localhost')) {
      return `${siteUrl}/auth/callback`;
    }
    
    // Fallback: construct from environment or use your known domain
    // Replace 'cvphoto.app' with your actual domain
    return 'https://cvphoto.app/auth/callback';
  };

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getRedirectUrl(),
    },
  });

  if (error) {
    console.error('Google OAuth error:', error);
    return redirect(`/auth?message=${encodeURIComponent(error.message)}`);
  }

  if (data.url) {
    return redirect(data.url);
  }

  return redirect('/auth?message=Failed to initialize Google sign-in');
}

export async function signInAction(formData: FormData): Promise<never> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return redirect(
      `/auth?message=${encodeURIComponent(
        "Please enter both email and password"
      )}`
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    let errorMessage = "Could not authenticate user";

    if (error instanceof AuthError) {
      switch (error.code) {
        case "invalid_login_credentials":
          errorMessage = "Invalid email or password. Please try again.";
          break;
        case "invalid_email":
          errorMessage = "Please enter a valid email address.";
          break;
        case "too_many_requests":
          errorMessage = "Too many login attempts. Please try again later.";
          break;
        default:
          errorMessage = error.message;
      }
    } else {
      errorMessage = `Unexpected error: ${error}`;
    }

    return redirect(`/auth?message=${encodeURIComponent(errorMessage)}`);
  }

  return redirect("/dashboard");
}

export async function signUpAction(formData: FormData): Promise<never> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  if (!email || !password) {
    return redirect(
      `/auth?message=${encodeURIComponent(
        "Please enter both email and password"
      )}&mode=signup`
    );
  }

  const supabase = await createClient();

  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    let errorMessage = "An error occurred during signup.";
    if (error instanceof AuthError) {
      switch (error.status) {
        case 400:
          errorMessage = "Invalid email or password format.";
          break;
        case 422:
          errorMessage = "Email already in use.";
          break;
        default:
          errorMessage = error.message;
      }
    }
    return redirect(`/auth?message=${encodeURIComponent(errorMessage)}&mode=signup`);
  }

  if (signUpData.user) {
    // Send welcome email
    await sendWelcomeEmail(email);
    return redirect("/forms?signupCompleted");
  }

  return redirect(`/auth?message=${encodeURIComponent("Something went wrong during signup. Please try again.")}&mode=signup`);
} 