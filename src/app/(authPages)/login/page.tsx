import React from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AuthError } from "@supabase/supabase-js";
import { PasswordInput, EmailInput, AuthButton } from "@/components/AuthForm";
import getUser from "@/action/getUser";
import LeftAuth from "@/components/LeftAuth";

interface LoginProps {
  searchParams: { message: string };
}

const handleRedirectBasedOnWorkStatus = (user: any): never => {
  if (!user.paymentStatus || user.paymentStatus === "NULL") {
    return redirect("/forms");
  }

  const workStatus = (user.workStatus || "").toLowerCase();
  switch (workStatus) {
    case "":
    case "null":
      return redirect("/upload/intro");
    case "ongoing":
      return redirect("/wait");
    case "completed":
    case "complete":
      return redirect("/dashboard");
    default:
      return redirect("/forms");
  }
};

export default async function Login({ searchParams }: LoginProps) {
  // Check if user is logged in
  const userData: any = await getUser();
  const user = userData?.[0];

  // Only redirect if a user is found
  if (user) {
    return handleRedirectBasedOnWorkStatus(user);
  }

  // If no user is found, continue with the login page rendering

  const signIn = async (formData: FormData): Promise<never> => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(
        "error name: ",
        error.name,
        "error code: ",
        error.code,
        "error message: ",
        error.message
      );

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

      return redirect(`/login?message=${encodeURIComponent(errorMessage)}`);
    } else {
      // Fetch user data after successful sign-in using getUser function
      const userData: any = await getUser();
      const user = userData[0];

      if (user) {
        const workStatus = user?.workStatus || "";

        // Use the same function for post-signin redirect
        return handleRedirectBasedOnWorkStatus(user);
      }
      // If we can't get user data, redirect to forms as a fallback
      return redirect("/forms");
    }
  };

  return (
    <div className="flex h-screen">
      <LeftAuth />
      <div className="w-full md:w-1/2 bg-mainWhite flex items-center justify-center p-4 md:p-12">
        <div className="w-full max-w-md">
          <div className="bg-[#FCFBF7] p-8 rounded-lg border border-gray-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
            <h2 className="text-3xl font-bold text-mainBlack mb-2 text-center">
              Welcome back!
            </h2>
            <p className="text-gray-600 mb-8 text-center">
              Sign in to your account
            </p>

            <form className="animate-in flex-1 flex flex-col w-full justify-center gap-3 text-mainBlack">
              <EmailInput
                label="Email"
                name="email"
                placeholder="you@example.com"
                type="email"
              />
              <PasswordInput
                label="Password"
                name="password"
                placeholder="••••••••"
                type="password"
              />
              <AuthButton formAction={signIn} pendingText="Signing In...">
                Sign In
              </AuthButton>

              {searchParams?.message && (
                <p className="mt-4 p-4 bg-red-50 text-red-600 text-center rounded-md border border-red-100">
                  {searchParams.message}
                </p>
              )}

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm"></div>
              </div>

              <p className="text-sm text-gray-600 text-center mt-4">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-mainBlack font-semibold hover:text-gray-700 transition-colors"
                >
                  Sign Up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
