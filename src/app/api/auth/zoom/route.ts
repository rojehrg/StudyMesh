import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createLogger } from "@/lib/logger";

const log = createLogger({ service: 'auth', action: 'zoom_oauth' });

/**
 * GET /api/auth/zoom
 *
 * Initiates Zoom OAuth flow. Redirects user to Zoom authorization page.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      log.warn('Unauthorized OAuth attempt');
      return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL));
    }

    const clientId = process.env.ZOOM_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/zoom/callback`;

    if (!clientId) {
      log.error('ZOOM_CLIENT_ID not configured');
      return NextResponse.redirect(
        new URL('/settings?error=zoom_not_configured', process.env.NEXT_PUBLIC_APP_URL)
      );
    }

    // Generate state parameter for CSRF protection (include user ID)
    const state = Buffer.from(JSON.stringify({
      userId: user.id,
      timestamp: Date.now()
    })).toString('base64');

    // Zoom OAuth authorization URL
    const authUrl = new URL('https://zoom.us/oauth/authorize');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);

    log.info('Redirecting to Zoom OAuth', { userId: user.id });

    return NextResponse.redirect(authUrl.toString());
  } catch (error: any) {
    log.error('Failed to initiate Zoom OAuth', { error: error.message });
    return NextResponse.redirect(
      new URL('/settings?error=zoom_auth_failed', process.env.NEXT_PUBLIC_APP_URL)
    );
  }
}
