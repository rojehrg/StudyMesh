import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('[OAuth Callback] Received:', {
    hasCode: !!code,
    error,
    errorDescription,
    origin
  });

  // Handle OAuth errors
  if (error) {
    console.error('[OAuth Callback] OAuth error:', error, errorDescription);
    return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(errorDescription || error)}`)
  }

  if (!code) {
    console.error('[OAuth Callback] No code received');
    return NextResponse.redirect(`${origin}/?error=no_code`)
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('[OAuth Callback] Missing Supabase environment variables')
    return NextResponse.redirect(`${origin}/?error=config_error`)
  }

  const cookieStore = await cookies()

  // We need to create the response first so we can set cookies on it
  let redirectUrl = `${origin}${next}`
  const cookiesToSet: Array<{ name: string; value: string; options: any }> = []

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookies) {
          // Collect cookies to set on the response later
          cookies.forEach((cookie) => {
            cookiesToSet.push(cookie)
          })
        },
      },
    }
  )

  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  console.log('[OAuth Callback] Exchange result:', {
    success: !exchangeError,
    hasSession: !!data?.session,
    error: exchangeError?.message,
    cookiesToSet: cookiesToSet.length
  });

  if (exchangeError) {
    console.error('[OAuth Callback] Exchange failed:', exchangeError);
    return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(exchangeError.message)}`)
  }

  // Check if user needs onboarding
  if (data?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', data.user.id)
      .maybeSingle()

    if (!profile) {
      console.log('[OAuth Callback] New user, redirecting to onboarding');
      redirectUrl = `${origin}/onboarding`
    }
  }

  // Create the redirect response and attach all cookies to it
  console.log('[OAuth Callback] Redirecting to:', redirectUrl);
  const response = NextResponse.redirect(redirectUrl)

  // Set all the auth cookies on the response
  cookiesToSet.forEach(({ name, value, options }) => {
    console.log('[OAuth Callback] Setting cookie:', name);
    response.cookies.set(name, value, options)
  })

  return response
}
