import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  console.log('=== AUTH CALLBACK DEBUG ===')
  console.log('Request URL:', request.url)
  console.log('Code:', code)
  console.log('Origin:', origin)
  console.log('Search params:', Object.fromEntries(searchParams.entries()))

  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/dashboard'

  if (!next.startsWith('/')) {
    // if "next" is not a relative URL, use the default
    next = '/dashboard'
  }

  console.log('Next redirect URL:', next)

  if (code) {
    console.log('Code found, attempting to exchange for session...')

    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    console.log('Exchange result:', {
      hasData: !!data,
      hasUser: !!data?.user,
      hasError: !!error,
      errorMessage: error?.message
    })

    if (!error && data.user) {
      console.log('User authenticated successfully:', data.user.id)

      // Ensure the session is properly set by refreshing it
      await supabase.auth.refreshSession()

      // Check if this is a new user by looking in userTable
      const { data: existingUser } = await supabase
        .from('userTable')
        .select('id, paymentStatus, workStatus')
        .eq('id', data.user.id)
        .single()

      // If user doesn't exist in userTable, they're new and need onboarding
      if (!existingUser) {
        console.log('New user detected, redirecting to forms')
        // For new Google OAuth users, redirect to forms (same as email signup)
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = (process.env.NODE_ENV as string) === 'development' || (process.env.NODE_ENV as string) === 'DEVELOPMENT'

        // Preserve the next parameter for new users too
        const nextParam = next !== '/dashboard' ? `&next=${encodeURIComponent(next)}` : '';
        const redirectUrl = isLocalEnv ? `${origin}/forms?signupCompleted${nextParam}` :
                           forwardedHost ? `https://${forwardedHost}/forms?signupCompleted${nextParam}` :
                           `${origin}/forms?signupCompleted${nextParam}`

        console.log('Redirecting new user to:', redirectUrl)
        return NextResponse.redirect(redirectUrl)
      }

      // Existing user - determine where they should go based on their status
      console.log('Existing user detected, checking status...')
      console.log('User status:', { paymentStatus: existingUser.paymentStatus, workStatus: existingUser.workStatus })

      let targetPath: string;

      // If there's a specific next URL and user has paid, honor it
      if (next !== '/dashboard' && existingUser.paymentStatus && existingUser.paymentStatus !== "NULL") {
        targetPath = next;
        console.log('User has paid and has specific redirect, using next URL:', next);
      } else {
        // Check payment status first
        if (!existingUser.paymentStatus || existingUser.paymentStatus === "NULL") {
          targetPath = "/forms";
          console.log('User needs to complete payment, redirecting to forms');
        } else {
          // Check work status
          const workStatus = (existingUser.workStatus || "").toLowerCase();
          switch (workStatus) {
            case "":
            case "null":
              targetPath = "/upload/intro";
              console.log('User needs to upload photos, redirecting to upload/intro');
              break;
            case "ongoing":
              targetPath = "/wait";
              console.log('User photos are being processed, redirecting to wait');
              break;
            case "completed":
            case "complete":
              targetPath = "/dashboard";
              console.log('User photos are complete, redirecting to dashboard');
              break;
            default:
              targetPath = "/forms";
              console.log('Unknown work status, redirecting to forms');
          }
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = (process.env.NODE_ENV as string) === 'development' || (process.env.NODE_ENV as string) === 'DEVELOPMENT'

      const redirectUrl = isLocalEnv ? `${origin}${targetPath}` :
                         forwardedHost ? `https://${forwardedHost}${targetPath}` :
                         `${origin}${targetPath}`

      console.log('Redirecting existing user to:', redirectUrl)
      return NextResponse.redirect(redirectUrl)
    } else {
      console.log('Authentication error or no user:', error?.message)
    }
  } else {
    console.log('No code parameter found')
  }

  // return the user to an error page with instructions
  console.log('Falling back to error redirect')
  return NextResponse.redirect(`${origin}/auth?message=${encodeURIComponent('Authentication failed. Please try again.')}`)
} 
