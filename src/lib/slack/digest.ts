/**
 * Weekly Digest Generator
 *
 * Builds and sends weekly activity summaries via Slack or Email.
 * Summarizes momentum locks, completions, and team activity.
 */

import { db } from "@/lib/db";
import {
  momentumLocks,
  momentumLockEvents,
  profiles,
  organizations,
} from "@/lib/db/schema";
import { eq, and, gte, or, sql, inArray } from "drizzle-orm";
import { createLogger } from "@/lib/logger";

const log = createLogger({ service: "digest" });

// ============================================
// TYPES
// ============================================

export interface DigestStats {
  weekStart: Date;
  weekEnd: Date;
  locksCreated: number;
  locksCompleted: number;
  locksExpired: number;
  averageCompletionTimeHours: number | null;
  topOwners: Array<{ userId: string; name: string; completed: number }>;
  activeLocksCount: number;
}

export interface UserDigestData {
  userId: string;
  slackUserId: string;
  firstName: string;
  email: string | null;
  stats: {
    locksOwned: number;
    locksRequested: number;
    completedThisWeek: number;
    activeCount: number;
    overdueCount: number;
  };
  activeLocks: Array<{
    id: string;
    requiredOutcome: string;
    deadlineAt: Date;
    isOwner: boolean;
    isOverdue: boolean;
  }>;
}

interface SlackBlock {
  type: string;
  [key: string]: unknown;
}

// ============================================
// DATA FETCHING
// ============================================

/**
 * Get weekly stats for an organization
 */
export async function getWeeklyOrgStats(
  organizationId: string,
  weekStart: Date,
  weekEnd: Date
): Promise<DigestStats | null> {
  try {
    // Get org's Slack team ID
    const org = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (!org[0]?.slackTeamId) {
      return null;
    }

    const slackTeamId = org[0].slackTeamId;

    // Fetch all locks for this org in the time period
    const weekLocks = await db
      .select()
      .from(momentumLocks)
      .where(
        and(
          eq(momentumLocks.workspaceId, slackTeamId),
          gte(momentumLocks.createdAt, weekStart)
        )
      );

    // Count stats
    const locksCreated = weekLocks.length;
    const locksCompleted = weekLocks.filter((l) => l.status === "done").length;
    const locksExpired = weekLocks.filter((l) => l.status === "expired").length;

    // Calculate average completion time
    const completedLocks = weekLocks.filter((l) => l.status === "done");
    let avgTime: number | null = null;
    if (completedLocks.length > 0) {
      const totalMs = completedLocks.reduce((acc, l) => {
        const created = new Date(l.createdAt).getTime();
        const updated = new Date(l.updatedAt).getTime();
        return acc + (updated - created);
      }, 0);
      avgTime = totalMs / completedLocks.length / (1000 * 60 * 60); // hours
    }

    // Get top owners
    const ownerCounts = new Map<string, number>();
    for (const lock of completedLocks) {
      const count = ownerCounts.get(lock.ownerUserId) || 0;
      ownerCounts.set(lock.ownerUserId, count + 1);
    }

    const topOwners = Array.from(ownerCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([userId, completed]) => ({
        userId,
        name: userId, // Will be resolved to display name later
        completed,
      }));

    // Count active locks
    const activeLocks = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(momentumLocks)
      .where(
        and(
          eq(momentumLocks.workspaceId, slackTeamId),
          inArray(momentumLocks.status, ["active", "started", "blocked"])
        )
      );

    return {
      weekStart,
      weekEnd,
      locksCreated,
      locksCompleted,
      locksExpired,
      averageCompletionTimeHours: avgTime,
      topOwners,
      activeLocksCount: activeLocks[0]?.count || 0,
    };
  } catch (error) {
    log.error("Failed to get weekly org stats", { error, organizationId });
    return null;
  }
}

/**
 * Get digest data for a specific user
 */
export async function getUserDigestData(
  slackUserId: string,
  slackTeamId: string,
  weekStart: Date
): Promise<UserDigestData | null> {
  try {
    // Get user profile
    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.slackUserId, slackUserId))
      .limit(1);

    if (!profile[0]) {
      return null;
    }

    const user = profile[0];

    // Get user's locks
    const userLocks = await db
      .select()
      .from(momentumLocks)
      .where(
        and(
          eq(momentumLocks.workspaceId, slackTeamId),
          or(
            eq(momentumLocks.ownerUserId, slackUserId),
            eq(momentumLocks.requesterUserId, slackUserId)
          )
        )
      );

    const now = new Date();
    const activeLocks = userLocks.filter((l) =>
      ["active", "started", "blocked"].includes(l.status)
    );

    const stats = {
      locksOwned: userLocks.filter((l) => l.ownerUserId === slackUserId).length,
      locksRequested: userLocks.filter(
        (l) => l.requesterUserId === slackUserId && l.ownerUserId !== slackUserId
      ).length,
      completedThisWeek: userLocks.filter(
        (l) =>
          l.status === "done" && new Date(l.updatedAt) >= weekStart
      ).length,
      activeCount: activeLocks.length,
      overdueCount: activeLocks.filter(
        (l) => new Date(l.deadlineAt) < now
      ).length,
    };

    return {
      userId: user.userId,
      slackUserId,
      firstName: user.firstName || "there",
      email: user.email,
      stats,
      activeLocks: activeLocks.slice(0, 5).map((l) => ({
        id: l.id,
        requiredOutcome: l.requiredOutcome,
        deadlineAt: new Date(l.deadlineAt),
        isOwner: l.ownerUserId === slackUserId,
        isOverdue: new Date(l.deadlineAt) < now,
      })),
    };
  } catch (error) {
    log.error("Failed to get user digest data", { error, slackUserId });
    return null;
  }
}

