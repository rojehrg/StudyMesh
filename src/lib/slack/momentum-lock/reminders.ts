/**
 * Momentum Lock Reminders
 *
 * Smart reminder and escalation logic for momentum locks.
 * - Sends reminders to owners when deadlines approach
 * - Escalates to fallback owners when needed
 * - Respects timezone and working hours
 */

import { db } from "@/lib/db";
import {
  momentumLocks,
  momentumLockEvents,
  MomentumLockStatus,
  MomentumLockEventType,
} from "@/lib/db/schema";
import { eq, and, lt, gt, isNull, or, lte } from "drizzle-orm";
import { createLogger } from "@/lib/logger";
import {
  buildReminderMessage,
  buildEscalationMessage,
  generateThreadLink,
} from "./messages";

const log = createLogger({ service: "momentum-lock-reminders" });

// ============================================
// TYPES
// ============================================

interface ReminderConfig {
  /** Hours before deadline to send first reminder */
  firstReminderHours: number;
  /** Hours before deadline to send urgent reminder */
  urgentReminderHours: number;
  /** Hours before deadline to escalate to fallback */
  escalationHours: number;
  /** Working hours start (0-23) */
  workingHoursStart: number;
  /** Working hours end (0-23) */
  workingHoursEnd: number;
}

const DEFAULT_CONFIG: ReminderConfig = {
  firstReminderHours: 12,
  urgentReminderHours: 3,
  escalationHours: 1,
  workingHoursStart: 8,
  workingHoursEnd: 18,
};

// ============================================
// TIMEZONE HELPERS
// ============================================

/**
 * Check if current time is within working hours for a timezone
 */
export function isWithinWorkingHours(
  timezone: string | null,
  config: ReminderConfig = DEFAULT_CONFIG
): boolean {
  const now = new Date();

  if (!timezone) {
    // Default to UTC working hours if no timezone
    const utcHour = now.getUTCHours();
    return utcHour >= config.workingHoursStart && utcHour < config.workingHoursEnd;
  }

  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    });
    const hour = parseInt(formatter.format(now), 10);
    return hour >= config.workingHoursStart && hour < config.workingHoursEnd;
  } catch {
    // Invalid timezone, assume within working hours
    log.warn("Invalid timezone", { timezone });
    return true;
  }
}

/**
 * Calculate hours until deadline
 */
export function hoursUntilDeadline(deadlineAt: Date): number {
  const now = new Date();
  const diffMs = deadlineAt.getTime() - now.getTime();
  return diffMs / (1000 * 60 * 60);
}

// ============================================
// SLACK MESSAGING
// ============================================

/**
 * Send a DM to a Slack user
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

// ============================================
// REMINDER LOGIC
// ============================================

/**
 * Process reminders for approaching deadlines
 *
 * Finds active locks where:
 * - Deadline is within firstReminderHours
 * - No reminder has been sent yet (or only first reminder sent)
 * - Owner is within working hours
 */
export async function processReminders(
  config: ReminderConfig = DEFAULT_CONFIG
): Promise<{ sent: number; skipped: number }> {
  const now = new Date();
  const reminderThreshold = new Date(
    now.getTime() + config.firstReminderHours * 60 * 60 * 1000
  );

  // Find active locks approaching deadline
  const locksNeedingReminder = await db
    .select()
    .from(momentumLocks)
    .where(
      and(
        eq(momentumLocks.status, MomentumLockStatus.ACTIVE),
        lt(momentumLocks.deadlineAt, reminderThreshold),
        gt(momentumLocks.deadlineAt, now) // Not yet expired
      )
    );

  let sent = 0;
  let skipped = 0;

  for (const lock of locksNeedingReminder) {
    // Check if owner is within working hours
    if (!isWithinWorkingHours(lock.ownerTimezone, config)) {
      log.debug("Skipping reminder - owner outside working hours", {
        lockId: lock.id,
        timezone: lock.ownerTimezone,
      });
      skipped++;
      continue;
    }

    // Check if we already sent a reminder recently (within last 6 hours)
    const recentEvents = await db
      .select()
      .from(momentumLockEvents)
      .where(
        and(
          eq(momentumLockEvents.lockId, lock.id),
          eq(momentumLockEvents.eventType, "reminder_sent")
        )
      )
      .orderBy(momentumLockEvents.createdAt);

    const lastReminder = recentEvents[recentEvents.length - 1];
    if (lastReminder) {
      const hoursSinceLastReminder =
        (now.getTime() - new Date(lastReminder.createdAt).getTime()) /
        (1000 * 60 * 60);
      if (hoursSinceLastReminder < 6) {
        skipped++;
        continue;
      }
    }

    // Determine reminder urgency
    const hoursLeft = hoursUntilDeadline(new Date(lock.deadlineAt));
    const isUrgent = hoursLeft <= config.urgentReminderHours;

    // Generate thread link
    const threadLink = generateThreadLink(
      lock.workspaceId,
      lock.channelId,
      lock.threadTs
    );

    // Build and send reminder message
    const message = buildReminderMessage(
      {
        ...lock,
        deadlineAt: new Date(lock.deadlineAt),
        createdAt: new Date(lock.createdAt),
        updatedAt: new Date(lock.updatedAt),
        escalationSentAt: lock.escalationSentAt ? new Date(lock.escalationSentAt) : null,
        wakeUpDeliveredAt: lock.wakeUpDeliveredAt ? new Date(lock.wakeUpDeliveredAt) : null,
      },
      threadLink,
      isUrgent
    );

    const messageSent = await sendSlackDM(lock.ownerUserId, message);

    if (messageSent) {
      // Log the event
      await db.insert(momentumLockEvents).values({
        lockId: lock.id,
        eventType: "reminder_sent",
        payload: {
          isUrgent,
          hoursUntilDeadline: hoursLeft,
          sentAt: now.toISOString(),
        },
      });

      sent++;
      log.info("Reminder sent", {
        lockId: lock.id,
        ownerUserId: lock.ownerUserId,
        isUrgent,
        hoursLeft,
      });
    } else {
      skipped++;
    }
  }

  return { sent, skipped };
}

