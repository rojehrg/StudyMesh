/**
 * Server-Side Analytics Helper
 *
 * Enhanced analytics utilities for API routes with:
 * - Event batching for efficiency
 * - User context (orgId, workspaceId)
 * - Funnel tracking helper
 */

import { PostHog } from 'posthog-node';
import { createLogger } from '@/lib/logger';
import { EVENTS, FUNNELS, type EventName, type FunnelName, type FunnelMetadata } from './events';

const log = createLogger({ service: 'analytics' });

// Lazy init for server-side PostHog
let _posthog: PostHog | null = null;

// Event batch queue
interface QueuedEvent {
  distinctId: string;
  event: string;
  properties: Record<string, unknown>;
  timestamp?: Date;
}

const eventQueue: QueuedEvent[] = [];
let flushTimeout: NodeJS.Timeout | null = null;
const BATCH_SIZE = 25;
const FLUSH_INTERVAL_MS = 5000;

function getPostHog(): PostHog | null {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return null;
  }

  if (!_posthog) {
    _posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      flushAt: BATCH_SIZE,
      flushInterval: FLUSH_INTERVAL_MS,
    });
  }

  return _posthog;
}

/**
 * Check if analytics is configured
 */
export function isAnalyticsConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_POSTHOG_KEY;
}

// ============================================
// User Context Types
// ============================================

export interface AnalyticsContext {
  userId: string;
  orgId?: string;
  workspaceId?: string;
  timezone?: string;
}

export interface TrackEventOptions {
  event: EventName | string;
  properties?: Record<string, unknown>;
  timestamp?: Date;
}

// ============================================
// Server Analytics Class
// ============================================

/**
 * Server-side analytics helper with context
 */
export class ServerAnalytics {
  private context: AnalyticsContext;

  constructor(context: AnalyticsContext) {
    this.context = context;
  }

  /**
   * Get base properties for all events
   */
  private getBaseProperties(): Record<string, unknown> {
    return {
      $lib: 'posthog-node',
      environment: process.env.NODE_ENV,
      org_id: this.context.orgId,
      workspace_id: this.context.workspaceId,
      timezone: this.context.timezone,
    };
  }

  /**
   * Track a single event
   */
  async track(options: TrackEventOptions): Promise<void> {
    const posthog = getPostHog();
    if (!posthog) {
      log.debug('Analytics not configured, skipping event', { event: options.event });
      return;
    }

    try {
      posthog.capture({
        distinctId: this.context.userId,
        event: options.event,
        properties: {
          ...this.getBaseProperties(),
          ...options.properties,
        },
        timestamp: options.timestamp,
      });

      log.debug('Event tracked', { event: options.event, userId: this.context.userId });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      log.error('Failed to track event', { event: options.event, error: message });
    }
  }

  /**
   * Track multiple events at once (batched)
   */
  async trackBatch(events: TrackEventOptions[]): Promise<void> {
    const posthog = getPostHog();
    if (!posthog) {
      log.debug('Analytics not configured, skipping batch', { count: events.length });
      return;
    }

    try {
      for (const eventOptions of events) {
        posthog.capture({
          distinctId: this.context.userId,
          event: eventOptions.event,
          properties: {
            ...this.getBaseProperties(),
            ...eventOptions.properties,
          },
          timestamp: eventOptions.timestamp,
        });
      }

      log.debug('Batch events tracked', { count: events.length, userId: this.context.userId });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      log.error('Failed to track batch events', { count: events.length, error: message });
    }
  }

  /**
   * Track a funnel step
   */
  async trackFunnel<F extends FunnelName>(
    funnelName: F,
    step: (typeof FUNNELS)[F]['steps'][number],
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const funnel = FUNNELS[funnelName];
    const stepIndex = (funnel.steps as readonly string[]).indexOf(step);
    const totalSteps = funnel.steps.length;

    const funnelMetadata: FunnelMetadata = {
      funnelName: funnel.name,
      step,
      stepIndex,
      totalSteps,
      ...metadata,
    };

    await this.track({
      event: EVENTS.FUNNEL_STEP,
      properties: funnelMetadata,
    });

    log.debug('Funnel step tracked', {
      funnel: funnelName,
      step,
      stepIndex,
      totalSteps,
    });
  }

  // ============================================
  // Lock Lifecycle Helpers
  // ============================================

  async lockCreated(lockId: string, properties?: Record<string, unknown>): Promise<void> {
    await this.track({
      event: EVENTS.LOCK_CREATED,
      properties: { lock_id: lockId, ...properties },
    });
    await this.trackFunnel('LOCK_COMPLETION', 'created', { lock_id: lockId });
  }

