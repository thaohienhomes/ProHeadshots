"use client";

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function DevOAuthRedirectContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get the OAuth code from the URL
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (code) {
      // Redirect to local development server with the OAuth code
      const localUrl = `http://localhost:3002/auth/callback?code=${code}${state ? `&state=${state}` : ''}`;
      console.log('Redirecting to local development server:', localUrl);
      window.location.href = localUrl;
    } else if (error) {
      // Redirect to local development server with error
      const localUrl = `http://localhost:3002/auth?message=${encodeURIComponent(error)}`;
      console.log('Redirecting to local development server with error:', localUrl);
      window.location.href = localUrl;
    } else {
      // No code or error, redirect to local auth page
      const localUrl = 'http://localhost:3002/auth';
      console.log('No OAuth code found, redirecting to local auth page:', localUrl);
      window.location.href = localUrl;
    }
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Redirecting to Development Server</h2>
        <p className="text-gray-600">Please wait while we redirect you to your local development environment...</p>
      </div>
    </div>
  );
}

export default function DevOAuthRedirect() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DevOAuthRedirectContent />
    </Suspense>
  )
}
