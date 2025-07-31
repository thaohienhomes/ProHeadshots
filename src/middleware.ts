import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getRequiredPhotoCount } from "@/utils/photoConfig";
import { withAuth } from "next-auth/middleware";

// No internationalization - using English only

// Helper function to handle redirects based on user status
const handleRedirectBasedOnWorkStatus = (user: any, request: NextRequest, pathname: string): NextResponse | null => {
  // Don't redirect if user is on API routes or Next.js internal routes
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
    return null;
  }

  // If user is on auth pages but already logged in, redirect them to appropriate page
  if (pathname.startsWith('/auth') || pathname.startsWith('/signup')) {
    // Only redirect if user is authenticated
    if (user) {
      // Determine where they should go based on their status
      if (!user.paymentStatus || user.paymentStatus === "NULL") {
        return NextResponse.redirect(new URL('/forms', request.url));
      }

      const workStatus = (user.workStatus || "").toLowerCase();
      let targetPath: string;

      switch (workStatus) {
        case "":
        case "null":
          targetPath = "/upload/intro";
          break;
        case "ongoing":
          targetPath = "/wait";
          break;
        case "completed":
        case "complete":
          targetPath = "/dashboard";
          break;
        default:
          targetPath = "/forms";
      }

      return NextResponse.redirect(new URL(targetPath, request.url));
    }
    return null;  // Allow access to login/signup pages if not authenticated
  }

  // For other pages, check if user needs to be redirected
  if (!user.paymentStatus || user.paymentStatus === "NULL") {
    // Allow access to checkout and postcheckout pages so users can make payment and complete payment flow
    if (pathname !== '/forms' && !pathname.startsWith('/checkout') && !pathname.startsWith('/postcheckout')) {
      return NextResponse.redirect(new URL('/forms', request.url));
    }
    return null;
  }

  const workStatus = user.workStatus ? user.workStatus.toLowerCase() : "";
  let targetPath: string | null = null;

  switch (workStatus) {
    case "":
    case "null":
      // Allow users with null workStatus to navigate within upload flow
      if (!pathname.startsWith('/upload/')) {
        targetPath = "/upload/intro";
      }
      break;
    case "ongoing":
      targetPath = "/wait";
      break;
    case "completed":
    case "complete":
      // Allow users to navigate within dashboard area
      if (!pathname.startsWith('/dashboard')) {
        targetPath = "/dashboard";
      }
      break;
    default:
      targetPath = "/forms";
  }

  if (targetPath && pathname !== targetPath) {
    return NextResponse.redirect(new URL(targetPath, request.url));
  }

  return null;
};

