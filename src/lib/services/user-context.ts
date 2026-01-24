import { SupabaseClient } from "@supabase/supabase-js";

/**
 * User context that bridges Supabase auth with Slack identity
 * This is the single source of truth for user identity across the app
 */
export interface UserContext {
  // Supabase identity
  supabaseUserId: string;
  email: string;

  // Profile info
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;

  // Slack identity (null if not connected)
  slackUserId: string | null;
  slackTeamId: string | null;
  slackHandle: string | null;
  slackConnected: boolean;

  // Organization (null if not part of one)
  organizationId: string | null;
  organizationName: string | null;
  organizationSlackTeamId: string | null;

  // Feature flags / settings
  hasExpertise: boolean;
  hasCalendarConnected: boolean;

  // Computed helpers
  canCreateLocks: boolean;
  canViewAnalytics: boolean;

  // Data consistency warnings
  hasWorkspaceMismatch: boolean;
  workspaceMismatchWarning: string | null;
}

/**
 * Activity stats for a user
 */
export interface UserActivityStats {
  // This week
  nudgesSent: number;
  nudgesReceived: number;

  // Momentum locks (filtered by user's Slack ID)
  activeLocksCount: number;
  completedLocksCount: number;
  blockedLocksCount: number;
  totalLocksCount: number;

  // Computed
  isFirstTimeUser: boolean;
  hasActivity: boolean;
}

/**
 * Organization-wide analytics data
 */
export interface OrgAnalyticsData {
  // Overview
  totalLocks: number;
  completedLocks: number;
  blockedLocks: number;
  activeLocks: number;
  completionRate: number;

  // Time metrics
  averageResolutionHours: number | null;
  averageResponseMinutes: number | null;
  blockRate: number;

  // This month vs last
  locksThisMonth: number;
  locksLastMonth: number;
  completedThisMonth: number;
  completedLastMonth: number;

  // Team
  teamMemberCount: number;
}

/**
 * Fetches complete user context from database
 * Call this once at the top of a page/route, then pass the context down
 */
export async function getUserContext(
  supabase: SupabaseClient,
  userId: string
): Promise<UserContext | null> {
  try {
    // Get auth user email
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser || authUser.id !== userId) return null;

    // Fetch profile with all needed fields
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(`
        first_name,
        last_name,
        avatar_url,
        slack_user_id,
        slack_team_id,
        slack_handle,
        slack_connected,
        expertise_text,
        organization_id
      `)
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError || !profile) {
      console.error("Error fetching profile:", profileError?.message);
      return null;
    }

    // Fetch organization if user has one
    let orgData: { name: string; slack_team_id: string | null } | null = null;
    if (profile.organization_id) {
      const { data: org } = await supabase
        .from("organizations")
        .select("name, slack_team_id")
        .eq("id", profile.organization_id)
        .maybeSingle();
      orgData = org;
    }

    // Check calendar connection
    const { data: calendarCreds } = await supabase
      .from("user_provider_credentials")
      .select("id")
      .eq("user_id", userId)
      .eq("provider", "google")
      .maybeSingle();

    const slackConnected = profile.slack_connected === true && !!profile.slack_user_id;
    const hasOrgSlackWorkspace = !!orgData?.slack_team_id;

    // Check for workspace mismatch
    // This happens when user's Slack account is connected to a different workspace
    // than the organization's workspace, which can cause analytics data to be invisible
    const hasWorkspaceMismatch = !!(
      profile.slack_team_id &&
      orgData?.slack_team_id &&
      profile.slack_team_id !== orgData.slack_team_id
    );

    const workspaceMismatchWarning = hasWorkspaceMismatch
      ? `Your Slack account is connected to a different workspace than your organization. ` +
        `Your workspace: ${profile.slack_team_id}, Organization workspace: ${orgData?.slack_team_id}. ` +
        `This may cause some data to be invisible in analytics.`
      : null;

    return {
      // Supabase identity
      supabaseUserId: userId,
      email: authUser.email || "",

      // Profile info
      firstName: profile.first_name,
      lastName: profile.last_name,
      avatarUrl: profile.avatar_url,

      // Slack identity
      slackUserId: profile.slack_user_id,
      slackTeamId: profile.slack_team_id,
      slackHandle: profile.slack_handle,
      slackConnected,

      // Organization
      organizationId: profile.organization_id,
      organizationName: orgData?.name || null,
      organizationSlackTeamId: orgData?.slack_team_id || null,

      // Feature flags
      hasExpertise: !!profile.expertise_text,
      hasCalendarConnected: !!calendarCreds,

      // Computed helpers
      canCreateLocks: slackConnected && hasOrgSlackWorkspace,
      canViewAnalytics: slackConnected && hasOrgSlackWorkspace,

      // Data consistency warnings
      hasWorkspaceMismatch,
      workspaceMismatchWarning,
    };
  } catch (error) {
    console.error("Error in getUserContext:", error);
    return null;
  }
}

