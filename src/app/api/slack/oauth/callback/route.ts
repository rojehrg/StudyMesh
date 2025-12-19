import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID;
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    // Handle user cancellation
    if (error) {
      console.log("Slack OAuth cancelled:", error);
      return NextResponse.redirect(`${APP_URL}/settings?slack=cancelled`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${APP_URL}/settings?slack=error&message=missing_params`);
    }

    if (!SLACK_CLIENT_ID || !SLACK_CLIENT_SECRET) {
      return NextResponse.redirect(`${APP_URL}/settings?slack=error&message=not_configured`);
    }

    // Decode state to get user ID
    let userId: string;
    try {
      const decoded = JSON.parse(Buffer.from(state, "base64").toString());
      userId = decoded.userId;
    } catch {
      return NextResponse.redirect(`${APP_URL}/settings?slack=error&message=invalid_state`);
    }

    // Verify the user is still logged in
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id !== userId) {
      return NextResponse.redirect(`${APP_URL}/login`);
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: SLACK_CLIENT_ID,
        client_secret: SLACK_CLIENT_SECRET,
        code,
        redirect_uri: `${APP_URL}/api/slack/oauth/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.ok) {
      console.error("Slack token exchange failed:", tokenData);
      return NextResponse.redirect(`${APP_URL}/settings?slack=error&message=${tokenData.error}`);
    }

    // Get the authed user info
    const accessToken = tokenData.access_token;
    const teamId = tokenData.team?.id;
    const authedUserId = tokenData.authed_user?.id;

    // Get user's Slack profile to get their display name
    const userInfoResponse = await fetch(`https://slack.com/api/users.info?user=${authedUserId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userInfo = await userInfoResponse.json();
    const slackHandle = userInfo.user?.name || userInfo.user?.real_name || authedUserId;

    // Save to database
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        slack_user_id: authedUserId,
        slack_access_token: accessToken,
        slack_team_id: teamId,
        slack_connected: true,
        slack_handle: `@${slackHandle}`,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error saving Slack credentials:", updateError);
      return NextResponse.redirect(`${APP_URL}/settings?slack=error&message=save_failed`);
    }

    return NextResponse.redirect(`${APP_URL}/settings?slack=success`);
  } catch (error) {
    console.error("Slack OAuth callback error:", error);
    return NextResponse.redirect(`${APP_URL}/settings?slack=error&message=unknown`);
  }
}
