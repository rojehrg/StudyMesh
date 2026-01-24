/**
 * Standup Handler
 *
 * Handles the /attunly standup command
 * Auto-generates standup content based on user's momentum locks
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { momentumLocks, momentumLockEvents, MomentumLockStatus, MomentumLockEventType } from "@/lib/db/schema";
import { eq, and, or, gte, inArray, desc, asc } from "drizzle-orm";

export interface StandupCommandParams {
  teamId: string;
  userId: string;
  channelId: string;
}

interface SlackBlock {
  type: string;
  [key: string]: unknown;
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
 * Format hours remaining in human-readable format
 */
function formatTimeRemaining(hoursRemaining: number): string {
  if (hoursRemaining < 0) {
    const overdue = Math.abs(hoursRemaining);
    if (overdue < 24) {
      return `${Math.round(overdue)}h overdue`;
    }
    return `${Math.floor(overdue / 24)}d overdue`;
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
 * Build the standup response blocks
 */
function buildStandupBlocks(
  completedLocks: (typeof momentumLocks.$inferSelect)[],
  inProgressLocks: (typeof momentumLocks.$inferSelect)[],
  blockedLocks: (typeof momentumLocks.$inferSelect)[]
): SlackBlock[] {
  const blocks: SlackBlock[] = [];
  const now = new Date();

  // Header
  blocks.push({
    type: "header",
    text: {
      type: "plain_text",
      text: "Your Standup (based on locks)",
      emoji: false,
    },
  });

  // Completed yesterday section
  if (completedLocks.length > 0) {
    const lines = completedLocks
      .map((lock) => `*-* ${lock.requiredOutcome} for <@${lock.requesterUserId}>`)
      .join("\n");

    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Completed yesterday:*\n${lines}`,
      },
    });
  } else {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Completed yesterday:*\nNo locks completed in the last 24h.",
      },
    });
  }

  blocks.push({ type: "divider" });

  // In progress section
  if (inProgressLocks.length > 0) {
    const lines = inProgressLocks
      .map((lock) => {
        const deadline = new Date(lock.deadlineAt);
        const hoursRemaining = (deadline.getTime() - now.getTime()) / (60 * 60 * 1000);
        const timeText = formatTimeRemaining(hoursRemaining);
        const isOverdue = hoursRemaining < 0;
        return `*-* "${lock.requiredOutcome}" for <@${lock.requesterUserId}> - ${isOverdue ? "*" + timeText + "*" : "Due in " + timeText}`;
      })
      .join("\n");

    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*In progress:*\n${lines}`,
      },
    });
  } else {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*In progress:*\nNo active locks in progress.",
      },
    });
  }

  // Blocked section
  if (blockedLocks.length > 0) {
    blocks.push({ type: "divider" });

    const lines = blockedLocks
      .map((lock) => `*-* "${lock.requiredOutcome}" - waiting on <@${lock.requesterUserId}>`)
      .join("\n");

    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Blocked:*\n${lines}`,
      },
    });
  }

  // Generate copyable text
  blocks.push({ type: "divider" });

  // Create plain text version for copying
  let plainText = "**Completed yesterday:**\n";
  if (completedLocks.length > 0) {
    completedLocks.forEach((lock) => {
      plainText += `- ${lock.requiredOutcome}\n`;
    });
  } else {
    plainText += "- (none)\n";
  }

  plainText += "\n**In progress:**\n";
  if (inProgressLocks.length > 0) {
    inProgressLocks.forEach((lock) => {
      const deadline = new Date(lock.deadlineAt);
      const hoursRemaining = (deadline.getTime() - now.getTime()) / (60 * 60 * 1000);
      const timeText = formatTimeRemaining(hoursRemaining);
      plainText += `- ${lock.requiredOutcome} (due in ${timeText})\n`;
    });
  } else {
    plainText += "- (none)\n";
  }

  if (blockedLocks.length > 0) {
    plainText += "\n**Blocked:**\n";
    blockedLocks.forEach((lock) => {
      plainText += `- ${lock.requiredOutcome}\n`;
    });
  }

  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: "Tip: Use `/attunly` to create a lock for today's work.",
      },
    ],
  });

  return blocks;
}

/**
 * Handle the /attunly standup command
 *
 * Returns an ephemeral message showing:
 * - Locks completed in the last 24 hours
 * - Currently active locks (in progress)
 * - Blocked locks
 */
export async function handleStandupCommand(
  params: StandupCommandParams
): Promise<NextResponse> {
  const { teamId, userId } = params;

  console.log("[Standup Command] Processing", { teamId, userId });

  try {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Query all relevant locks in parallel
    const [completedLocks, activeLocks] = await Promise.all([
      // Locks completed in the last 24 hours where user was owner
      db
        .select()
        .from(momentumLocks)
        .where(
          and(
            eq(momentumLocks.workspaceId, teamId),
            eq(momentumLocks.ownerUserId, userId),
            eq(momentumLocks.status, MomentumLockStatus.DONE),
            gte(momentumLocks.updatedAt, yesterday)
          )
        )
        .orderBy(desc(momentumLocks.updatedAt)),

      // Currently active locks where user is owner
      db
        .select()
        .from(momentumLocks)
        .where(
          and(
            eq(momentumLocks.workspaceId, teamId),
            eq(momentumLocks.ownerUserId, userId),
            inArray(momentumLocks.status, ACTIVE_STATUSES)
          )
        )
        .orderBy(asc(momentumLocks.deadlineAt)),
    ]);

    console.log("[Standup Command] Found locks", {
      completed: completedLocks.length,
      active: activeLocks.length,
    });

    // Separate in-progress from blocked
    const inProgressLocks = activeLocks.filter(
      (lock) =>
        lock.status === MomentumLockStatus.ACTIVE ||
        lock.status === MomentumLockStatus.STARTED
    );
    const blockedLocks = activeLocks.filter(
      (lock) => lock.status === MomentumLockStatus.BLOCKED
    );

    // Build response
    const blocks = buildStandupBlocks(
      completedLocks,
      inProgressLocks,
      blockedLocks
    );

    const summaryText = `Standup: ${completedLocks.length} done yesterday, ${inProgressLocks.length} in progress, ${blockedLocks.length} blocked.`;

    return NextResponse.json({
      response_type: "ephemeral",
      text: summaryText,
      blocks,
    });
  } catch (error) {
    console.error("[Standup Command] Error:", error);

    return NextResponse.json({
      response_type: "ephemeral",
      text: "Something went wrong. Please try again.",
    });
  }
}
