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
  const next = searchParams.get("next");

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
    <div className="flex h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800">
      <LeftAuth />
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-12 relative">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-400/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-primary-500/5 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 p-8 rounded-2xl shadow-2xl">
            {/* Dynamic Header */}
            <h2 className="text-3xl font-bold text-white mb-2 text-center">
              {currentMode === "login" ? "Welcome back!" : "Join CVPHOTO"}
            </h2>
            <p className="text-navy-300 mb-8 text-center">
              {next?.includes('checkout')
                ? "Please sign in to complete your purchase"
                : currentMode === "login"
                ? "Sign in to generate AI headshots"
                : "Create your account to get started with AI headshots."}
            </p>

            {/* Email/Password Form */}
            <form className="animate-in flex-1 flex flex-col w-full justify-center gap-4 text-white">
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
              {/* Hidden field to preserve next parameter */}
              {next && <input type="hidden" name="next" value={next} />}
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
              <p className="mt-4 p-4 bg-red-500/20 text-red-400 text-center rounded-lg border border-red-500/30 backdrop-blur-sm">
                {message}
              </p>
            )}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-cyan-400/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-navy-800/50 text-navy-300">or</span>
              </div>
            </div>

            {/* Google Sign In Button - Now outside the main form */}
            <GoogleSignInButton />

            {/* Toggle link at bottom */}
            <p className="text-sm text-navy-300 text-center mt-6">
              {currentMode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleModeSwitch("signup")}
                    className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors"
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
                    className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors"
                  >
                    Sign In
                  </button>
                </>
              )}
            </p>

            {/* Terms and conditions for signup */}
            {currentMode === "signup" && (
              <p className="text-xs text-navy-400 text-center mt-4">
                By registering, you agree to the CVPHOTO{" "}
                <Link
                  href="/terms"
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
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
