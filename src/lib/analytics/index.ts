/**
 * Analytics Service - PostHog Integration (Server-Side)
 *
 * Product analytics for Attunly.
 * Free tier: 1M events/month
 *
 * Usage:
 * - Client-side: Use the PostHogProvider and useAnalytics hook
 * - Server-side: Use the serverAnalytics functions from this file
 */

import { PostHog } from 'posthog-node';
import { createLogger } from '@/lib/logger';
import { EVENTS, type EventName } from './events';

// Re-export events for convenience
export { EVENTS, FUNNELS, type EventName, type FunnelName, type FunnelMetadata } from './events';

// Re-export server analytics utilities
export {
  createServerAnalytics,
  trackFunnel,
  shutdownServerAnalytics,
  ServerAnalytics,
  type AnalyticsContext,
} from './server';

const log = createLogger({ service: 'analytics' });

// Lazy init for server-side PostHog
let _posthog: PostHog | null = null;

function getPostHog(): PostHog | null {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return null;
  }

  if (!_posthog) {
    _posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      flushAt: 1, // Flush immediately for server-side
      flushInterval: 0,
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
// Server-Side Analytics
// ============================================

interface TrackEventOptions {
  userId: string;
  event: EventName;
  properties?: Record<string, any>;
}

/**
 * Track an event server-side
 */
export async function trackEvent(options: TrackEventOptions): Promise<void> {
  const posthog = getPostHog();
  if (!posthog) {
    log.debug('Analytics not configured, skipping event', { event: options.event });
    return;
  }

  try {
    posthog.capture({
      distinctId: options.userId,
      event: options.event,
      properties: {
        ...options.properties,
        $lib: 'posthog-node',
        environment: process.env.NODE_ENV,
      },
    });

    log.debug('Event tracked', { event: options.event, userId: options.userId });
  } catch (error: any) {
    log.error('Failed to track event', { event: options.event, error: error.message });
  }
}

/**
 * Identify a user with properties
 */
export async function identifyUser(
  userId: string,
  properties: Record<string, any>
): Promise<void> {
  const posthog = getPostHog();
  if (!posthog) return;

  try {
    posthog.identify({
      distinctId: userId,
      properties: {
        ...properties,
        $set_once: {
          first_seen: new Date().toISOString(),
        },
      },
    });

    log.debug('User identified', { userId });
  } catch (error: any) {
    log.error('Failed to identify user', { userId, error: error.message });
  }
}

/**
 * Set user properties (for updates)
 */
export async function setUserProperties(
  userId: string,
  properties: Record<string, any>
): Promise<void> {
  const posthog = getPostHog();
  if (!posthog) return;

  try {
    posthog.identify({
      distinctId: userId,
      properties,
    });
  } catch (error: any) {
    log.error('Failed to set user properties', { userId, error: error.message });
  }
}

/**
 * Associate user with a group (organization)
 */
export async function setUserGroup(
  userId: string,
  groupType: string,
  groupId: string,
  groupProperties?: Record<string, any>
): Promise<void> {
  const posthog = getPostHog();
  if (!posthog) return;

  try {
    posthog.groupIdentify({
      groupType,
      groupKey: groupId,
      properties: groupProperties,
    });

    // Also associate the user with this group
    posthog.capture({
      distinctId: userId,
      event: '$groupidentify',
      properties: {
        $group_type: groupType,
        $group_key: groupId,
      },
    });
  } catch (error: any) {
    log.error('Failed to set user group', { userId, groupId, error: error.message });
  }
}

/**
 * Shutdown PostHog (call on server shutdown)
 */
export async function shutdownAnalytics(): Promise<void> {
  if (_posthog) {
    await _posthog.shutdown();
    _posthog = null;
  }
}

// ============================================
// Convenience Functions
// ============================================

export const serverAnalytics = {
  track: trackEvent,
  identify: identifyUser,
  setProperties: setUserProperties,
  setGroup: setUserGroup,
  shutdown: shutdownAnalytics,

  // Pre-defined event helpers
  userSignedUp: (userId: string, properties?: Record<string, any>) =>
    trackEvent({ userId, event: EVENTS.USER_SIGNED_UP, properties }),

  podCreated: (userId: string, podId: string, podName: string) =>
    trackEvent({
      userId,
      event: EVENTS.POD_CREATED,
      properties: { pod_id: podId, pod_name: podName },
    }),

  nudgeSent: (userId: string, nudgeType: 'ask' | 'offer', topic: string) =>
    trackEvent({
      userId,
      event: EVENTS.NUDGE_SENT,
      properties: { nudge_type: nudgeType, topic },
    }),

  findHelpSearched: (userId: string, query: string, resultsCount: number) =>
    trackEvent({
      userId,
      event: EVENTS.FIND_HELP_SEARCHED,
      properties: { query, results_count: resultsCount },
    }),

  subscriptionUpgraded: (userId: string, fromPlan: string, toPlan: string) =>
    trackEvent({
      userId,
      event: EVENTS.SUBSCRIPTION_UPGRADED,
      properties: { from_plan: fromPlan, to_plan: toPlan },
    }),
};
