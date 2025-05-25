import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getRequiredPhotoCount } from "@/utils/photoConfig";

// Helper function to handle redirects based on user status
const handleRedirectBasedOnWorkStatus = (user: any, request: NextRequest): NextResponse | null => {
  const { pathname } = new URL(request.url);
  
  // Don't redirect if user is on API routes or Next.js internal routes
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
    return null;
  }

  // If user is on auth pages but already logged in, redirect them to appropriate page
  if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
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
      targetPath = "/dashboard";
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
  // Clean up old Supabase project cookies to prevent HTTP 431 errors
  const currentProjectId = 'bovtokbsxuyuotbotmgx';
  const cookiesToDelete: string[] = [];
  
  request.cookies.getAll().forEach((cookie) => {
    // Delete cookies from old Supabase projects
    if (cookie.name.startsWith('sb-') && !cookie.name.includes(currentProjectId)) {
      cookiesToDelete.push(cookie.name);
    }
  });
  
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

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
          const { pathname } = new URL(request.url);
          
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
            const redirectResponse = handleRedirectBasedOnWorkStatus(userInfo, request);
            
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