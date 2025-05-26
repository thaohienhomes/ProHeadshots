import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/dashboard'
  
  if (!next.startsWith('/')) {
    // if "next" is not a relative URL, use the default
    next = '/dashboard'
  }

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Check if this is a new user by looking in userTable
      const { data: existingUser } = await supabase
        .from('userTable')
        .select('id, paymentStatus')
        .eq('id', data.user.id)
        .single()

      // If user doesn't exist in userTable, they're new and need onboarding
      if (!existingUser) {
        // For new Google OAuth users, redirect to forms (same as email signup)
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = (process.env.NODE_ENV as string) === 'development' || (process.env.NODE_ENV as string) === 'DEVELOPMENT'
        
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}/forms?signupCompleted`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}/forms?signupCompleted`)
        } else {
          return NextResponse.redirect(`${origin}/forms?signupCompleted`)
        }
      }
      
      // Existing user - redirect to their appropriate destination
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = (process.env.NODE_ENV as string) === 'development' || (process.env.NODE_ENV as string) === 'DEVELOPMENT'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth?message=${encodeURIComponent('Authentication failed. Please try again.')}`)
} 