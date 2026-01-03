import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decryptToken, isEncrypted } from "@/lib/encryption";
import { createLogger } from "@/lib/logger";

/**
 * GET /api/slack/test
 *
 * Test endpoint to validate Slack connection for the current user.
 * Returns diagnostic information about:
 * - Profile Slack data
 * - Token encryption status
 * - Slack API connectivity (auth.test)
 */
export async function GET() {
  const log = createLogger({ service: 'slack', action: 'test' });

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      log.warn('Unauthorized access attempt');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    log.info('Starting Slack connection test', { userId: user.id });

    // Get user profile with Slack data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('slack_user_id, slack_access_token, slack_connected, slack_handle, slack_team_id')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      log.error('Failed to fetch profile', { userId: user.id, error: profileError.message });
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch profile',
        details: profileError.message
      }, { status: 500 });
    }

    const diagnostics: Record<string, any> = {
      profile: {
        hasSlackUserId: !!profile?.slack_user_id,
        hasSlackToken: !!profile?.slack_access_token,
        slackConnected: profile?.slack_connected ?? false,
        slackHandle: profile?.slack_handle || null,
        slackTeamId: profile?.slack_team_id || null,
      },
      token: {
        present: !!profile?.slack_access_token,
        encrypted: profile?.slack_access_token ? isEncrypted(profile.slack_access_token) : false,
        decryptable: false,
      },
      slackApi: {
        tested: false,
        success: false,
        error: null as string | null,
        response: null as any,
      }
    };

    // Try to decrypt the token
    if (profile?.slack_access_token) {
      try {
        const decrypted = decryptToken(profile.slack_access_token);
        diagnostics.token.decryptable = !!decrypted;
        diagnostics.token.tokenPrefix = decrypted ? `${decrypted.substring(0, 10)}...` : null;

        // Test Slack API if we have a token
        if (decrypted) {
          diagnostics.slackApi.tested = true;

          try {
            const slackResponse = await fetch('https://slack.com/api/auth.test', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${decrypted}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            });

            const slackData = await slackResponse.json();
            diagnostics.slackApi.success = slackData.ok === true;
            diagnostics.slackApi.response = {
              ok: slackData.ok,
              user: slackData.user,
              team: slackData.team,
              userId: slackData.user_id,
              teamId: slackData.team_id,
              error: slackData.error,
            };

            if (slackData.ok) {
              log.info('Slack API test successful', {
                userId: user.id,
                slackUser: slackData.user,
                slackTeam: slackData.team
              });
            } else {
              log.warn('Slack API returned error', {
                userId: user.id,
                slackError: slackData.error
              });
              diagnostics.slackApi.error = slackData.error;
            }
          } catch (apiError: any) {
            log.error('Slack API request failed', {
              userId: user.id,
              error: apiError.message
            });
            diagnostics.slackApi.error = apiError.message;
          }
        }
      } catch (decryptError: any) {
        log.error('Token decryption failed', {
          userId: user.id,
          error: decryptError.message
        });
        diagnostics.token.decryptError = decryptError.message;
      }
    }

    // Determine overall status
    const status = diagnostics.slackApi.success
      ? 'connected'
      : diagnostics.token.present
        ? 'token_invalid'
        : 'not_connected';

    log.info('Slack test completed', { userId: user.id, status });

    return NextResponse.json({
      success: true,
      status,
      diagnostics,
      message: status === 'connected'
        ? 'Slack is properly connected and working'
        : status === 'token_invalid'
          ? 'Slack token exists but is not valid. Try reconnecting.'
          : 'No Slack connection. Connect via Settings.'
    });

  } catch (error: any) {
    log.error('Slack test failed', { error: error.message });
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
