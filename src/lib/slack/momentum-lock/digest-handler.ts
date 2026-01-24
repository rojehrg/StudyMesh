/**
 * Digest Handler
 *
 * Handles the /attunly digest command
 * Shows weekly activity summary for the user and their team
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { momentumLocks, profiles, MomentumLockStatus } from "@/lib/db/schema";
import { eq, and, gte, or, inArray, sql } from "drizzle-orm";

export interface DigestCommandParams {
  teamId: string;
  userId: string;
  channelId: string;
}

interface SlackBlock {
  type: string;
  [key: string]: unknown;
}

interface UserWeeklyStats {
  locksCompleted: number;
  locksCreated: number;
  avgCompletionHours: number | null;
}

interface TeamWeeklyStats {
  completionRate: number;
  topCompleters: Array<{ slackUserId: string; count: number }>;
  activeLocks: number;
}

/**
 * Get active statuses for query
 */
const ACTIVE_STATUSES = [
  MomentumLockStatus.ACTIVE,
  MomentumLockStatus.STARTED,
  MomentumLockStatus.BLOCKED,
];

/**
 * Format date range for display
 */
function formatDateRange(start: Date, end: Date): string {
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const startStr = start.toLocaleDateString("en-US", options);
  const endStr = end.toLocaleDateString("en-US", options);
  return `${startStr} - ${endStr}`;
}

/**
 * Calculate user's weekly stats
 */
async function getUserWeeklyStats(
  teamId: string,
  userId: string,
  weekStart: Date
): Promise<UserWeeklyStats> {
  // Get locks completed by user this week
  const completedLocks = await db
    .select()
    .from(momentumLocks)
    .where(
      and(
        eq(momentumLocks.workspaceId, teamId),
        eq(momentumLocks.ownerUserId, userId),
        eq(momentumLocks.status, MomentumLockStatus.DONE),
        gte(momentumLocks.updatedAt, weekStart)
      )
    );

  // Get locks created by user this week
  const createdLocks = await db
    .select()
    .from(momentumLocks)
    .where(
      and(
        eq(momentumLocks.workspaceId, teamId),
        eq(momentumLocks.requesterUserId, userId),
        gte(momentumLocks.createdAt, weekStart)
      )
    );

  // Calculate average completion time
  let avgCompletionHours: number | null = null;
  if (completedLocks.length > 0) {
    const totalMs = completedLocks.reduce((acc, lock) => {
      const created = new Date(lock.createdAt).getTime();
      const updated = new Date(lock.updatedAt).getTime();
      return acc + (updated - created);
    }, 0);
    avgCompletionHours = Math.round((totalMs / completedLocks.length / (1000 * 60 * 60)) * 10) / 10;
  }

  return {
    locksCompleted: completedLocks.length,
    locksCreated: createdLocks.length,
    avgCompletionHours,
  };
}

/**
 * Calculate team weekly stats
 */
async function getTeamWeeklyStats(
  teamId: string,
  weekStart: Date
): Promise<TeamWeeklyStats> {
  // Get all team locks this week
  const weekLocks = await db
    .select()
    .from(momentumLocks)
    .where(
      and(
        eq(momentumLocks.workspaceId, teamId),
        gte(momentumLocks.createdAt, weekStart)
      )
    );

  // Calculate completion rate
  const completedLocks = weekLocks.filter((l) => l.status === MomentumLockStatus.DONE);
  const expiredLocks = weekLocks.filter((l) => l.status === MomentumLockStatus.EXPIRED);
  const finishedLocks = completedLocks.length + expiredLocks.length;
  const completionRate = finishedLocks > 0 ? Math.round((completedLocks.length / finishedLocks) * 100) : 0;

  // Get top completers
  const ownerCounts = new Map<string, number>();
  for (const lock of completedLocks) {
    const count = ownerCounts.get(lock.ownerUserId) || 0;
    ownerCounts.set(lock.ownerUserId, count + 1);
  }

  const topCompleters = Array.from(ownerCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([slackUserId, count]) => ({ slackUserId, count }));

  // Count currently active locks
  const activeLocks = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(momentumLocks)
    .where(
      and(
        eq(momentumLocks.workspaceId, teamId),
        inArray(momentumLocks.status, ACTIVE_STATUSES)
      )
    );

  return {
    completionRate,
    topCompleters,
    activeLocks: activeLocks[0]?.count || 0,
  };
}

/**
 * Build the digest response blocks
 */
function buildDigestBlocks(
  dateRange: string,
  userStats: UserWeeklyStats,
  teamStats: TeamWeeklyStats
): SlackBlock[] {
  const blocks: SlackBlock[] = [];

  // Header
  blocks.push({
    type: "header",
    text: {
      type: "plain_text",
      text: `Weekly Digest (${dateRange})`,
      emoji: false,
    },
  });

  // User stats section
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: "*Your Stats:*",
    },
  });

  const avgTimeText = userStats.avgCompletionHours
    ? `${userStats.avgCompletionHours}h`
    : "N/A";

  blocks.push({
    type: "section",
    fields: [
      {
        type: "mrkdwn",
        text: `*Completed*\n${userStats.locksCompleted} locks`,
      },
      {
        type: "mrkdwn",
        text: `*Created*\n${userStats.locksCreated} locks`,
      },
      {
        type: "mrkdwn",
        text: `*Avg completion*\n${avgTimeText}`,
      },
    ],
  });

  blocks.push({ type: "divider" });

  // Team stats section
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: "*Team Stats:*",
    },
  });

  blocks.push({
    type: "section",
    fields: [
      {
        type: "mrkdwn",
        text: `*Completion rate*\n${teamStats.completionRate}%`,
      },
      {
        type: "mrkdwn",
        text: `*Active now*\n${teamStats.activeLocks} locks`,
      },
    ],
  });

  // Top completers
  if (teamStats.topCompleters.length > 0) {
    const topText = teamStats.topCompleters
      .map((c) => `<@${c.slackUserId}> (${c.count})`)
      .join(", ");

    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Top completers:* ${topText}`,
      },
    });
  }

  // Footer
  blocks.push({ type: "divider" });
  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: "Run `/attunly` to create a new lock | `/attunly status` to see your active locks",
      },
    ],
  });

  return blocks;
}

/**
 * Handle the /attunly digest command
 *
 * Returns an ephemeral message showing:
 * - User's weekly stats (completed, created, avg time)
 * - Team stats (completion rate, top completers, active locks)
 */
export async function handleDigestCommand(
  params: DigestCommandParams
): Promise<NextResponse> {
  const { teamId, userId } = params;

  console.log("[Digest Command] Processing", { teamId, userId });

  try {
    // Calculate week start (7 days ago)
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get stats in parallel
    const [userStats, teamStats] = await Promise.all([
      getUserWeeklyStats(teamId, userId, weekStart),
      getTeamWeeklyStats(teamId, weekStart),
    ]);

    console.log("[Digest Command] Stats", { userStats, teamStats });

    // Format date range
    const dateRange = formatDateRange(weekStart, now);

    // Build response
    const blocks = buildDigestBlocks(dateRange, userStats, teamStats);

    const summaryText = `Weekly digest: ${userStats.locksCompleted} completed, ${userStats.locksCreated} created. Team at ${teamStats.completionRate}% completion.`;

    return NextResponse.json({
      response_type: "ephemeral",
      text: summaryText,
      blocks,
    });
  } catch (error) {
    console.error("[Digest Command] Error:", error);

    return NextResponse.json({
      response_type: "ephemeral",
      text: "Something went wrong. Please try again.",
    });
  }
}
