'use server'

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AuthError } from "@supabase/supabase-js";
import { sendWelcomeEmail } from "./emailActions";
import { trackConversion } from "@/utils/analytics";

async function sendWelcomeEmailToUser(email: string, firstName: string = 'there') {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://coolpix.me'}/dashboard`;

  return await sendWelcomeEmail({
    firstName,
    email,
    dashboardUrl
  });
}

export async function signInWithGoogleAction(): Promise<never> {
  const supabase = await createClient();

  // Get the redirect URL - prioritize development localhost
  const getRedirectUrl = () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const isDevelopment = (process.env.NODE_ENV as string) === 'development' || (process.env.ENVIRONMENT as string) === 'DEVELOPMENT';

    console.log('🔍 OAuth redirect URL debug:', {
      siteUrl,
      nodeEnv: process.env.NODE_ENV,
      environment: process.env.ENVIRONMENT,
      isDevelopment
    });

    // For development, ALWAYS use localhost regardless of Supabase configuration
    if (isDevelopment) {
      const redirectUrl = `${siteUrl || 'http://localhost:3000'}/auth/callback`;
      console.log('🔄 Development redirect URL (FORCED):', redirectUrl);
      return redirectUrl;
    }

    // For production, use the site URL or fallback to production domain
    if (siteUrl && !siteUrl.includes('localhost')) {
      const redirectUrl = `${siteUrl}/auth/callback`;
      console.log('🚀 Production redirect URL:', redirectUrl);
      return redirectUrl;
    }

    // Fallback: use production domain
    const fallbackUrl = 'https://coolpix.me/auth/callback';
    console.log('⚠️ Fallback redirect URL:', fallbackUrl);
    return fallbackUrl;
  };

  const redirectUrl = getRedirectUrl();
  console.log('🔐 Starting Google OAuth with redirect URL:', redirectUrl);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: false,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  console.log('📊 OAuth response:', {
    hasData: !!data,
    hasUrl: !!data?.url,
    hasError: !!error,
    errorMessage: error?.message
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
  const next = formData.get("next") as string;

  if (!email || !password) {
    const nextParam = next ? `&next=${encodeURIComponent(next)}` : '';
    return redirect(
      `/auth?message=${encodeURIComponent(
        "Please enter both email and password"
      )}${nextParam}`
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

    const nextParam = next ? `&next=${encodeURIComponent(next)}` : '';
    return redirect(`/auth?message=${encodeURIComponent(errorMessage)}${nextParam}`);
  }

  // Check if user has completed onboarding and redirect accordingly
  const { data: userData } = await supabase
    .from('userTable')
    .select('paymentStatus, workStatus')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  // If there's a next URL and user has paid, honor it
  if (next && userData?.paymentStatus && userData.paymentStatus !== "NULL") {
    return redirect(next);
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
    // Track signup conversion for analytics and affiliate attribution
    try {
      await trackConversion(
        'signup',
        undefined, // No monetary value for signup
        signUpData.user.id,
        undefined, // No session ID for signup
        {
          email: email,
          signupMethod: 'email',
          timestamp: new Date().toISOString()
        }
      );
    } catch (conversionError) {
      console.error('Failed to track signup conversion:', conversionError);
      // Don't fail the signup if conversion tracking fails
    }

    // Send welcome email
    try {
      await sendWelcomeEmailToUser(email);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the signup if email fails
    }
    return redirect("/forms?signupCompleted");
  }

  return redirect(`/auth?message=${encodeURIComponent("Something went wrong during signup. Please try again.")}&mode=signup`);
} 