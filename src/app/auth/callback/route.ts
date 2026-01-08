import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { serverAnalytics, EVENTS } from '@/lib/analytics'
import { sendWelcomeEmail } from '@/lib/notifications'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/dashboard'

  // Log all query params for debugging
  const allParams: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    allParams[key] = key === 'code' ? '[REDACTED]' : value;
  });

  console.log('[OAuth Callback] Received:', {
    hasCode: !!code,
    codeLength: code?.length,
    error,
    errorDescription,
    origin,
    fullUrl: request.url.replace(/code=[^&]+/, 'code=[REDACTED]'),
    allParams
  });

  // Handle OAuth errors
  if (error) {
    console.error('[OAuth Callback] OAuth error:', error, errorDescription);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorDescription || error)}`)
  }

  if (!code) {
    console.error('[OAuth Callback] No code received');
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('[OAuth Callback] Missing Supabase environment variables')
    return NextResponse.redirect(`${origin}/login?error=config_error`)
  }

  const cookieStore = await cookies()

  // Log available cookies (for debugging PKCE issues)
  const allCookies = cookieStore.getAll();
  const cookieNames = allCookies.map(c => c.name);
  console.log('[OAuth Callback] Available cookies:', {
    count: allCookies.length,
    names: cookieNames,
    hasPkce: cookieNames.some(n => n.includes('code_verifier') || n.includes('pkce'))
  });

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
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(exchangeError.message)}`)
  }

  // Check if user needs onboarding or org setup
  if (data?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, organization_id')
      .eq('user_id', data.user.id)
      .maybeSingle()

    if (!profile) {
      console.log('[OAuth Callback] New user, redirecting to onboarding');
      // Track new signup
      serverAnalytics.track({
        userId: data.user.id,
        event: EVENTS.USER_SIGNED_UP,
        properties: { method: 'google' }
      });
      // Send welcome email (don't await - fire and forget)
      if (data.user.email) {
        sendWelcomeEmail({
          email: data.user.email,
          name: data.user.user_metadata?.full_name?.split(' ')[0] || undefined,
        }).catch((err) => console.error('[OAuth Callback] Welcome email failed:', err));
      }
      redirectUrl = `${origin}/onboarding`
    } else if (!profile.organization_id) {
      console.log('[OAuth Callback] User needs org setup, redirecting to org-setup');
      // Track returning login
      serverAnalytics.track({
        userId: data.user.id,
        event: EVENTS.USER_LOGGED_IN,
        properties: { method: 'google' }
      });
      redirectUrl = `${origin}/org-setup`
    } else {
      console.log('[OAuth Callback] Existing user with org, redirecting to dashboard');
      // Track returning login
      serverAnalytics.track({
        userId: data.user.id,
        event: EVENTS.USER_LOGGED_IN,
        properties: { method: 'google' }
      });
      redirectUrl = `${origin}/dashboard`
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
