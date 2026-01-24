/**
 * Momentum Locks Cron Job
 *
 * Processes:
 * - Expirations: Marks locks as expired when deadline passes
 * - Wake-up deliveries: Sends DMs when owner comes online (timezone-aware)
 * - Escalations: Notifies fallback owner when deadline approaches
 * - Reminders: Sends friendly/urgent reminders based on deadline proximity
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { momentumLocks, momentumLockEvents, MomentumLockStatus } from '@/lib/db/schema';
import { eq, and, isNull, lt, gt } from 'drizzle-orm';
import { createLogger } from '@/lib/logger';
import {
  buildWakeUpMessage,
  buildProactiveDeadlineAlert,
  shouldSendProactiveAlert,
  generateThreadLink,
} from '@/lib/slack/momentum-lock/messages';
import { processAllRemindersAndEscalations } from '@/lib/slack/momentum-lock/reminders';
import {
  shouldEscalate,
  determineEscalationTarget,
  executeEscalation,
} from '@/lib/slack/momentum-lock/escalation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max

const log = createLogger({ service: 'momentum-lock' });

/**
 * Verify the cron request is legitimate
 * Security: Requires CRON_SECRET in production to prevent external triggers
 */
function verifyCronRequest(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const vercelCron = request.headers.get('x-vercel-cron');

  // In development, allow all requests
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // Production security: require CRON_SECRET to be set
  if (!cronSecret) {
    log.error('CRON_SECRET not configured - rejecting cron request for security');
    return false;
  }

  // Accept requests with valid Bearer token
  if (authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  // Accept Vercel cron requests but only if they also have the secret in query params
  // This allows Vercel's cron to work while preventing external header spoofing
  const url = new URL(request.url);
  const querySecret = url.searchParams.get('secret');
  if (vercelCron === '1' && querySecret === cronSecret) {
    return true;
  }

  log.warn('Unauthorized cron request attempt', {
    hasAuthHeader: !!authHeader,
    hasVercelCron: vercelCron === '1',
  });

  return false;
}

/**
 * Check if a user is likely "awake" based on timezone
 *
 * Simple heuristic: working hours are 8am-6pm in their timezone
 */
function isUserAwake(timezone?: string | null): boolean {
  const now = new Date();

  if (!timezone) {
    // If no timezone, assume they're awake during UTC business hours
    const utcHour = now.getUTCHours();
    return utcHour >= 8 && utcHour < 18;
  }

  try {
    const userTime = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    }).format(now);

    const hour = parseInt(userTime, 10);
    return hour >= 8 && hour < 18;
  } catch {
    // Invalid timezone, assume awake
    return true;
  }
}

/**
 * Send a DM to a Slack user
 */
async function sendDM(
  userId: string,
  message: { text: string; blocks: any[] }
): Promise<boolean> {
  const botToken = process.env.SLACK_BOT_TOKEN;
  if (!botToken) {
    log.error('SLACK_BOT_TOKEN not set');
    return false;
  }

  try {
    // Open DM channel
    const openResponse = await fetch('https://slack.com/api/conversations.open', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ users: userId }),
    });

    const openResult = await openResponse.json();
    if (!openResult.ok) {
      log.error('Failed to open DM channel', { error: openResult.error, userId });
      return false;
    }

    // Send message
    const msgResponse = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: openResult.channel.id,
        text: message.text,
        blocks: message.blocks,
      }),
    });

    const msgResult = await msgResponse.json();
    if (!msgResult.ok) {
      log.error('Failed to send DM', { error: msgResult.error, userId });
      return false;
    }

    return true;
  } catch (error: any) {
    log.error('Error sending DM', { error: error.message, userId });
    return false;
  }
}

/**
 * Process wake-up deliveries
 *
 * Find active locks where:
 * - wake_up_delivered_at IS NULL
 * - Owner should be awake based on timezone
 */
