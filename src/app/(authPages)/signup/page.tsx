import React from "react";
import { createClient } from "@/utils/supabase/server";
import { PasswordInput, EmailInput, AuthButton } from "@/components/AuthForm";
import LeftAuth from "@/components/LeftAuth";
import Link from "next/link";
import { signUp } from "@/action/signup";

interface SignupProps {
  searchParams: { message: string };
}

export default async function Signup({ searchParams }: SignupProps) {
  const {
    data: { user },
  } = await createClient().auth.getUser();

  return (
    <div className="flex h-screen">
      <LeftAuth />
      <div className="w-full md:w-1/2 bg-mainWhite flex items-center justify-center p-4 md:p-12">
        <div className="w-full max-w-md">
          <div className="bg-[#FCFBF7] p-8 rounded-lg border border-gray-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
            <h2 className="text-3xl font-bold text-mainBlack mb-2 text-center">
              Sign Up
            </h2>
            <p className="text-gray-600 mb-8 text-center">
              Create your account to get started.
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
              <AuthButton formAction={signUp} pendingText="Signing Up...">
                Sign Up
              </AuthButton>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm"></div>
              </div>

              {searchParams?.message && (
                <p className="mt-4 p-4 bg-red-50 text-red-600 text-center rounded-md border border-red-100">
                  {searchParams.message}
                </p>
              )}
              <p className="text-sm text-gray-600 text-center mt-4">
                Already a member?{" "}
                <Link
                  href="/login"
                  className="text-mainBlack font-semibold hover:text-gray-700 transition-colors"
                >
                  Sign In
                </Link>
              </p>
              <p className="text-xs text-gray-500 text-center mt-4">
                By registering, you agree to the CVPHOTO{" "}
                <Link
                  href="/terms"
                  className="text-mainBlack hover:text-gray-700 transition-colors"
                >
                  Terms of service.
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
