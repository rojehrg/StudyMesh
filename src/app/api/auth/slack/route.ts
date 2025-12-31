import { NextResponse } from "next/server";

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Initiates Slack OAuth flow for authentication
 * This is the ONLY way to sign in to Meshflow
 */
export async function GET() {
  try {
    if (!SLACK_CLIENT_ID) {
      return NextResponse.json(
        { error: "Slack OAuth is not configured. Please set SLACK_CLIENT_ID." },
        { status: 500 }
      );
    }

    // Scopes needed for authentication + sending DMs
    // Bot scopes (for the app)
    const botScopes = [
      "chat:write",      // Send messages as the app
      "users:read",      // Read user info
      "im:write",        // Open DM channels
      "team:read",       // Read workspace info
    ].join(",");

    // User scopes (to identify the user)
    const userScopes = [
      "openid",          // OpenID Connect
      "profile",         // User profile info
      "email",           // User email
    ].join(",");

    // Generate a random state for CSRF protection
    const state = Buffer.from(JSON.stringify({
      timestamp: Date.now(),
      random: Math.random().toString(36).substring(7)
    })).toString("base64");

    const redirectUri = `${APP_URL}/api/auth/slack/callback`;

    const slackAuthUrl = new URL("https://slack.com/oauth/v2/authorize");
    slackAuthUrl.searchParams.set("client_id", SLACK_CLIENT_ID);
    slackAuthUrl.searchParams.set("scope", botScopes);
    slackAuthUrl.searchParams.set("user_scope", userScopes);
    slackAuthUrl.searchParams.set("redirect_uri", redirectUri);
    slackAuthUrl.searchParams.set("state", state);

    return NextResponse.redirect(slackAuthUrl.toString());
  } catch (error) {
    console.error("Error initiating Slack OAuth:", error);
    return NextResponse.json(
      { error: "Failed to initiate Slack authentication" },
      { status: 500 }
    );
  }
}
