/**
 * Momentum Lock Escalation System
 *
 * Handles escalation chain logic for momentum locks:
 * - Determines escalation targets based on chain configuration
 * - Evaluates when escalation should occur (75% deadline passed or explicit request)
 * - Executes escalations and logs events
 * - Supports pausing/resuming auto-escalation
 */

import { db } from "@/lib/db";
import {
  momentumLocks,
  momentumLockEvents,
  MomentumLockEventType,
  MomentumLockStatus,
  type MomentumLock,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createLogger } from "@/lib/logger";
import {
  buildEscalationNotification,
  generateThreadLink,
} from "./messages";

const log = createLogger({ service: "momentum-lock" });

// ============================================
// TYPES
// ============================================

export interface EscalationTarget {
  userId: string;
  level: number;
  isLastInChain: boolean;
}

export interface EscalationResult {
  success: boolean;
  escalatedTo?: string;
  newLevel?: number;
  error?: string;
}

// ============================================
// ESCALATION TARGET LOGIC
// ============================================

/**
 * Determine the next escalation target in the chain
 *
 * Returns the next person in the escalation chain based on current level.
 * If no chain exists, falls back to the fallbackUserId.
 */
export function determineEscalationTarget(lock: MomentumLock): EscalationTarget | null {
  const currentLevel = lock.currentEscalationLevel ?? 0;
  const chain = lock.escalationChain ?? [];

  // If we have an escalation chain, use it
  if (chain.length > 0) {
    const nextLevel = currentLevel + 1;

    // Check if there's a next person in the chain
    if (nextLevel <= chain.length) {
      const targetUserId = chain[nextLevel - 1]; // Chain is 0-indexed, level starts at 1
      return {
        userId: targetUserId,
        level: nextLevel,
        isLastInChain: nextLevel >= chain.length,
      };
    }

    // Reached end of chain
    return null;
  }

  // Fallback to legacy single fallback user
  if (lock.fallbackUserId && currentLevel === 0) {
    return {
      userId: lock.fallbackUserId,
      level: 1,
      isLastInChain: true,
    };
  }

  return null;
}

/**
 * Get the current escalation recipient (who currently has responsibility)
 */
export function getCurrentEscalationRecipient(lock: MomentumLock): string {
  const currentLevel = lock.currentEscalationLevel ?? 0;
  const chain = lock.escalationChain ?? [];

  if (currentLevel === 0) {
    return lock.ownerUserId;
  }

  if (chain.length > 0 && currentLevel <= chain.length) {
    return chain[currentLevel - 1];
  }

  // Fallback to legacy
  if (lock.fallbackUserId && currentLevel === 1) {
    return lock.fallbackUserId;
  }

  return lock.ownerUserId;
}

// ============================================
// ESCALATION TIMING LOGIC
// ============================================

/**
 * Calculate the percentage of time elapsed towards deadline
 */
export function calculateDeadlineProgress(lock: MomentumLock): number {
  const now = new Date();
  const created = new Date(lock.createdAt);
  const deadline = new Date(lock.deadlineAt);

  const totalDuration = deadline.getTime() - created.getTime();
  const elapsed = now.getTime() - created.getTime();

  if (totalDuration <= 0) return 100;

  return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
}

/**
 * Determine if a lock should be escalated
 *
 * Escalation triggers:
 * 1. 75% of deadline has passed with no status change from 'active'
 * 2. Explicit request from requester (handled separately via action)
 *
 * Escalation is blocked if:
 * - Lock status is not 'active'
 * - Escalation is paused
 * - No escalation target available
 * - Escalation was already sent recently (within 1 hour)
 */
