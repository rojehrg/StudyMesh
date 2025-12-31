import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars are missing, skip auth checks (for build time)
  if (!url || !key) {
    console.warn('[Middleware] Missing Supabase env vars, skipping auth checks')
    return NextResponse.next()
  }
  
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes - redirect unauthenticated users to login
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Onboarding and org-setup require auth
  if ((request.nextUrl.pathname.startsWith('/onboarding') || request.nextUrl.pathname.startsWith('/org-setup')) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Auth routes - redirect authenticated users to dashboard
  if ((request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup')) && user) {
    // Check if user has completed onboarding
    const { data: profile } = await supabase
      .from('profiles')
      .select('expertise_skills')
      .eq('user_id', user.id)
      .maybeSingle();

    const needsOnboarding = !profile?.expertise_skills || profile.expertise_skills.length === 0;

    if (needsOnboarding) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    // Skip auth callback route - let it handle its own redirects
    '/((?!_next/static|_next/image|favicon.ico|auth/callback).*)',
  ],
}