async function processWakeUpDeliveries(): Promise<number> {
  const activeLocks = await db
    .select()
    .from(momentumLocks)
    .where(
      and(
        eq(momentumLocks.status, 'active'),
        isNull(momentumLocks.wakeUpDeliveredAt)
      )
    );

  let delivered = 0;

  for (const lock of activeLocks) {
    // Check if owner is awake
    if (!isUserAwake(lock.ownerTimezone)) {
      log.debug('Owner not yet awake', { lockId: lock.id, timezone: lock.ownerTimezone });
      continue;
    }

    // Generate thread link
    const threadLink = generateThreadLink(lock.workspaceId, lock.channelId, lock.threadTs);

    // Build and send wake-up message
    const message = buildWakeUpMessage(lock, threadLink);
    const sent = await sendDM(lock.ownerUserId, message);

    if (sent) {
      // Update the lock
      await db
        .update(momentumLocks)
        .set({ wakeUpDeliveredAt: new Date() })
        .where(eq(momentumLocks.id, lock.id));

      // Log event
      await db.insert(momentumLockEvents).values({
        lockId: lock.id,
        eventType: 'delivered',
        payload: { deliveredAt: new Date().toISOString() },
      });

      delivered++;
      log.info('Wake-up delivered', { lockId: lock.id, ownerUserId: lock.ownerUserId });
    }
  }

  return delivered;
}

/**
 * Process escalation chain
 *
 * Enhanced escalation logic using the escalation chain system:
 * - Evaluates locks based on 75% deadline threshold
 * - Respects escalation_paused flag
 * - Supports multi-level escalation chains
 * - Logs escalation_triggered events
 */
async function processEscalationChain(): Promise<{ escalated: number; skipped: number }> {
  const now = new Date();

  // Find active locks that might need escalation
  const activeLocks = await db
    .select()
    .from(momentumLocks)
    .where(
      and(
        eq(momentumLocks.status, MomentumLockStatus.ACTIVE),
        gt(momentumLocks.deadlineAt, now) // Not yet expired
      )
    );

  let escalated = 0;
  let skipped = 0;

  for (const lock of activeLocks) {
    // Convert dates for proper type handling
    const lockWithDates = {
      ...lock,
      deadlineAt: new Date(lock.deadlineAt),
      createdAt: new Date(lock.createdAt),
      updatedAt: new Date(lock.updatedAt),
      escalationSentAt: lock.escalationSentAt ? new Date(lock.escalationSentAt) : null,
      wakeUpDeliveredAt: lock.wakeUpDeliveredAt ? new Date(lock.wakeUpDeliveredAt) : null,
    };

    // Check if this lock should be escalated
    const escalationCheck = shouldEscalate(lockWithDates);

    if (!escalationCheck.shouldEscalate) {
      log.debug('Skipping escalation', {
        lockId: lock.id,
        reason: escalationCheck.skipReason,
      });
      skipped++;
      continue;
    }

    // Get the next escalation target
    const target = determineEscalationTarget(lockWithDates);

    if (!target) {
      log.debug('No escalation target available', { lockId: lock.id });
      skipped++;
      continue;
    }

    // Execute the escalation
    const result = await executeEscalation(
      lockWithDates,
      target.userId,
      target.level,
      escalationCheck.reason || 'deadline_approaching'
    );

    if (result.success) {
      escalated++;
      log.info('Escalation chain triggered', {
        lockId: lock.id,
        escalatedTo: target.userId,
        level: target.level,
        reason: escalationCheck.reason,
      });
    } else {
      log.error('Escalation failed', {
        lockId: lock.id,
        error: result.error,
      });
      skipped++;
    }
  }

  return { escalated, skipped };
}

/**
 * Process proactive deadline alerts
 *
 * At 75% elapsed time, notify requester if lock hasn't started.
 * This is a "supernatural" feature - prevents surprise at deadline.
 *
 * We track alerts via a separate field to avoid re-sending.
 */
