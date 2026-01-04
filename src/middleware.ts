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

  // Routes that require organization context
  const orgRequiredRoutes = ['/dashboard', '/classes', '/meetings', '/groups', '/notifications']
  const isOrgRequiredRoute = orgRequiredRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  // Routes exempt from org check (but still need auth)
  const orgExemptRoutes = ['/onboarding', '/org-setup', '/settings']
  const isOrgExemptRoute = orgExemptRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  // Protected routes - redirect unauthenticated users to login
  if ((isOrgRequiredRoute || isOrgExemptRoute) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Auth routes - redirect authenticated users appropriately
  if ((request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup')) && user) {
    // Check if user has completed onboarding and has org
    const { data: profile } = await supabase
      .from('profiles')
      .select('expertise_skills, organization_id')
      .eq('user_id', user.id)
      .maybeSingle();

    const needsOnboarding = !profile?.expertise_skills || profile.expertise_skills.length === 0;

    if (needsOnboarding) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    // Check if user has organization
    if (!profile?.organization_id) {
      return NextResponse.redirect(new URL('/org-setup', request.url))
    }

    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // For org-required routes, check if user has an organization
  if (isOrgRequiredRoute && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .maybeSingle();

    // If no organization, redirect to org-setup
    if (!profile?.organization_id) {
      return NextResponse.redirect(new URL('/org-setup', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    // Skip auth callback route - let it handle its own redirects
    '/((?!_next/static|_next/image|favicon.ico|auth/callback).*)',
  ],
}