// ============================================
// MESSAGE BUILDERS
// ============================================

/**
 * Build Slack digest message for a user
 */
export function buildDigestMessage(data: UserDigestData): {
  text: string;
  blocks: SlackBlock[];
} {
  const { firstName, stats, activeLocks } = data;

  const text = `Your weekly Attunly digest: ${stats.completedThisWeek} completed, ${stats.activeCount} active`;

  const blocks: SlackBlock[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `Weekly Digest`,
        emoji: true,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Hey ${firstName}, here's your Attunly activity this week.`,
      },
    },
    {
      type: "divider",
    },
  ];

  // Stats summary
  blocks.push({
    type: "section",
    fields: [
      {
        type: "mrkdwn",
        text: `*Completed*\n${stats.completedThisWeek}`,
      },
      {
        type: "mrkdwn",
        text: `*Active*\n${stats.activeCount}`,
      },
      {
        type: "mrkdwn",
        text: `*You Own*\n${stats.locksOwned}`,
      },
      {
        type: "mrkdwn",
        text: `*You Requested*\n${stats.locksRequested}`,
      },
    ],
  });

  // Overdue warning
  if (stats.overdueCount > 0) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${stats.overdueCount} overdue* request${stats.overdueCount !== 1 ? "s" : ""} need attention.`,
      },
    });
  }

  blocks.push({ type: "divider" });

  // Active locks
  if (activeLocks.length > 0) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Active Requests*",
      },
    });

    for (const lock of activeLocks) {
      const deadline = lock.deadlineAt;
      const now = new Date();
      const hoursLeft = Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));

      let timeText: string;
      if (lock.isOverdue) {
        timeText = "*Overdue*";
      } else if (hoursLeft < 24) {
        timeText = `${hoursLeft}h left`;
      } else {
        timeText = `${Math.round(hoursLeft / 24)}d left`;
      }

      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${lock.isOwner ? "You own:" : "Waiting on:"} _${lock.requiredOutcome}_\n${timeText}`,
        },
      });
    }
  } else {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*No active requests* - you're all caught up!",
      },
    });
  }

  blocks.push({ type: "divider" });

  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: "Use `/attunly lock` to create a new momentum lock | <https://attunly.com/dashboard|View Dashboard>",
      },
    ],
  });

  return { text, blocks };
}

// ============================================
// SEND FUNCTIONS
// ============================================

/**
 * Send digest via Slack DM
 */
export async function sendSlackDigest(
  slackUserId: string,
  message: { text: string; blocks: SlackBlock[] },
  botToken: string
): Promise<boolean> {
  try {
    // Open DM channel
    const openResponse = await fetch("https://slack.com/api/conversations.open", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ users: slackUserId }),
    });

    const openResult = await openResponse.json();
    if (!openResult.ok) {
      log.error("Failed to open DM channel for digest", { error: openResult.error });
      return false;
    }

    // Send message
    const msgResponse = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel: openResult.channel.id,
        text: message.text,
        blocks: message.blocks,
      }),
    });

    const msgResult = await msgResponse.json();
    if (!msgResult.ok) {
      log.error("Failed to send digest DM", { error: msgResult.error });
      return false;
    }

    return true;
  } catch (error) {
    log.error("Error sending Slack digest", { error });
    return false;
  }
}

// ============================================
// MAIN DIGEST PROCESSOR
// ============================================

/**
 * Process weekly digests for all users in an organization
 */
export async function processWeeklyDigests(
  organizationId: string
): Promise<{ sent: number; failed: number }> {
  log.info("Processing weekly digests", { organizationId });

  const botToken = process.env.SLACK_BOT_TOKEN;
  if (!botToken) {
    log.error("SLACK_BOT_TOKEN not set");
    return { sent: 0, failed: 0 };
  }

  // Get org's Slack team ID
  const org = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);

  if (!org[0]?.slackTeamId) {
    log.error("Organization has no Slack team ID", { organizationId });
    return { sent: 0, failed: 0 };
  }

  const slackTeamId = org[0].slackTeamId;

  // Get all users in the org with Slack connected
  const users = await db
    .select()
    .from(profiles)
    .where(
      and(
        eq(profiles.organizationId, organizationId),
        eq(profiles.slackConnected, true)
      )
    );

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  let sent = 0;
  let failed = 0;

  for (const user of users) {
    if (!user.slackUserId) continue;

    try {
      const digestData = await getUserDigestData(
        user.slackUserId,
        slackTeamId,
        weekStart
      );

      if (!digestData) {
        failed++;
        continue;
      }

      // Skip if user has no activity
      if (
        digestData.stats.activeCount === 0 &&
        digestData.stats.completedThisWeek === 0
      ) {
        continue;
      }

      const message = buildDigestMessage(digestData);
      const success = await sendSlackDigest(user.slackUserId, message, botToken);

      if (success) {
        sent++;
        log.info("Digest sent", { userId: user.userId });
      } else {
        failed++;
      }
    } catch (error) {
      log.error("Failed to process digest for user", { error, userId: user.userId });
      failed++;
    }
  }

  log.info("Weekly digests processed", { organizationId, sent, failed });
  return { sent, failed };
}
