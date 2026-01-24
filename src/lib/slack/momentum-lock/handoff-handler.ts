/**
 * Handoff Handler
 *
 * Handles the /attunly handoff @user command
 * Shows EOD handoff summary between two users - active locks in both directions
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { momentumLocks, profiles, MomentumLockStatus } from "@/lib/db/schema";
import { eq, and, or, inArray, asc, isNotNull } from "drizzle-orm";
import { getTimezoneHourDiff, getCurrentHourInTimezone } from "@/lib/timezone-utils";
import { getTimezoneAbbrev, getCurrentTimeFormatted } from "@/lib/availability";

export interface HandoffCommandParams {
  teamId: string;
  userId: string;
  targetUserId: string;
  channelId: string;
}

interface SlackBlock {
  type: string;
  [key: string]: unknown;
}

/**
 * Format hours remaining in human-readable format
 */
function formatTimeRemaining(hoursRemaining: number): string {
  if (hoursRemaining < 0) {
    return "overdue";
  }
  if (hoursRemaining < 1) {
    const minutes = Math.round(hoursRemaining * 60);
    return minutes <= 1 ? "less than a minute" : `${minutes}m`;
  }
  if (hoursRemaining < 24) {
    const hours = Math.round(hoursRemaining);
    return `${hours}h`;
  }
  const days = Math.floor(hoursRemaining / 24);
  const remainingHours = Math.round(hoursRemaining % 24);
  if (remainingHours === 0) {
    return `${days}d`;
  }
  return `${days}d ${remainingHours}h`;
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
 * Format a lock for the handoff message
 */
function formatLockForHandoff(
  lock: typeof momentumLocks.$inferSelect
): string {
  const now = new Date();
  const deadline = new Date(lock.deadlineAt);
  const hoursRemaining = (deadline.getTime() - now.getTime()) / (60 * 60 * 1000);
  const timeText = formatTimeRemaining(hoursRemaining);

  const statusIndicator =
    lock.status === MomentumLockStatus.STARTED
      ? " (started)"
      : lock.status === MomentumLockStatus.BLOCKED
        ? " (blocked)"
        : "";

  return `"${lock.requiredOutcome}" - Due in ${timeText}${statusIndicator}`;
}

/**
 * Build the handoff response blocks
 */
function buildHandoffBlocks(
  targetUserId: string,
  youOweTarget: (typeof momentumLocks.$inferSelect)[],
  targetOwesYou: (typeof momentumLocks.$inferSelect)[],
  userTz: string | null,
  targetTz: string | null
): SlackBlock[] {
  const blocks: SlackBlock[] = [];

  // Header
  blocks.push({
    type: "header",
    text: {
      type: "plain_text",
      text: `Handoff to @${targetUserId.substring(0, 8)}`,
      emoji: false,
    },
  });

  // You owe target section
  if (youOweTarget.length > 0) {
    const lines = youOweTarget
      .map((lock) => `*-* ${formatLockForHandoff(lock)}`)
      .join("\n");

    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*You owe <@${targetUserId}> (${youOweTarget.length} active):*\n${lines}`,
      },
    });
  } else {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*You owe <@${targetUserId}>:*\nNo active locks.`,
      },
    });
  }

  blocks.push({ type: "divider" });

  // Target owes you section
  if (targetOwesYou.length > 0) {
    const lines = targetOwesYou
      .map((lock) => `*-* ${formatLockForHandoff(lock)}`)
      .join("\n");

    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*<@${targetUserId}> owes you (${targetOwesYou.length} active):*\n${lines}`,
      },
    });
  } else {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*<@${targetUserId}> owes you:*\nNo active locks.`,
      },
    });
  }

  // Timezone context
  if (userTz && targetTz) {
    const hourDiff = getTimezoneHourDiff(userTz, targetTz);
    const targetTime = getCurrentTimeFormatted(targetTz);
    const targetAbbrev = getTimezoneAbbrev(targetTz);

    let tzContext = "";
    if (Math.abs(hourDiff) < 0.5) {
      tzContext = `You're in the same timezone. It's ${targetTime} ${targetAbbrev} for them.`;
    } else {
      const diffDirection = hourDiff > 0 ? "ahead" : "behind";
      const diffHours = Math.abs(Math.round(hourDiff));
      tzContext = `<@${targetUserId}> is ${diffHours}h ${diffDirection}. It's ${targetTime} ${targetAbbrev} for them.`;

      // Add context about what happens when you sign off
      const userHour = getCurrentHourInTimezone(userTz);
      if (userHour >= 16 && userHour <= 19 && hourDiff < 0) {
        // User is ending their day and target is behind
        const targetHour = getCurrentHourInTimezone(targetTz);
        tzContext += ` When you sign off, it's ${targetHour < 12 ? "morning" : "afternoon"} for them.`;
      }
    }

    blocks.push({ type: "divider" });
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: tzContext,
        },
      ],
    });
  }

  // Footer with tips
  if (youOweTarget.length === 0 && targetOwesYou.length === 0) {
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "No active locks between you. Run `/attunly` to create a new momentum lock.",
        },
      ],
    });
  }

  return blocks;
}

