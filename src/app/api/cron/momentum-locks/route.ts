/**
 * Momentum Locks Cron Job
 *
 * MVP: Only marks expired locks.
 *
 * Disabled for MVP:
 * - Wake-up deliveries (DMs sent immediately on lock creation)
 * - Escalations (no fallback owners in MVP)
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { momentumLocks, momentumLockEvents } from '@/lib/db/schema';
import { eq, and, isNull, lt, lte } from 'drizzle-orm';
import { createLogger } from '@/lib/logger';
import {
  buildWakeUpMessage,
  buildEscalationMessage,
  generateThreadLink,
} from '@/lib/slack/momentum-lock/messages';

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
 * Process escalations
 *
 * Find active locks where:
 * - Has a fallback owner
 * - Deadline is within 3 hours
 * - Status is still 'active' (not started/blocked/done)
 * - Escalation not already sent
 */
async function processEscalations(): Promise<number> {
  const threeHoursFromNow = new Date(Date.now() + 3 * 60 * 60 * 1000);

  const locksNeedingEscalation = await db
    .select()
    .from(momentumLocks)
    .where(
      and(
        eq(momentumLocks.status, 'active'),
        isNull(momentumLocks.escalationSentAt),
        lte(momentumLocks.deadlineAt, threeHoursFromNow)
      )
    );

  let escalated = 0;

  for (const lock of locksNeedingEscalation) {
    // Must have a fallback owner
    if (!lock.fallbackUserId) {
      continue;
    }

    // Check if fallback is awake
    // Note: We don't have fallback timezone stored, so we assume they're awake
    // In production, you'd want to store this

    // Generate thread link
    const threadLink = generateThreadLink(lock.workspaceId, lock.channelId, lock.threadTs);

    // Build and send escalation message
    const message = buildEscalationMessage(lock, threadLink);
    const sent = await sendDM(lock.fallbackUserId, message);

    if (sent) {
      // Update the lock
      await db
        .update(momentumLocks)
        .set({ escalationSentAt: new Date() })
        .where(eq(momentumLocks.id, lock.id));

      // Log event
      await db.insert(momentumLockEvents).values({
        lockId: lock.id,
        eventType: 'escalated',
        actorUserId: undefined, // System-triggered
        payload: {
          escalatedTo: lock.fallbackUserId,
          reason: 'deadline_approaching',
        },
      });

      escalated++;
      log.info('Escalation sent', {
        lockId: lock.id,
        fallbackUserId: lock.fallbackUserId,
      });
    }
  }

  return escalated;
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
    // MVP: Only process expirations
    // Wake-up and escalation disabled (DMs sent immediately, no fallback)
    const expirations = await processExpirations();

    log.info('Cron job completed', { expirations });

    return NextResponse.json({
      success: true,
      processed: {
        expirations,
        // MVP: disabled
        wakeUps: 0,
        escalations: 0,
      },
    });
  } catch (error: any) {
    log.error('Cron job failed', { error: error.message });
    return NextResponse.json(
      { error: 'Internal error', message: error.message },
      { status: 500 }
    );
  }
}
