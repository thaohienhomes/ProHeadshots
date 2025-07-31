"use client";

import LoginButton from "./LoginButton";
import Link from "next/link";
import NewsBadge from "./NewsBadge";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Logo from "./Logo";
import CoolPixLogo from "./CoolPixLogo";
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    <div className="sticky top-0 z-50 w-full bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 border-b border-cyan-400/10">
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
      <header className="flex h-16 w-full items-center justify-between px-section max-w-section mx-auto">
        {backDashboard ? (
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-lg hover:border-cyan-400/40 hover:bg-navy-700/50 transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        ) : (
          !userAuth && (
            <nav className="hidden lg:flex items-center gap-6">
              <div className="relative">
                <button
                  className="flex items-center gap-1 text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors duration-300"
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  Free Tools
                  <svg className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div
                    className="absolute left-0 top-full mt-2 w-56 bg-navy-800/95 backdrop-blur-sm border border-cyan-400/20 rounded-lg shadow-xl z-50 animate-in fade-in-0 zoom-in-95 duration-200"
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <div className="py-2">
                      <a
                        href="https://www.linkedin.com/help/linkedin/answer/430/profile-photo-tips"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-2 text-sm text-slate-300 hover:text-cyan-400 hover:bg-navy-700/50 transition-all duration-200"
                      >
                        LinkedIn Optimizer
                      </a>
                      <a
                        href="https://www.indeed.com/career-advice/resumes-cover-letters/resume-photo"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-2 text-sm text-slate-300 hover:text-cyan-400 hover:bg-navy-700/50 transition-all duration-200"
                      >
                        Resume Builder
                      </a>
                      <Link
                        href="/jobs"
                        className="block px-4 py-2 text-sm text-slate-300 hover:text-cyan-400 hover:bg-navy-700/50 transition-all duration-200"
                      >
                        Job Finder
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              <div className="w-px h-4 bg-slate-600" />
              <NewsBadge />
            </nav>
          )
        )}

        <Link
          className="flex items-center absolute left-1/2 transform -translate-x-1/2 group"
          href="/"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-primary-500/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <CoolPixLogo
                variant="horizontal"
                theme="dark"
                size="sm"
                effects="shimmer"
                animated={true}
                className="transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>
          <span className="sr-only">coolpix - AI Headshot Studio</span>
        </Link>

        {userAuth ? (
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="px-4 py-2 text-sm font-medium text-white bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-lg hover:border-cyan-400/40 hover:bg-navy-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        ) : (
          <div className="ml-auto flex items-center gap-3">
            <LoginButton href="/auth" tracker="header_loginCTA_click" />
          </div>
        )}
      </header>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"></div>
    </div>
  );
}