async function processProactiveAlerts(): Promise<{ sent: number; skipped: number }> {
  const now = new Date();

  // Find active locks that haven't been started
  const activeLocks = await db
    .select()
    .from(momentumLocks)
    .where(
      and(
        eq(momentumLocks.status, 'active'),
        gt(momentumLocks.deadlineAt, now) // Not yet expired
      )
    );

  let sent = 0;
  let skipped = 0;

  for (const lock of activeLocks) {
    // Check if we should send a proactive alert
    if (!shouldSendProactiveAlert(lock)) {
      continue;
    }

    // Check if we've already sent an alert (using escalationSentAt as proxy for now)
    // TODO: Add dedicated proactive_alert_sent_at field
    if (lock.escalationSentAt) {
      skipped++;
      continue;
    }

    // Generate thread link
    const threadLink = generateThreadLink(lock.workspaceId, lock.channelId, lock.threadTs);

    // Build and send proactive alert to requester
    const message = buildProactiveDeadlineAlert(lock, threadLink);
    const messageSent = await sendDM(lock.requesterUserId, message);

    if (messageSent) {
      // Mark alert as sent (using escalationSentAt as proxy)
      await db
        .update(momentumLocks)
        .set({ escalationSentAt: new Date() })
        .where(eq(momentumLocks.id, lock.id));

      // Log event
      await db.insert(momentumLockEvents).values({
        lockId: lock.id,
        eventType: 'escalation_triggered',
        payload: {
          type: 'proactive_deadline_alert',
          sentTo: lock.requesterUserId,
          sentAt: now.toISOString(),
          reason: 'lock_not_started_at_75_percent',
        },
      });

      sent++;
      log.info('Proactive deadline alert sent', {
        lockId: lock.id,
        requesterUserId: lock.requesterUserId,
      });
    } else {
      skipped++;
    }
  }

  return { sent, skipped };
}

/**
 * Process expirations
 *
 * Mark locks as expired if deadline has passed
 */
async function processExpirations(): Promise<number> {
  const now = new Date();

  const expiredLocks = await db
    .select()
    .from(momentumLocks)
    .where(
      and(
        eq(momentumLocks.status, 'active'),
        lt(momentumLocks.deadlineAt, now)
      )
    );

  let expired = 0;

  for (const lock of expiredLocks) {
    await db
      .update(momentumLocks)
      .set({ status: 'expired' })
      .where(eq(momentumLocks.id, lock.id));

    await db.insert(momentumLockEvents).values({
      lockId: lock.id,
      eventType: 'expired',
      payload: { expiredAt: now.toISOString() },
    });

    expired++;
    log.info('Lock expired', { lockId: lock.id });
  }

  return expired;
}

export async function GET(request: Request) {
  // Verify request
  if (!verifyCronRequest(request)) {
    log.warn('Unauthorized cron request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  log.info('Cron job started');

  try {
    // Process all: expirations, wake-ups, escalation chain, proactive alerts, and reminders
    const [expirations, wakeUps, escalationChainResults, proactiveAlerts, reminderResults] = await Promise.all([
      processExpirations(),
      processWakeUpDeliveries(),
      processEscalationChain(),
      processProactiveAlerts(),
      processAllRemindersAndEscalations(),
    ]);

    log.info('Cron job completed', {
      expirations,
      wakeUps,
      escalations: escalationChainResults.escalated,
      escalationsSkipped: escalationChainResults.skipped,
      proactiveAlerts: proactiveAlerts.sent,
      proactiveAlertsSkipped: proactiveAlerts.skipped,
      reminders: reminderResults.reminders.sent,
    });

    return NextResponse.json({
      success: true,
      processed: {
        expirations,
        wakeUps,
        escalations: escalationChainResults.escalated,
        escalationsSkipped: escalationChainResults.skipped,
        proactiveAlerts: proactiveAlerts.sent,
        proactiveAlertsSkipped: proactiveAlerts.skipped,
        reminders: reminderResults.reminders.sent,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Cron job failed', { error: errorMessage });
    return NextResponse.json(
      { error: 'Internal error', message: errorMessage },
      { status: 500 }
    );
  }
}