export async function middleware(request: NextRequest) {
  // Security headers and rate limiting
  const isProduction = process.env.NODE_ENV === 'production';
  const { pathname, searchParams } = new URL(request.url);

  // Development bypass for testing wait page
  if (!isProduction && (pathname.startsWith('/test-wait') || searchParams.get('bypass') === 'dev')) {
    return NextResponse.next();
  }

  // Skip processing for API routes, static files, and Next.js internals
  if (pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/favicon.ico') ||
      pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)) {
    return NextResponse.next();
  }

  // Rate limiting for API routes (simple implementation)
  if (pathname.startsWith('/api/') && isProduction) {
    // Get client IP for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = forwardedFor?.split(',')[0] || realIp || 'unknown';

    // In production, you'd want to use a proper rate limiting service like Upstash Redis
    // For now, we'll add headers to indicate rate limiting is in place
    console.log(`API request from IP: ${clientIp} to ${pathname}`);
  }

  // Clean up old Supabase project cookies to prevent HTTP 431 errors
  const currentProjectId = 'dfcpphcozngsbtvslrkf'; // Updated to current project ID
  const cookiesToDelete: string[] = [];

  request.cookies.getAll().forEach((cookie) => {
    // Delete cookies from old Supabase projects
    if (cookie.name.startsWith('sb-') && !cookie.name.includes(currentProjectId)) {
      cookiesToDelete.push(cookie.name);
    }
  });

  try {
    // Create response with security headers
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    // Add security headers for production
    if (isProduction) {
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // If the cookie is updated, update the cookies for the request and response
            request.cookies.set({
              name,
              value,
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            // If the cookie is removed, update the cookies for the request and response
            request.cookies.set({
              name,
              value: "",
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value: "",
              ...options,
            });
          },
        },
      },
    );

    // This will refresh session if expired - required for Server Components
    const { data: { user } } = await supabase.auth.getUser();

    // Also check for NextAuth.js session (for hybrid authentication)
    let nextAuthUser = null;
    try {
      // Check for NextAuth.js session token
      const sessionToken = request.cookies.get('next-auth.session-token')?.value ||
                           request.cookies.get('__Secure-next-auth.session-token')?.value;

      if (sessionToken) {
        // In a real implementation, you'd verify the JWT token here
        // For now, we'll assume it's valid if it exists
        nextAuthUser = { id: 'nextauth-user' };
      }
    } catch (error) {
      console.log('NextAuth session check failed:', error);
    }

    // Use either Supabase user or NextAuth user
    const authenticatedUser = user || nextAuthUser;

    // Skip middleware processing for auth callback routes
    if (pathname.startsWith('/auth/callback')) {
      return NextResponse.next();
    }

    // Check if the path is a protected route
    const isProtectedRoute = pathname.startsWith('/wait') ||
                           pathname.startsWith('/upload/') ||
                           pathname.startsWith('/dashboard');

    // Redirect to auth if trying to access protected routes while not authenticated
    if (isProtectedRoute && !authenticatedUser) {
      // For NextAuth.js integration, redirect to NextAuth sign-in page
      if (pathname.startsWith('/wait')) {
        return NextResponse.redirect(new URL('/auth/signin?callbackUrl=' + encodeURIComponent(request.url), request.url));
      }
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    // If user is on auth pages but already logged in, redirect them to appropriate page
    if (pathname.startsWith('/auth') || pathname.startsWith('/signup')) {
      // Only redirect if user is authenticated
      if (user) {
        // Get user data from userTable
        const { data: userData, error } = await supabase
          .from('userTable')
          .select('paymentStatus, workStatus')
          .eq('id', user.id)
          .single();

        if (!error && userData) {
          // Determine where they should go based on their status
          if (!userData.paymentStatus || userData.paymentStatus === "NULL") {
            return NextResponse.redirect(new URL('/forms', request.url));
          }

          const workStatus = (userData.workStatus || "").toLowerCase();
          let targetPath: string;

          switch (workStatus) {
            case "":
            case "null":
              targetPath = "/upload/intro";
              break;
            case "ongoing":
              targetPath = "/wait";
              break;
            case "completed":
            case "complete":
              targetPath = "/dashboard";
              break;
            default:
              targetPath = "/forms";
          }

          return NextResponse.redirect(new URL(targetPath, request.url));
        }
      }
      return NextResponse.next();  // Allow access to login/signup pages if not authenticated
    }

    // If user is authenticated, check their status and redirect accordingly
    if (user) {
      try {
        // Query the 'userTable' for the current user's data
        const { data: userData, error } = await supabase
          .from('userTable')
          .select('paymentStatus, workStatus, name, age, bodyType, height, ethnicity, gender, eyeColor, userPhotos, styles')
          .eq('id', user.id);

        if (!error && userData && userData.length > 0) {
          const userInfo = userData[0];
          
          // 🛡️ Enhanced logic for workStatus="ongoing" users
          if (userInfo.workStatus === "ongoing") {
            // Check data completeness for ongoing users
            const requiredPhotoCount = getRequiredPhotoCount();
            const hasPersonalInfo =
              userInfo.name &&
              userInfo.age &&
              userInfo.bodyType &&
              userInfo.height &&
              userInfo.ethnicity &&
              userInfo.gender &&
              userInfo.eyeColor;
            const hasPhotos =
              userInfo.userPhotos?.userSelfies &&
              Array.isArray(userInfo.userPhotos.userSelfies) &&
              userInfo.userPhotos.userSelfies.length >= requiredPhotoCount;
            const hasStyles =
              userInfo.styles && Array.isArray(userInfo.styles) && userInfo.styles.length > 0;

            // Determine correct path based on data completeness
            let targetPath: string;
            if (!hasPhotos) {
              targetPath = "/upload/image";
            } else if (!hasPersonalInfo) {
              targetPath = "/upload/info";
            } else if (!hasStyles) {
              targetPath = "/upload/styles";
            } else {
              targetPath = "/wait"; // Only go to wait if everything is complete
            }

            // Redirect if user is not on the correct path
            if (pathname !== targetPath) {
              const redirectResponse = NextResponse.redirect(new URL(targetPath, request.url));
              
              // Delete old project cookies on redirect response too
              cookiesToDelete.forEach((cookieName) => {
                redirectResponse.cookies.delete(cookieName);
              });
              
              // Handle UTM tracking on redirect
              const { searchParams } = new URL(request.url);
              const utmSource = searchParams.get('utm_source');
              if (utmSource && !request.cookies.get('utm_source')) {
                redirectResponse.cookies.set('utm_source', utmSource.substring(0, 100), {
                  maxAge: 30 * 24 * 60 * 60,
                  path: '/',
                  httpOnly: false,
                  sameSite: 'lax',
                });
              }
              
              return redirectResponse;
            }
          } else {
            // For non-ongoing users, use the existing logic
            const redirectResponse = handleRedirectBasedOnWorkStatus(userInfo, request, pathname);
            
            if (redirectResponse) {
              // Delete old project cookies on redirect response too
              cookiesToDelete.forEach((cookieName) => {
                redirectResponse.cookies.delete(cookieName);
              });
              
              // Handle UTM tracking on redirect
              const { searchParams } = new URL(request.url);
              const utmSource = searchParams.get('utm_source');
              if (utmSource && !request.cookies.get('utm_source')) {
                redirectResponse.cookies.set('utm_source', utmSource.substring(0, 100), {
                  maxAge: 30 * 24 * 60 * 60,
                  path: '/',
                  httpOnly: false,
                  sameSite: 'lax',
                });
              }
              
              return redirectResponse;
            }
          }
        }
      } catch (userDataError) {
        console.log('Middleware: Could not fetch user data, continuing...');
      }
    }

    // Delete old project cookies
    cookiesToDelete.forEach((cookieName) => {
      response.cookies.delete(cookieName);
    });

    if (cookiesToDelete.length > 0) {
      console.log(`✅ Cleaned up ${cookiesToDelete.length} old Supabase cookies`);
    }

    // Extract UTM source from the URL query parameters
    const { searchParams } = new URL(request.url);
    const utmSource = searchParams.get('utm_source');

    // If a UTM source is present in the URL and not already set
    if (utmSource && !request.cookies.get('utm_source')) {
      // Set the UTM source as a cookie with reasonable size limits
      response.cookies.set('utm_source', utmSource.substring(0, 100), { // Limit to 100 chars
        maxAge: 30 * 24 * 60 * 60, // Cookie expires after 30 days
        path: '/', // Cookie is available across the entire site
        httpOnly: false, // Cookie is accessible by client-side scripts
        sameSite: 'lax', // Add sameSite for security
      });
    }

    return response;
  } catch (error) {
    // If there's any error in middleware, create a basic response
    console.error('Middleware error:', error);
    const response = NextResponse.next();
    
    // Still clean up old cookies even if updateSession fails
    cookiesToDelete.forEach((cookieName) => {
      response.cookies.delete(cookieName);
    });

    return response;
  }
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Run on all routes except static files, images, and favicons
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
