import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID;
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Handles Slack OAuth callback
 * Creates organization, user, profile, and session
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    // Handle user cancellation
    if (error) {
      console.log("[Slack Auth] OAuth cancelled:", error);
      return NextResponse.redirect(`${APP_URL}/?error=cancelled`);
    }

    if (!code) {
      return NextResponse.redirect(`${APP_URL}/?error=missing_code`);
    }

    if (!SLACK_CLIENT_ID || !SLACK_CLIENT_SECRET) {
      console.error("[Slack Auth] Missing Slack credentials");
      return NextResponse.redirect(`${APP_URL}/?error=not_configured`);
    }

    if (!SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[Slack Auth] Missing Supabase service role key");
      return NextResponse.redirect(`${APP_URL}/?error=config_error`);
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
        redirect_uri: `${APP_URL}/api/auth/slack/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.ok) {
      console.error("[Slack Auth] Token exchange failed:", tokenData);
      return NextResponse.redirect(`${APP_URL}/?error=${tokenData.error}`);
    }

    console.log("[Slack Auth] Token exchange successful");

    // Extract workspace (organization) info
    const workspaceId = tokenData.team?.id;
    const workspaceName = tokenData.team?.name;
    const botAccessToken = tokenData.access_token;

    // Extract user info from authed_user
    const slackUserId = tokenData.authed_user?.id;
    const userAccessToken = tokenData.authed_user?.access_token;

    if (!workspaceId || !slackUserId) {
      console.error("[Slack Auth] Missing workspace or user info");
      return NextResponse.redirect(`${APP_URL}/?error=missing_info`);
    }

    // Get detailed user info from Slack
    const userInfoResponse = await fetch(
      `https://slack.com/api/users.info?user=${slackUserId}`,
      {
        headers: {
          Authorization: `Bearer ${botAccessToken}`,
        },
      }
    );

    const userInfoData = await userInfoResponse.json();

    if (!userInfoData.ok) {
      console.error("[Slack Auth] Failed to get user info:", userInfoData);
      return NextResponse.redirect(`${APP_URL}/?error=user_info_failed`);
    }

    const slackUser = userInfoData.user;
    const userEmail = slackUser.profile?.email;
    const userName = slackUser.real_name || slackUser.name;
    const userAvatar = slackUser.profile?.image_192 || slackUser.profile?.image_72;
    const userTimezone = slackUser.tz || "America/New_York";

    if (!userEmail) {
      console.error("[Slack Auth] No email found for user");
      return NextResponse.redirect(`${APP_URL}/?error=no_email`);
    }

    console.log("[Slack Auth] User info retrieved for workspace:", workspaceName);

    // Create Supabase admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 1. Create or get organization
    let organization;
    const { data: existingOrg } = await supabaseAdmin
      .from("organizations")
      .select("*")
      .eq("slack_team_id", workspaceId)
      .single();

    if (existingOrg) {
      organization = existingOrg;
      console.log("[Slack Auth] Found existing organization:", organization.name);
    } else {
      // Get workspace icon
      let workspaceIcon = null;
      try {
        const teamInfoResponse = await fetch(
          "https://slack.com/api/team.info",
          {
            headers: {
              Authorization: `Bearer ${botAccessToken}`,
            },
          }
        );
        const teamInfo = await teamInfoResponse.json();
        workspaceIcon = teamInfo.team?.icon?.image_132;
      } catch (e) {
        console.log("[Slack Auth] Could not get workspace icon");
      }

      const { data: newOrg, error: orgError } = await supabaseAdmin
        .from("organizations")
        .insert({
          slack_team_id: workspaceId,
          name: workspaceName,
          slack_team_name: workspaceName,
          slack_team_icon: workspaceIcon,
        })
        .select()
        .single();

      if (orgError) {
        console.error("[Slack Auth] Failed to create organization:", orgError);
        return NextResponse.redirect(`${APP_URL}/?error=org_creation_failed`);
      }

      organization = newOrg;
      console.log("[Slack Auth] Created new organization:", organization.name);
    }

    // 2. Create or get Supabase user
    let supabaseUser;

    // First, check if user exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === userEmail);

    if (existingUser) {
      supabaseUser = existingUser;
      console.log("[Slack Auth] Found existing user");
    } else {
      // Create new user with a random password (they'll never use it - Slack only)
      const { data: newUser, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email: userEmail,
        email_confirm: true, // Auto-confirm since we verified via Slack
        user_metadata: {
          full_name: userName,
          avatar_url: userAvatar,
          slack_user_id: slackUserId,
        },
      });

      if (userError) {
        console.error("[Slack Auth] Failed to create user:", userError);
        return NextResponse.redirect(`${APP_URL}/?error=user_creation_failed`);
      }

      supabaseUser = newUser.user;
      console.log("[Slack Auth] Created new user");
    }

    if (!supabaseUser) {
      return NextResponse.redirect(`${APP_URL}/?error=user_not_found`);
    }

    // 3. Create or update profile
    // Parse name into first and last
    const nameParts = userName.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("user_id", supabaseUser.id)
      .single();

    if (existingProfile) {
      // Update existing profile with latest Slack info
      await supabaseAdmin
        .from("profiles")
        .update({
          organization_id: organization.id,
          slack_user_id: slackUserId,
          slack_access_token: botAccessToken,
          slack_team_id: workspaceId,
          slack_connected: true,
          slack_handle: `@${slackUser.name}`,
          avatar_url: userAvatar,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", supabaseUser.id);

      console.log("[Slack Auth] Updated existing profile");
    } else {
      // Create new profile
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .insert({
          user_id: supabaseUser.id,
          organization_id: organization.id,
          first_name: firstName,
          last_name: lastName,
          email: userEmail,
          avatar_url: userAvatar,
          timezone: userTimezone,
          slack_user_id: slackUserId,
          slack_access_token: botAccessToken,
          slack_team_id: workspaceId,
          slack_connected: true,
          slack_handle: `@${slackUser.name}`,
        });

      if (profileError) {
        console.error("[Slack Auth] Failed to create profile:", profileError);
        // Continue anyway - profile can be created during onboarding
      } else {
        console.log("[Slack Auth] Created new profile");
      }
    }

    // 4. Create session for the user
    // Generate a magic link and use it to create a session
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: userEmail,
      options: {
        redirectTo: `${APP_URL}/dashboard`,
      },
    });

    if (sessionError || !sessionData?.properties?.hashed_token) {
      console.error("[Slack Auth] Failed to generate session:", sessionError);
      return NextResponse.redirect(`${APP_URL}/?error=session_failed`);
    }

    // Use the token to create a session
    const verifyUrl = new URL(`${SUPABASE_URL}/auth/v1/verify`);
    verifyUrl.searchParams.set("token", sessionData.properties.hashed_token);
    verifyUrl.searchParams.set("type", "magiclink");
    verifyUrl.searchParams.set("redirect_to", `${APP_URL}/dashboard`);

    // Determine redirect based on profile completeness
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("expertise_skills")
      .eq("user_id", supabaseUser.id)
      .single();

    const needsOnboarding = !profile?.expertise_skills || profile.expertise_skills.length === 0;
    const redirectPath = needsOnboarding ? "/onboarding" : "/dashboard";

    // Create a signed URL for immediate login
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: userEmail,
    });

    if (signInError) {
      console.error("[Slack Auth] Sign in error:", signInError);
      return NextResponse.redirect(`${APP_URL}/?error=signin_failed`);
    }

    // Extract the token from the action link
    const actionLink = signInData.properties?.action_link;
    if (!actionLink) {
      return NextResponse.redirect(`${APP_URL}/?error=no_action_link`);
    }

    // Modify the redirect to go to our callback which will handle the session
    const tokenUrl = new URL(actionLink);
    const token = tokenUrl.searchParams.get("token");
    const type = tokenUrl.searchParams.get("type");

    // Redirect through Supabase auth to set the session cookies
    const authCallbackUrl = new URL(`${APP_URL}/auth/callback`);
    authCallbackUrl.searchParams.set("token_hash", token || "");
    authCallbackUrl.searchParams.set("type", type || "magiclink");
    authCallbackUrl.searchParams.set("next", redirectPath);

    console.log("[Slack Auth] Redirecting to auth callback for session creation");

    // Actually, let's use the verify endpoint directly
    const supabaseVerifyUrl = `${SUPABASE_URL}/auth/v1/verify?token=${token}&type=${type}&redirect_to=${encodeURIComponent(APP_URL + redirectPath)}`;

    return NextResponse.redirect(supabaseVerifyUrl);

  } catch (error) {
    console.error("[Slack Auth] Callback error:", error);
    return NextResponse.redirect(`${APP_URL}/?error=unknown`);
  }
}