/**
 * Fetches user's activity stats including momentum locks
 * Uses the Slack user ID to query locks (not Supabase ID!)
 */
export async function getUserActivityStats(
  supabase: SupabaseClient,
  context: UserContext
): Promise<UserActivityStats> {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  // Default empty stats
  const emptyStats: UserActivityStats = {
    nudgesSent: 0,
    nudgesReceived: 0,
    activeLocksCount: 0,
    completedLocksCount: 0,
    blockedLocksCount: 0,
    totalLocksCount: 0,
    isFirstTimeUser: true,
    hasActivity: false,
  };

  try {
    // Fetch nudges using Supabase user ID
    const [sentNudges, receivedNudges] = await Promise.all([
      supabase
        .from("nudges")
        .select("id", { count: "exact", head: true })
        .eq("sender_id", context.supabaseUserId)
        .gte("created_at", weekAgo.toISOString()),
      supabase
        .from("nudges")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", context.supabaseUserId)
        .gte("created_at", weekAgo.toISOString()),
    ]);

    const nudgesSent = sentNudges.count || 0;
    const nudgesReceived = receivedNudges.count || 0;

    // If no Slack user ID, we can't query momentum locks
    if (!context.slackUserId) {
      return {
        ...emptyStats,
        nudgesSent,
        nudgesReceived,
        hasActivity: nudgesSent > 0 || nudgesReceived > 0,
        isFirstTimeUser: nudgesSent === 0 && nudgesReceived === 0,
      };
    }

    // Fetch momentum locks using Slack user ID
    const slackId = context.slackUserId;

    const [activeLocks, completedLocks, blockedLocks, totalLocks] = await Promise.all([
      supabase
        .from("momentum_locks")
        .select("id", { count: "exact", head: true })
        .or(`owner_user_id.eq.${slackId},requester_user_id.eq.${slackId}`)
        .in("status", ["active", "started"]),
      supabase
        .from("momentum_locks")
        .select("id", { count: "exact", head: true })
        .or(`owner_user_id.eq.${slackId},requester_user_id.eq.${slackId}`)
        .eq("status", "done")
        .gte("updated_at", weekAgo.toISOString()),
      supabase
        .from("momentum_locks")
        .select("id", { count: "exact", head: true })
        .or(`owner_user_id.eq.${slackId},requester_user_id.eq.${slackId}`)
        .eq("status", "blocked"),
      supabase
        .from("momentum_locks")
        .select("id", { count: "exact", head: true })
        .or(`owner_user_id.eq.${slackId},requester_user_id.eq.${slackId}`),
    ]);

    const activeLocksCount = activeLocks.count || 0;
    const completedLocksCount = completedLocks.count || 0;
    const blockedLocksCount = blockedLocks.count || 0;
    const totalLocksCount = totalLocks.count || 0;

    const isFirstTimeUser = nudgesSent === 0 && nudgesReceived === 0 && totalLocksCount === 0;
    const hasActivity = !isFirstTimeUser || completedLocksCount > 0;

    return {
      nudgesSent,
      nudgesReceived,
      activeLocksCount,
      completedLocksCount,
      blockedLocksCount,
      totalLocksCount,
      isFirstTimeUser,
      hasActivity,
    };
  } catch (error) {
    console.error("Error fetching user activity stats:", error);
    return emptyStats;
  }
}

/**
 * Fetches organization-wide analytics
 * Uses the organization's Slack team ID to query all locks in that workspace
 */
