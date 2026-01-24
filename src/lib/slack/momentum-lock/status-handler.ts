/**
 * Momentum Lock Status Handler
 *
 * Handles the /attunly status command
 * Shows user's open locks (as owner + as requester) in an ephemeral message
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { momentumLocks, MomentumLockStatus } from "@/lib/db/schema";
import { eq, and, inArray, asc } from "drizzle-orm";

export interface StatusCommandParams {
  teamId: string;
  userId: string;
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
 * Get active statuses for status query
 */
const ACTIVE_STATUSES = [
  MomentumLockStatus.ACTIVE,
  MomentumLockStatus.STARTED,
  MomentumLockStatus.BLOCKED,
];

/**
 * Format a single lock for display in the status message
 */
function formatLockForStatus(
  lock: typeof momentumLocks.$inferSelect,
  role: "owner" | "requester"
): string {
  const now = new Date();
  const deadline = new Date(lock.deadlineAt);
  const hoursRemaining = (deadline.getTime() - now.getTime()) / (60 * 60 * 1000);
  const timeText = formatTimeRemaining(hoursRemaining);

  // Status indicator
  const statusIndicator =
    lock.status === MomentumLockStatus.STARTED
      ? " (started)"
      : lock.status === MomentumLockStatus.BLOCKED
        ? " (blocked)"
        : "";

  if (role === "owner") {
    // "Review PR #123" for @alice - Due in 3h
    return `"${lock.requiredOutcome}" for <@${lock.requesterUserId}> - Due in ${timeText}${statusIndicator}`;
  } else {
    // @charlie owes "API spec doc" - Due in 6h (started)
    return `<@${lock.ownerUserId}> owes "${lock.requiredOutcome}" - Due in ${timeText}${statusIndicator}`;
  }
}

/**
 * Build the status response blocks
 */
function buildStatusBlocks(
  ownedLocks: (typeof momentumLocks.$inferSelect)[],
  requestedLocks: (typeof momentumLocks.$inferSelect)[]
): SlackBlock[] {
  const blocks: SlackBlock[] = [];

  // Header
  blocks.push({
    type: "header",
    text: {
      type: "plain_text",
      text: "Your Momentum Locks",
      emoji: false,
    },
  });

  // Empty state
  if (ownedLocks.length === 0 && requestedLocks.length === 0) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "No active locks.\n\nRun `/attunly` to create a new momentum lock.",
      },
    });
    return blocks;
  }

  // Locks I own (need to deliver)
  if (ownedLocks.length > 0) {
    const lockLines = ownedLocks
      .map((lock) => `*·* ${formatLockForStatus(lock, "owner")}`)
      .join("\n");

    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*You owe (${ownedLocks.length} active):*\n${lockLines}`,
      },
    });
  }

  // Locks I requested (waiting on)
  if (requestedLocks.length > 0) {
    // Add divider if there were owned locks
    if (ownedLocks.length > 0) {
      blocks.push({ type: "divider" });
    }

    const lockLines = requestedLocks
      .map((lock) => `*·* ${formatLockForStatus(lock, "requester")}`)
      .join("\n");

    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Waiting on you (${requestedLocks.length} active):*\n${lockLines}`,
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
        text: "Run `/attunly` to create a new lock | `/attunly help` for more commands",
      },
    ],
  });

  return blocks;
}

/**
 * Handle the /attunly status command
 *
 * Returns an ephemeral message showing the user's active locks:
 * - Locks they own (need to deliver)
 * - Locks they requested (waiting on others)
 */
export async function handleStatusCommand(
  params: StatusCommandParams
): Promise<NextResponse> {
  const { teamId, userId } = params;

  console.log("[Status Command] Processing", { teamId, userId });

  try {
    // Query locks in parallel: owned + requested
    const [ownedLocks, requestedLocks] = await Promise.all([
      // Locks I own (need to deliver)
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
      // Locks I requested (waiting on)
      db
        .select()
        .from(momentumLocks)
        .where(
          and(
            eq(momentumLocks.workspaceId, teamId),
            eq(momentumLocks.requesterUserId, userId),
            inArray(momentumLocks.status, ACTIVE_STATUSES)
          )
        )
        .orderBy(asc(momentumLocks.deadlineAt)),
    ]);

    console.log("[Status Command] Found locks", {
      owned: ownedLocks.length,
      requested: requestedLocks.length,
    });

    // Build the response
    const blocks = buildStatusBlocks(ownedLocks, requestedLocks);
    const totalLocks = ownedLocks.length + requestedLocks.length;
    const summaryText =
      totalLocks === 0
        ? "No active momentum locks."
        : `You have ${ownedLocks.length} lock${ownedLocks.length !== 1 ? "s" : ""} to deliver and ${requestedLocks.length} lock${requestedLocks.length !== 1 ? "s" : ""} waiting.`;

    return NextResponse.json({
      response_type: "ephemeral",
      text: summaryText,
      blocks,
    });
  } catch (error) {
    console.error("[Status Command] Error:", error);

    return NextResponse.json({
      response_type: "ephemeral",
      text: "Something went wrong fetching your locks. Please try again.",
    });
  }
}
