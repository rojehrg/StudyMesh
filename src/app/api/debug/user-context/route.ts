import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserContext, getUserActivityStats } from "@/lib/services/user-context";

/**
 * Debug endpoint to see user context and data flow
 * GET /api/debug/user-context
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get the user context
    const context = await getUserContext(supabase, user.id);

    if (!context) {
      return NextResponse.json({
        error: "No profile found",
        supabaseUserId: user.id,
        email: user.email,
      });
    }

    // Get activity stats
    const stats = await getUserActivityStats(supabase, context);

    // Also check raw data
    const { data: rawProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // Check if there are any momentum locks at all for this slack_user_id
    let rawLocks: any[] = [];
    if (context.slackUserId) {
      const { data: locks } = await supabase
        .from("momentum_locks")
        .select("id, status, owner_user_id, requester_user_id, workspace_id, created_at")
        .or(`owner_user_id.eq.${context.slackUserId},requester_user_id.eq.${context.slackUserId}`)
        .limit(10);
      rawLocks = locks || [];
    }

    // Check if there are any locks in the workspace
    let workspaceLocks: any[] = [];
    if (context.organizationSlackTeamId) {
      const { data: locks } = await supabase
        .from("momentum_locks")
        .select("id, status, owner_user_id, requester_user_id, workspace_id, created_at")
        .eq("workspace_id", context.organizationSlackTeamId)
        .limit(10);
      workspaceLocks = locks || [];
    }

    return NextResponse.json({
      supabaseAuth: {
        userId: user.id,
        email: user.email,
      },
      context: {
        supabaseUserId: context.supabaseUserId,
        slackUserId: context.slackUserId,
        slackTeamId: context.slackTeamId,
        slackConnected: context.slackConnected,
        organizationId: context.organizationId,
        organizationSlackTeamId: context.organizationSlackTeamId,
        canCreateLocks: context.canCreateLocks,
        canViewAnalytics: context.canViewAnalytics,
      },
      stats,
      rawProfile: {
        slack_user_id: rawProfile?.slack_user_id,
        slack_team_id: rawProfile?.slack_team_id,
        slack_connected: rawProfile?.slack_connected,
        organization_id: rawProfile?.organization_id,
      },
      queries: {
        locksForSlackUser: {
          slackUserId: context.slackUserId,
          count: rawLocks.length,
          sample: rawLocks.slice(0, 3),
        },
        locksInWorkspace: {
          workspaceId: context.organizationSlackTeamId,
          count: workspaceLocks.length,
          sample: workspaceLocks.slice(0, 3),
        },
      },
      diagnosis: getDiagnosis(context, rawLocks, workspaceLocks),
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

function getDiagnosis(
  context: any,
  userLocks: any[],
  workspaceLocks: any[]
): string[] {
  const issues: string[] = [];

  if (!context.slackUserId) {
    issues.push("CRITICAL: No slack_user_id in profile. User needs to complete Slack OAuth.");
  }

  if (!context.slackConnected) {
    issues.push("WARNING: slack_connected is false. User may not have completed Slack connection.");
  }

  if (!context.organizationId) {
    issues.push("WARNING: No organization_id. User is not part of an organization.");
  }

  if (!context.organizationSlackTeamId) {
    issues.push("WARNING: Organization has no slack_team_id. Org needs Slack app installed.");
  }

  if (context.slackUserId && userLocks.length === 0 && workspaceLocks.length > 0) {
    issues.push(
      `MISMATCH: No locks for user's slack_user_id (${context.slackUserId}) but ${workspaceLocks.length} locks exist in workspace. ` +
      `User might be signed in with different Slack account than the one that created locks. ` +
      `Workspace locks have owner_user_ids: ${[...new Set(workspaceLocks.map(l => l.owner_user_id))].join(', ')}`
    );
  }

  if (context.slackUserId && userLocks.length === 0 && workspaceLocks.length === 0) {
    issues.push("INFO: No momentum locks exist yet. User needs to create one via /attunly in Slack.");
  }

  if (userLocks.length > 0) {
    issues.push(`OK: Found ${userLocks.length} locks for this user.`);
  }

  return issues;
}
