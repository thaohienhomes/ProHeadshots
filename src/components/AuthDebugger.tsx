"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

interface AuthDebuggerProps {
  showDetails?: boolean;
}

export default function AuthDebugger({ showDetails = false }: AuthDebuggerProps) {
  const [authState, setAuthState] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const checkAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          setError(`Session error: ${sessionError.message}`);
        } else {
          setSession(session);
        }

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          setError(`User error: ${userError.message}`);
        } else {
          setAuthState({
            user,
            isAuthenticated: !!user,
            email: user?.email,
            id: user?.id,
            lastSignIn: user?.last_sign_in_at,
          });
        }
      } catch (err) {
        setError(`Unexpected error: ${err}`);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      setSession(session);
      setAuthState({
        user: session?.user,
        isAuthenticated: !!session?.user,
        email: session?.user?.email,
        id: session?.user?.id,
        lastSignIn: session?.user?.last_sign_in_at,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!showDetails && process.env.NODE_ENV === 'production') {
    return null;
  }

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-xs">
        Checking auth...
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 p-3 bg-navy-800/90 border border-cyan-400/20 rounded-lg text-xs max-w-sm">
      <div className="font-semibold text-cyan-400 mb-2">Auth Debug</div>
      
      {error && (
        <div className="text-red-400 mb-2">
          ❌ {error}
        </div>
      )}
      
      <div className="space-y-1 text-white">
        <div>Status: {authState?.isAuthenticated ? '✅ Authenticated' : '❌ Not authenticated'}</div>
        {authState?.email && <div>Email: {authState.email}</div>}
        {authState?.id && <div>ID: {authState.id.substring(0, 8)}...</div>}
        <div>Session: {session ? '✅ Active' : '❌ None'}</div>
        {session?.expires_at && (
          <div>Expires: {new Date(session.expires_at * 1000).toLocaleTimeString()}</div>
        )}
      </div>
      
      {showDetails && (
        <details className="mt-2">
          <summary className="cursor-pointer text-cyan-400">Raw Data</summary>
          <pre className="mt-1 text-xs overflow-auto max-h-32">
            {JSON.stringify({ authState, session }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