/**
 * Handle the /attunly handoff @user command
 *
 * Returns an ephemeral message showing:
 * - Locks you owe to the target user
 * - Locks the target user owes you
 * - Timezone context
 */
export async function handleHandoffCommand(
  params: HandoffCommandParams
): Promise<NextResponse> {
  const { teamId, userId, targetUserId, channelId } = params;

  console.log("[Handoff Command] Processing", { teamId, userId, targetUserId });

  if (userId === targetUserId) {
    return NextResponse.json({
      response_type: "ephemeral",
      text: "You can't handoff to yourself. Use `/attunly status` to see your locks.",
    });
  }

  try {
    // Query locks and user profiles in parallel
    const [youOweTarget, targetOwesYou, userProfiles] = await Promise.all([
      // Locks where you are owner and they are requester
      db
        .select()
        .from(momentumLocks)
        .where(
          and(
            eq(momentumLocks.workspaceId, teamId),
            eq(momentumLocks.ownerUserId, userId),
            eq(momentumLocks.requesterUserId, targetUserId),
            inArray(momentumLocks.status, ACTIVE_STATUSES)
          )
        )
        .orderBy(asc(momentumLocks.deadlineAt)),

      // Locks where they are owner and you are requester
      db
        .select()
        .from(momentumLocks)
        .where(
          and(
            eq(momentumLocks.workspaceId, teamId),
            eq(momentumLocks.ownerUserId, targetUserId),
            eq(momentumLocks.requesterUserId, userId),
            inArray(momentumLocks.status, ACTIVE_STATUSES)
          )
        )
        .orderBy(asc(momentumLocks.deadlineAt)),

      // Get both users' profiles for timezone info with defensive checks
      db
        .select({
          slackUserId: profiles.slackUserId,
          timezone: profiles.timezone,
        })
        .from(profiles)
        .where(
          and(
            eq(profiles.slackTeamId, teamId),
            isNotNull(profiles.slackUserId),
            isNotNull(profiles.timezone),
            or(
              eq(profiles.slackUserId, userId),
              eq(profiles.slackUserId, targetUserId)
            )
          )
        ),
    ]);

    console.log("[Handoff Command] Found locks", {
      youOweTarget: youOweTarget.length,
      targetOwesYou: targetOwesYou.length,
    });

    // Extract timezones
    const userProfile = userProfiles.find((p) => p.slackUserId === userId);
    const targetProfile = userProfiles.find((p) => p.slackUserId === targetUserId);
    const userTz = userProfile?.timezone || null;
    const targetTz = targetProfile?.timezone || null;

    // Build response
    const blocks = buildHandoffBlocks(
      targetUserId,
      youOweTarget,
      targetOwesYou,
      userTz,
      targetTz
    );

    const totalLocks = youOweTarget.length + targetOwesYou.length;
    const summaryText =
      totalLocks === 0
        ? `No active locks between you and this user.`
        : `${youOweTarget.length} lock${youOweTarget.length !== 1 ? "s" : ""} you owe, ${targetOwesYou.length} lock${targetOwesYou.length !== 1 ? "s" : ""} they owe you.`;

    return NextResponse.json({
      response_type: "ephemeral",
      text: summaryText,
      blocks,
    });
  } catch (error) {
    console.error("[Handoff Command] Error:", error);

    return NextResponse.json({
      response_type: "ephemeral",
      text: "Something went wrong. Please try again.",
    });
  }
}