  async lockStarted(lockId: string, minutesSinceCreation: number, properties?: Record<string, unknown>): Promise<void> {
    await this.track({
      event: EVENTS.LOCK_STARTED,
      properties: { lock_id: lockId, minutes_since_creation: minutesSinceCreation, ...properties },
    });
    await this.trackFunnel('LOCK_COMPLETION', 'started', { lock_id: lockId });
  }

  async lockBlocked(lockId: string, reason?: string, properties?: Record<string, unknown>): Promise<void> {
    await this.track({
      event: EVENTS.LOCK_BLOCKED,
      properties: { lock_id: lockId, block_reason: reason, ...properties },
    });
  }

  async lockDone(lockId: string, resolutionMinutes: number, properties?: Record<string, unknown>): Promise<void> {
    await this.track({
      event: EVENTS.LOCK_DONE,
      properties: { lock_id: lockId, resolution_minutes: resolutionMinutes, ...properties },
    });
    await this.trackFunnel('LOCK_COMPLETION', 'done', { lock_id: lockId });
  }

  async lockExpired(lockId: string, properties?: Record<string, unknown>): Promise<void> {
    await this.track({
      event: EVENTS.LOCK_EXPIRED,
      properties: { lock_id: lockId, ...properties },
    });
  }

  // ============================================
  // Escalation Helpers
  // ============================================

  async escalationTriggered(lockId: string, reason: string, properties?: Record<string, unknown>): Promise<void> {
    await this.track({
      event: EVENTS.ESCALATION_TRIGGERED,
      properties: { lock_id: lockId, escalation_reason: reason, ...properties },
    });
  }

  async escalationClicked(lockId: string, properties?: Record<string, unknown>): Promise<void> {
    await this.track({
      event: EVENTS.ESCALATION_CLICKED,
      properties: { lock_id: lockId, ...properties },
    });
  }

  // ============================================
  // Modal Engagement Helpers
  // ============================================

  async modalOpened(modalType: string, properties?: Record<string, unknown>): Promise<void> {
    await this.track({
      event: EVENTS.MODAL_OPENED,
      properties: { modal_type: modalType, ...properties },
    });
  }

  async modalCompleted(modalType: string, properties?: Record<string, unknown>): Promise<void> {
    await this.track({
      event: EVENTS.MODAL_COMPLETED,
      properties: { modal_type: modalType, ...properties },
    });
  }

  async modalAbandoned(modalType: string, properties?: Record<string, unknown>): Promise<void> {
    await this.track({
      event: EVENTS.MODAL_ABANDONED,
      properties: { modal_type: modalType, ...properties },
    });
  }

  // ============================================
  // Timezone Helpers
  // ============================================

  async timezoneDetected(timezone: string, source: string, properties?: Record<string, unknown>): Promise<void> {
    await this.track({
      event: EVENTS.TIMEZONE_DETECTED,
      properties: { detected_timezone: timezone, detection_source: source, ...properties },
    });
  }

  async deadlineAdjusted(
    lockId: string,
    originalDeadline: Date,
    adjustedDeadline: Date,
    reason: string,
    properties?: Record<string, unknown>
  ): Promise<void> {
    await this.track({
      event: EVENTS.DEADLINE_ADJUSTED,
      properties: {
        lock_id: lockId,
        original_deadline: originalDeadline.toISOString(),
        adjusted_deadline: adjustedDeadline.toISOString(),
        adjustment_reason: reason,
        adjustment_minutes: Math.round((adjustedDeadline.getTime() - originalDeadline.getTime()) / (1000 * 60)),
        ...properties,
      },
    });
  }
}

// ============================================
// Factory Function
// ============================================

/**
 * Create a server analytics instance with context
 */
export function createServerAnalytics(context: AnalyticsContext): ServerAnalytics {
  return new ServerAnalytics(context);
}

/**
 * Track a funnel step (standalone function)
 */
export async function trackFunnel<F extends FunnelName>(
  userId: string,
  funnelName: F,
  step: (typeof FUNNELS)[F]['steps'][number],
  metadata?: Record<string, unknown>
): Promise<void> {
  const analytics = createServerAnalytics({ userId });
  await analytics.trackFunnel(funnelName, step, metadata);
}

// ============================================
// Cleanup
// ============================================

/**
 * Shutdown PostHog (call on server shutdown)
 */
export async function shutdownServerAnalytics(): Promise<void> {
  if (_posthog) {
    await _posthog.shutdown();
    _posthog = null;
  }

  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }
}

// Re-export events for convenience
export { EVENTS, FUNNELS, type EventName, type FunnelName, type FunnelMetadata } from './events';
