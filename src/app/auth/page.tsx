"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { PasswordInput, EmailInput, AuthButton } from "@/components/AuthForm";
import LeftAuth from "@/components/LeftAuth";
import { signInAction, signUpAction } from "@/action/auth";
import GoogleSignInButton from "@/components/GoogleSignInButton";

function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const message = searchParams.get("message");
  const modeParam = searchParams.get("mode");

  // Determine mode from URL parameter, default to login
  const mode = modeParam === "signup" ? "signup" : "login";
  const [localMode, setLocalMode] = useState<"login" | "signup">(mode);

  // Update local mode when URL changes
  useEffect(() => {
    if (modeParam === "signup") {
      setLocalMode("signup");
    } else if (modeParam === "login") {
      setLocalMode("login");
    }
  }, [modeParam]);

  // Use localMode for the UI, but respect URL parameter
  const currentMode = modeParam ? mode : localMode;

  // Function to handle mode switching with navigation
  const handleModeSwitch = (newMode: "login" | "signup") => {
    setLocalMode(newMode);
    // Clear URL parameters when manually switching modes
    router.push("/auth");
  };

  return (
    <div className="flex h-screen">
      <LeftAuth />
      <div className="w-full md:w-1/2 bg-mainWhite flex items-center justify-center p-4 md:p-12">
        <div className="w-full max-w-md">
          <div className="bg-[#FCFBF7] p-8 rounded-lg border border-gray-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
            {/* Dynamic Header */}
            <h2 className="text-3xl font-bold text-mainBlack mb-2 text-center">
              {currentMode === "login" ? "Welcome back!" : "Sign Up"}
            </h2>
            <p className="text-gray-600 mb-8 text-center">
              {currentMode === "login"
                ? "Sign in to your account"
                : "Create your account to get started."}
            </p>

            {/* Email/Password Form */}
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
              <AuthButton
                formAction={
                  currentMode === "login" ? signInAction : signUpAction
                }
                pendingText={
                  currentMode === "login" ? "Signing In..." : "Signing Up..."
                }
              >
                {currentMode === "login" ? "Sign In" : "Sign Up"}
              </AuthButton>
            </form>

            {message && (
              <p className="mt-4 p-4 bg-red-50 text-red-600 text-center rounded-md border border-red-100">
                {message}
              </p>
            )}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#FCFBF7] text-gray-500">or</span>
              </div>
            </div>

            {/* Google Sign In Button - Now outside the main form */}
            <GoogleSignInButton />

            {/* Toggle link at bottom */}
            <p className="text-sm text-gray-600 text-center mt-4">
              {currentMode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleModeSwitch("signup")}
                    className="text-mainBlack font-semibold hover:text-gray-700 transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already a member?{" "}
                  <button
                    type="button"
                    onClick={() => handleModeSwitch("login")}
                    className="text-mainBlack font-semibold hover:text-gray-700 transition-colors"
                  >
                    Sign In
                  </button>
                </>
              )}
            </p>

            {/* Terms and conditions for signup */}
            {currentMode === "signup" && (
              <p className="text-xs text-gray-500 text-center mt-4">
                By registering, you agree to the CVPHOTO{" "}
                <Link
                  href="/terms"
                  className="text-mainBlack hover:text-gray-700 transition-colors"
                >
                  Terms of service.
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Auth() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}