export async function getOrgAnalytics(
  supabase: SupabaseClient,
  context: UserContext
): Promise<OrgAnalyticsData | null> {
  if (!context.organizationSlackTeamId) {
    return null;
  }

  const workspaceId = context.organizationSlackTeamId;
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  try {
    // Fetch all locks for this workspace
    const { data: allLocks, error } = await supabase
      .from("momentum_locks")
      .select("id, status, created_at, updated_at, owner_user_id")
      .eq("workspace_id", workspaceId);

    if (error) {
      console.error("Error fetching locks:", error);
      return null;
    }

    const locks = allLocks || [];

    // Calculate metrics
    const totalLocks = locks.length;
    const completedLocks = locks.filter((l) => l.status === "done").length;
    const blockedLocks = locks.filter((l) => l.status === "blocked").length;
    const activeLocks = locks.filter((l) => ["active", "started"].includes(l.status)).length;
    const completionRate = totalLocks > 0 ? Math.round((completedLocks / totalLocks) * 100) : 0;

    // This month vs last month
    const locksThisMonth = locks.filter(
      (l) => new Date(l.created_at) >= startOfThisMonth
    ).length;
    const locksLastMonth = locks.filter(
      (l) =>
        new Date(l.created_at) >= startOfLastMonth &&
        new Date(l.created_at) <= endOfLastMonth
    ).length;
    const completedThisMonth = locks.filter(
      (l) => l.status === "done" && new Date(l.created_at) >= startOfThisMonth
    ).length;
    const completedLastMonth = locks.filter(
      (l) =>
        l.status === "done" &&
        new Date(l.created_at) >= startOfLastMonth &&
        new Date(l.created_at) <= endOfLastMonth
    ).length;

    // Block rate
    const blockRate = totalLocks > 0 ? Math.round((blockedLocks / totalLocks) * 100) : 0;

    // Team member count
    const { count: teamMemberCount } = await supabase
      .from("organization_members")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", context.organizationId!);

    // Calculate average resolution time for completed locks
    let averageResolutionHours: number | null = null;
    const doneLocks = locks.filter((l) => l.status === "done");
    if (doneLocks.length > 0) {
      const totalHours = doneLocks.reduce((acc, l) => {
        const created = new Date(l.created_at).getTime();
        const updated = new Date(l.updated_at).getTime();
        return acc + (updated - created) / (1000 * 60 * 60);
      }, 0);
      averageResolutionHours = Math.round((totalHours / doneLocks.length) * 10) / 10;
    }

    return {
      totalLocks,
      completedLocks,
      blockedLocks,
      activeLocks,
      completionRate,
      averageResolutionHours,
      averageResponseMinutes: null, // Would need events table query
      blockRate,
      locksThisMonth,
      locksLastMonth,
      completedThisMonth,
      completedLastMonth,
      teamMemberCount: teamMemberCount || 0,
    };
  } catch (error) {
    console.error("Error fetching org analytics:", error);
    return null;
  }
}

/**
 * Fetches all momentum locks for a user (for requests page)
 * Uses Slack user ID to query
 */
export async function getUserMomentumLocks(
  supabase: SupabaseClient,
  slackUserId: string
) {
  const { data: locks, error } = await supabase
    .from("momentum_locks")
    .select("*")
    .or(`owner_user_id.eq.${slackUserId},requester_user_id.eq.${slackUserId}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user locks:", error);
    return [];
  }

  return locks || [];
}

/**
 * Fetches events for a list of lock IDs
 */
export async function getLockEvents(
  supabase: SupabaseClient,
  lockIds: string[]
) {
  if (lockIds.length === 0) return [];

  const { data: events, error } = await supabase
    .from("momentum_lock_events")
    .select("*")
    .in("lock_id", lockIds)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching lock events:", error);
    return [];
  }

  return events || [];
}

/**
 * Calculate activation score for onboarding progress
 */
export function calculateActivationScore(context: UserContext, stats: UserActivityStats): number {
  const steps = [
    context.slackConnected,
    context.hasExpertise,
    context.hasCalendarConnected,
    stats.nudgesSent > 0 || stats.totalLocksCount > 0,
  ];
  return Math.round((steps.filter(Boolean).length / steps.length) * 100);
}
