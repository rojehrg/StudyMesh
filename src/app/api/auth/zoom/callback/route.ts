import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encryptToken } from "@/lib/encryption";
import { createLogger } from "@/lib/logger";

const log = createLogger({ service: 'auth', action: 'zoom_callback' });

/**
 * GET /api/auth/zoom/callback
 *
 * Handles Zoom OAuth callback. Exchanges code for tokens and stores them.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      log.warn('Zoom OAuth denied', { error });
      return NextResponse.redirect(
        new URL('/settings?error=zoom_denied', process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    if (!code || !state) {
      log.warn('Missing code or state');
      return NextResponse.redirect(
        new URL('/settings?error=zoom_invalid_response', process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    // Verify state and extract user ID
    let stateData: { userId: string; timestamp: number };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch {
      log.error('Invalid state parameter');
      return NextResponse.redirect(
        new URL('/settings?error=zoom_invalid_state', process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    // Verify the request is not too old (5 minutes)
    if (Date.now() - stateData.timestamp > 5 * 60 * 1000) {
      log.warn('OAuth state expired', { userId: stateData.userId });
      return NextResponse.redirect(
        new URL('/settings?error=zoom_expired', process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id !== stateData.userId) {
      log.warn('User mismatch or not authenticated', {
        sessionUser: user?.id,
        stateUser: stateData.userId
      });
      return NextResponse.redirect(
        new URL('/settings?error=zoom_auth_mismatch', process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    // Exchange code for tokens
    const clientId = process.env.ZOOM_CLIENT_ID!;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET!;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/zoom/callback`;

    const tokenResponse = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      log.error('Failed to exchange code for tokens', {
        status: tokenResponse.status,
        error: errorData
      });
      return NextResponse.redirect(
        new URL('/settings?error=zoom_token_exchange_failed', process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    const tokens = await tokenResponse.json();

    // Get Zoom user info
    const userResponse = await fetch('https://api.zoom.us/v2/users/me', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    let zoomUser = { id: '', email: '' };
    if (userResponse.ok) {
      zoomUser = await userResponse.json();
    }

    // Calculate token expiry
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // Store credentials (upsert)
    const { error: upsertError } = await supabase
      .from('user_provider_credentials')
      .upsert({
        user_id: user.id,
        provider: 'zoom',
        access_token: encryptToken(tokens.access_token),
        refresh_token: encryptToken(tokens.refresh_token),
        token_expires_at: expiresAt.toISOString(),
        provider_user_id: zoomUser.id,
        provider_email: zoomUser.email,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,provider'
      });

    if (upsertError) {
      log.error('Failed to store Zoom credentials', { error: upsertError.message });
      return NextResponse.redirect(
        new URL('/settings?error=zoom_storage_failed', process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    log.info('Zoom connected successfully', {
      userId: user.id,
      zoomEmail: zoomUser.email
    });

    return NextResponse.redirect(
      new URL('/settings?success=zoom_connected', process.env.NEXT_PUBLIC_APP_URL!)
    );
  } catch (error: any) {
    log.error('Zoom callback error', { error: error.message });
    return NextResponse.redirect(
      new URL('/settings?error=zoom_callback_failed', process.env.NEXT_PUBLIC_APP_URL!)
    );
  }
}
