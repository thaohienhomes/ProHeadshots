import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Extract UTM source from the URL query parameters
  const { searchParams } = new URL(request.url);
  const utmSource = searchParams.get('utm_source');

  // Update the user session using Supabase functionality
  let response = await updateSession(request);

  // If a UTM source is present in the URL
  if (utmSource) {
    // If updateSession didn't return a response, create a new one
    if (!response) {
      response = NextResponse.next();
    }
    
    // Set the UTM source as a cookie
    response.cookies.set('utm_source', utmSource, { 
      maxAge: 30 * 24 * 60 * 60, // Cookie expires after 30 days
      path: '/', // Cookie is available across the entire site
      httpOnly: false, // Cookie is accessible by client-side scripts
    });
  }

  return response;
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Run on all routes except static files, images, and favicons
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};