export function shouldEscalate(lock: MomentumLock): {
  shouldEscalate: boolean;
  reason?: string;
  skipReason?: string;
} {
  // Only escalate active locks
  if (lock.status !== MomentumLockStatus.ACTIVE) {
    return {
      shouldEscalate: false,
      skipReason: `Lock status is '${lock.status}', not 'active'`,
    };
  }

  // Check if escalation is paused
  if (lock.escalationPaused) {
    return {
      shouldEscalate: false,
      skipReason: "Escalation is paused for this lock",
    };
  }

  // Check if there's a target to escalate to
  const target = determineEscalationTarget(lock);
  if (!target) {
    return {
      shouldEscalate: false,
      skipReason: "No escalation target available (end of chain)",
    };
  }

  // Check if escalation was sent recently (within 1 hour)
  if (lock.escalationSentAt) {
    const hoursSinceLastEscalation =
      (Date.now() - new Date(lock.escalationSentAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastEscalation < 1) {
      return {
        shouldEscalate: false,
        skipReason: `Escalation sent ${Math.round(hoursSinceLastEscalation * 60)} minutes ago`,
      };
    }
  }

  // Calculate deadline progress
  const progress = calculateDeadlineProgress(lock);

  // Escalate at 75% threshold
  if (progress >= 75) {
    return {
      shouldEscalate: true,
      reason: `${Math.round(progress)}% of deadline elapsed`,
    };
  }

  return {
    shouldEscalate: false,
    skipReason: `Only ${Math.round(progress)}% of deadline elapsed (threshold: 75%)`,
  };
}

// ============================================
// ESCALATION EXECUTION
// ============================================

/**
 * Send a Slack DM
 */
async function sendSlackDM(
  userId: string,
  message: { text: string; blocks: unknown[] },
  botToken?: string
): Promise<boolean> {
  const token = botToken || process.env.SLACK_BOT_TOKEN;
  if (!token) {
    log.error("SLACK_BOT_TOKEN not set");
    return false;
  }

  try {
    // Open DM channel
    const openResponse = await fetch("https://slack.com/api/conversations.open", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ users: userId }),
    });

    const openResult = await openResponse.json();
    if (!openResult.ok) {
      log.error("Failed to open DM channel", { error: openResult.error, userId });
      return false;
    }

    // Send message
    const msgResponse = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
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
      log.error("Failed to send DM", { error: msgResult.error, userId });
      return false;
    }

    return true;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    log.error("Error sending DM", { error: errorMessage, userId });
    return false;
  }
}

/**
 * Execute an escalation to a target user
 *
 * Steps:
 * 1. Send notification to the escalation target
 * 2. Update the lock's escalation level and timestamp
 * 3. Log the escalation event
 * 4. Optionally notify the requester
 */
