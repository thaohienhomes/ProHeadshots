"use client";

import LoginButton from "./LoginButton";
import Link from "next/link";
import NewsBadge from "./NewsBadge";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Logo from "./Logo";
import { useState, useEffect } from "react";

interface HeaderProps {
  userAuth?: boolean;
  backDashboard?: boolean;
}

export default function Header({
  userAuth = false,
  backDashboard = false,
}: HeaderProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  // Auto-dismiss error message after 5 seconds
  useEffect(() => {
    if (signOutError) {
      const timer = setTimeout(() => {
        setSignOutError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [signOutError]);

  // Check if Supabase is configured
  const hasSupabaseConfig =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = hasSupabaseConfig
    ? createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
    : null;

  const handleSignOut = async () => {
    if (!supabase) return;

    setIsSigningOut(true);
    setSignOutError(null); // Clear any previous errors

    try {
      console.log("🔓 Attempting to sign out user");

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("❌ Sign out error:", error);
        setIsSigningOut(false);
        setSignOutError(error.message);
        return;
      }

      console.log("✅ Sign out successful, redirecting to login");
      router.push("/auth");
    } catch (error) {
      console.error("❌ Unexpected error during sign out:", error);
      setIsSigningOut(false);
      setSignOutError(
        "An unexpected error occurred during sign out. Please try again."
      );
    }
  };

  return (
    <div className="sticky top-0 z-50 w-full bg-mainBlack">
      {signOutError && (
        <div className="absolute top-12 right-4 z-60 p-3 bg-red-100 border border-red-200 text-red-700 text-sm rounded-md shadow-lg max-w-sm">
          <div className="flex items-start justify-between">
            <span>{signOutError}</span>
            <button
              onClick={() => setSignOutError(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <header className="flex h-12 w-full items-center justify-between px-section max-w-section mx-auto">
        {backDashboard ? (
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-mainWhite bg-opacity-20 bg-mainWhite rounded hover:bg-opacity-30 transition-colors"
          >
            Back to Dashboard
          </Link>
        ) : (
          !userAuth && (
            <nav className="hidden sm:flex items-center gap-4 sm:gap-6 md:gap-8">
              <NewsBadge />
            </nav>
          )
        )}

        <Link
          className="flex items-center absolute left-1/2 transform -translate-x-1/2"
          href="/"
        >
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Logo className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
            <span className="font-sans font-light tracking-wider text-mainWhite text-base sm:text-lg md:text-xl uppercase">
              cvphoto
            </span>
          </div>
          <span className="sr-only">CVPHOTO - AI Headshot Studio</span>
        </Link>

        {userAuth ? (
          <div className="ml-auto">
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="px-3 py-1.5 text-sm font-medium text-mainWhite opacity-70 hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity border border-mainWhite border-opacity-30 rounded-md"
            >
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        ) : (
          <div className="ml-auto">
            <LoginButton href="/auth" tracker="header_loginCTA_click" />
          </div>
        )}
      </header>
      <div className="h-px w-full bg-mainWhite opacity-20"></div>
    </div>
  );
}
