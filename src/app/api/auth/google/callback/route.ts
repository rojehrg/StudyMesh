import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encryptToken } from "@/lib/encryption";
import { createLogger } from "@/lib/logger";

const log = createLogger({ service: 'auth', action: 'google_callback' });

/**
 * GET /api/auth/google/callback
 *
 * Handles Google OAuth callback. Exchanges code for tokens and stores them.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      log.warn('Google OAuth denied', { error });
      return NextResponse.redirect(
        new URL('/settings?error=google_denied', process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    if (!code || !state) {
      log.warn('Missing code or state');
      return NextResponse.redirect(
        new URL('/settings?error=google_invalid_response', process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    // Verify state and extract user ID
    let stateData: { userId: string; timestamp: number };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch {
      log.error('Invalid state parameter');
      return NextResponse.redirect(
        new URL('/settings?error=google_invalid_state', process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    // Verify the request is not too old (5 minutes)
    if (Date.now() - stateData.timestamp > 5 * 60 * 1000) {
      log.warn('OAuth state expired', { userId: stateData.userId });
      return NextResponse.redirect(
        new URL('/settings?error=google_expired', process.env.NEXT_PUBLIC_APP_URL!)
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
        new URL('/settings?error=google_auth_mismatch', process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    // Exchange code for tokens
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      log.error('Failed to exchange code for tokens', {
        status: tokenResponse.status,
        error: errorData
      });
      return NextResponse.redirect(
        new URL('/settings?error=google_token_exchange_failed', process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    const tokens = await tokenResponse.json();

    // Get Google user info
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    let googleUser = { id: '', email: '' };
    if (userInfoResponse.ok) {
      googleUser = await userInfoResponse.json();
    }

    // Calculate token expiry
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // Store credentials (upsert)
    const { error: upsertError } = await supabase
      .from('user_provider_credentials')
      .upsert({
        user_id: user.id,
        provider: 'google_calendar',
        access_token: encryptToken(tokens.access_token),
        refresh_token: tokens.refresh_token ? encryptToken(tokens.refresh_token) : null,
        token_expires_at: expiresAt.toISOString(),
        provider_user_id: googleUser.id,
        provider_email: googleUser.email,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,provider'
      });

    if (upsertError) {
      log.error('Failed to store Google credentials', { error: upsertError.message });
      return NextResponse.redirect(
        new URL('/settings?error=google_storage_failed', process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    log.info('Google Calendar connected successfully', {
      userId: user.id,
      googleEmail: googleUser.email
    });

    return NextResponse.redirect(
      new URL('/settings?success=google_connected', process.env.NEXT_PUBLIC_APP_URL!)
    );
  } catch (error: any) {
    log.error('Google callback error', { error: error.message });
    return NextResponse.redirect(
      new URL('/settings?error=google_callback_failed', process.env.NEXT_PUBLIC_APP_URL!)
    );
  }
}
