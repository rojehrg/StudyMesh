import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createLogger } from "@/lib/logger";

const log = createLogger({ service: 'auth', action: 'google_oauth' });

/**
 * GET /api/auth/google
 *
 * Initiates Google OAuth flow for Calendar access.
 * Redirects user to Google authorization page.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      log.warn('Unauthorized OAuth attempt');
      return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

    if (!clientId) {
      log.error('GOOGLE_CLIENT_ID not configured');
      return NextResponse.redirect(
        new URL('/settings?error=google_not_configured', process.env.NEXT_PUBLIC_APP_URL)
      );
    }

    // Generate state parameter for CSRF protection (include user ID)
    const state = Buffer.from(JSON.stringify({
      userId: user.id,
      timestamp: Date.now()
    })).toString('base64');

    // Google OAuth authorization URL
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('access_type', 'offline'); // Get refresh token
    authUrl.searchParams.set('prompt', 'consent'); // Force consent to get refresh token
    authUrl.searchParams.set('scope', [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '));

    log.info('Redirecting to Google OAuth', { userId: user.id });

    return NextResponse.redirect(authUrl.toString());
  } catch (error: any) {
    log.error('Failed to initiate Google OAuth', { error: error.message });
    return NextResponse.redirect(
      new URL('/settings?error=google_auth_failed', process.env.NEXT_PUBLIC_APP_URL)
    );
  }
}
