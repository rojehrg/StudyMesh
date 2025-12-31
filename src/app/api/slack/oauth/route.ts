import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID;
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const STATE_COOKIE_NAME = "slack_connect_state";
const STATE_COOKIE_MAX_AGE = 60 * 10; // 10 minutes

// GET: Initiate OAuth flow - redirect user to Slack
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${APP_URL}/login`);
    }

    if (!SLACK_CLIENT_ID) {
      return NextResponse.json(
        { error: "Slack OAuth is not configured. Please set SLACK_CLIENT_ID." },
        { status: 500 }
      );
    }

    // Slack OAuth scopes needed to send DMs
    const scopes = [
      "chat:write",      // Send messages
      "users:read",      // Read user info
      "im:write",        // Open DM channels
    ].join(",");

    // Use the user's ID with a cryptographically secure nonce as state for CSRF protection
    const state = Buffer.from(JSON.stringify({
      userId: user.id,
      nonce: crypto.randomUUID(),
      timestamp: Date.now()
    })).toString("base64");

    const redirectUri = `${APP_URL}/api/slack/oauth/callback`;

    const slackAuthUrl = new URL("https://slack.com/oauth/v2/authorize");
    slackAuthUrl.searchParams.set("client_id", SLACK_CLIENT_ID);
    slackAuthUrl.searchParams.set("scope", scopes);
    slackAuthUrl.searchParams.set("user_scope", ""); // We want bot token, not user token
    slackAuthUrl.searchParams.set("redirect_uri", redirectUri);
    slackAuthUrl.searchParams.set("state", state);

    // Store state in a secure cookie for CSRF validation in callback
    const cookieStore = await cookies();
    cookieStore.set(STATE_COOKIE_NAME, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: STATE_COOKIE_MAX_AGE,
      path: "/",
    });

    return NextResponse.redirect(slackAuthUrl.toString());
  } catch (error) {
    console.error("Error initiating Slack OAuth:", error);
    return NextResponse.json(
      { error: "Failed to initiate Slack OAuth" },
      { status: 500 }
    );
  }
}

// POST: Disconnect Slack
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        slack_user_id: null,
        slack_access_token: null,
        slack_team_id: null,
        slack_connected: false,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Slack disconnected" });
  } catch (error) {
    console.error("Error disconnecting Slack:", error);
    return NextResponse.json(
      { error: "Failed to disconnect Slack" },
      { status: 500 }
    );
  }
}