// ============================================
// ESCALATION LOGIC
// ============================================

/**
 * Process escalations for locks that are past deadline or need fallback
 *
 * Escalates to fallback_user_id when:
 * - Lock has a fallback owner
 * - Deadline is within escalationHours
 * - Status is still 'active' (not started/blocked/done)
 * - Escalation hasn't been sent yet
 */
export async function processEscalations(
  config: ReminderConfig = DEFAULT_CONFIG
): Promise<{ escalated: number; skipped: number }> {
  const now = new Date();
  const escalationThreshold = new Date(
    now.getTime() + config.escalationHours * 60 * 60 * 1000
  );

  // Find locks needing escalation
  const locksNeedingEscalation = await db
    .select()
    .from(momentumLocks)
    .where(
      and(
        eq(momentumLocks.status, MomentumLockStatus.ACTIVE),
        isNull(momentumLocks.escalationSentAt),
        lte(momentumLocks.deadlineAt, escalationThreshold)
      )
    );

  let escalated = 0;
  let skipped = 0;

  for (const lock of locksNeedingEscalation) {
    // Must have a fallback owner to escalate
    if (!lock.fallbackUserId) {
      log.debug("Skipping escalation - no fallback user", { lockId: lock.id });
      skipped++;
      continue;
    }

    // Generate thread link
    const threadLink = generateThreadLink(
      lock.workspaceId,
      lock.channelId,
      lock.threadTs
    );

    // Build and send escalation message
    const message = buildEscalationMessage(
      {
        ...lock,
        deadlineAt: new Date(lock.deadlineAt),
        createdAt: new Date(lock.createdAt),
        updatedAt: new Date(lock.updatedAt),
        escalationSentAt: lock.escalationSentAt ? new Date(lock.escalationSentAt) : null,
        wakeUpDeliveredAt: lock.wakeUpDeliveredAt ? new Date(lock.wakeUpDeliveredAt) : null,
      },
      threadLink
    );

    const messageSent = await sendSlackDM(lock.fallbackUserId, message);

    if (messageSent) {
      // Update lock with escalation timestamp
      await db
        .update(momentumLocks)
        .set({ escalationSentAt: now })
        .where(eq(momentumLocks.id, lock.id));

      // Log the event
      await db.insert(momentumLockEvents).values({
        lockId: lock.id,
        eventType: MomentumLockEventType.ESCALATED,
        payload: {
          escalatedTo: lock.fallbackUserId,
          originalOwner: lock.ownerUserId,
          reason: "deadline_approaching",
          escalatedAt: now.toISOString(),
        },
      });

      escalated++;
      log.info("Lock escalated", {
        lockId: lock.id,
        fallbackUserId: lock.fallbackUserId,
        originalOwner: lock.ownerUserId,
      });

      // Also notify the requester about the escalation
      if (lock.requesterUserId !== lock.fallbackUserId) {
        const requesterNotification = {
          text: `Your request has been escalated to <@${lock.fallbackUserId}>`,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Your request has been escalated*\n\n"${lock.requiredOutcome}" was escalated to <@${lock.fallbackUserId}> because the deadline is approaching.`,
              },
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: `${threadLink ? `<${threadLink}|View thread>` : ""}`,
                },
              ],
            },
          ],
        };
        await sendSlackDM(lock.requesterUserId, requesterNotification);
      }
    } else {
      skipped++;
    }
  }

  return { escalated, skipped };
}

// ============================================
// MAIN PROCESSING
// ============================================

/**
 * Run all reminder and escalation processing
 *
 * Call this from a cron job (e.g., every 15 minutes)
 */
export async function processAllRemindersAndEscalations(
  config: ReminderConfig = DEFAULT_CONFIG
): Promise<{
  reminders: { sent: number; skipped: number };
  escalations: { escalated: number; skipped: number };
}> {
  log.info("Starting reminder and escalation processing");

  const [reminders, escalations] = await Promise.all([
    processReminders(config),
    processEscalations(config),
  ]);

  log.info("Reminder and escalation processing complete", {
    remindersSent: reminders.sent,
    remindersSkipped: reminders.skipped,
    escalated: escalations.escalated,
    escalationsSkipped: escalations.skipped,
  });

  return { reminders, escalations };
}