export async function executeEscalation(
  lock: MomentumLock,
  targetUserId: string,
  newLevel: number,
  reason: string = "deadline_approaching"
): Promise<EscalationResult> {
  const now = new Date();

  try {
    // Generate thread link
    const threadLink = generateThreadLink(
      lock.workspaceId,
      lock.channelId,
      lock.threadTs
    );

    // Build escalation notification message
    const message = buildEscalationNotification(
      {
        ...lock,
        deadlineAt: new Date(lock.deadlineAt),
        createdAt: new Date(lock.createdAt),
        updatedAt: new Date(lock.updatedAt),
        escalationSentAt: lock.escalationSentAt ? new Date(lock.escalationSentAt) : null,
        wakeUpDeliveredAt: lock.wakeUpDeliveredAt ? new Date(lock.wakeUpDeliveredAt) : null,
      },
      threadLink,
      newLevel
    );

    // Send notification to escalation target
    const sent = await sendSlackDM(targetUserId, message);
    if (!sent) {
      return {
        success: false,
        error: "Failed to send escalation notification",
      };
    }

    // Update the lock
    await db
      .update(momentumLocks)
      .set({
        escalationSentAt: now,
        currentEscalationLevel: newLevel,
        updatedAt: now,
      })
      .where(eq(momentumLocks.id, lock.id));

    // Log the escalation event
    await db.insert(momentumLockEvents).values({
      lockId: lock.id,
      eventType: MomentumLockEventType.ESCALATION_TRIGGERED,
      payload: {
        escalatedTo: targetUserId,
        previousOwner: getCurrentEscalationRecipient(lock),
        escalationLevel: newLevel,
        reason,
        triggeredAt: now.toISOString(),
      },
    });

    log.info("Escalation executed", {
      lockId: lock.id,
      targetUserId,
      newLevel,
      reason,
    });

    // Notify requester about escalation (if different from target)
    if (lock.requesterUserId !== targetUserId) {
      const requesterNotification = {
        text: `Your request has been escalated to <@${targetUserId}>`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Your request has been escalated*\n\n"${lock.requiredOutcome}" was escalated to <@${targetUserId}> because the deadline is approaching.`,
            },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: threadLink
                  ? `<${threadLink}|View thread> | Escalation level: ${newLevel}`
                  : `Escalation level: ${newLevel}`,
              },
            ],
          },
        ],
      };
      await sendSlackDM(lock.requesterUserId, requesterNotification);
    }

    return {
      success: true,
      escalatedTo: targetUserId,
      newLevel,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    log.error("Escalation failed", { lockId: lock.id, error: errorMessage });
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ============================================
// ESCALATION CONTROL
// ============================================

/**
 * Pause auto-escalation for a lock
 */
export async function pauseEscalation(
  lockId: string,
  actorUserId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date();

    // Update the lock
    await db
      .update(momentumLocks)
      .set({
        escalationPaused: true,
        updatedAt: now,
      })
      .where(eq(momentumLocks.id, lockId));

    // Log the event
    await db.insert(momentumLockEvents).values({
      lockId,
      eventType: MomentumLockEventType.ESCALATION_PAUSED,
      actorUserId,
      payload: {
        pausedAt: now.toISOString(),
      },
    });

    log.info("Escalation paused", { lockId, actorUserId });

    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    log.error("Failed to pause escalation", { lockId, error: errorMessage });
    return { success: false, error: errorMessage };
  }
}

/**
 * Resume auto-escalation for a lock
 */
export async function resumeEscalation(
  lockId: string,
  actorUserId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date();

    // Update the lock
    await db
      .update(momentumLocks)
      .set({
        escalationPaused: false,
        updatedAt: now,
      })
      .where(eq(momentumLocks.id, lockId));

    // Log the event
    await db.insert(momentumLockEvents).values({
      lockId,
      eventType: MomentumLockEventType.ESCALATION_RESUMED,
      actorUserId,
      payload: {
        resumedAt: now.toISOString(),
      },
    });

    log.info("Escalation resumed", { lockId, actorUserId });

    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    log.error("Failed to resume escalation", { lockId, error: errorMessage });
    return { success: false, error: errorMessage };
  }
}

/**
 * Manually trigger escalation (e.g., from requester action)
 */
export async function triggerManualEscalation(
  lockId: string,
  actorUserId: string
): Promise<EscalationResult> {
  // Fetch the lock
  const [lock] = await db
    .select()
    .from(momentumLocks)
    .where(eq(momentumLocks.id, lockId))
    .limit(1);

  if (!lock) {
    return { success: false, error: "Lock not found" };
  }

  // Get next target
  const target = determineEscalationTarget(lock);
  if (!target) {
    return { success: false, error: "No escalation target available" };
  }

  // Execute escalation
  return executeEscalation(
    {
      ...lock,
      deadlineAt: new Date(lock.deadlineAt),
      createdAt: new Date(lock.createdAt),
      updatedAt: new Date(lock.updatedAt),
      escalationSentAt: lock.escalationSentAt ? new Date(lock.escalationSentAt) : null,
      wakeUpDeliveredAt: lock.wakeUpDeliveredAt ? new Date(lock.wakeUpDeliveredAt) : null,
    },
    target.userId,
    target.level,
    `manual_escalation_by_${actorUserId}`
  );
}
