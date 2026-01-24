/**
 * Analytics Event Names
 * Shared between client and server
 */

export const EVENTS = {
  // Auth
  USER_SIGNED_UP: 'user_signed_up',
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',

  // Onboarding
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_STEP_COMPLETED: 'onboarding_step_completed',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_SKIPPED: 'onboarding_skipped',

  // Core Actions
  POD_CREATED: 'pod_created',
  POD_JOINED: 'pod_joined',
  POD_LEFT: 'pod_left',

  NUDGE_SENT: 'nudge_sent',
  NUDGE_ACCEPTED: 'nudge_accepted',
  NUDGE_DECLINED: 'nudge_declined',

  MEETING_SCHEDULED: 'meeting_scheduled',
  MEETING_JOINED: 'meeting_joined',
  MEETING_COMPLETED: 'meeting_completed',

  // Features
  FIND_HELP_SEARCHED: 'find_help_searched',
  AVAILABILITY_UPDATED: 'availability_updated',
  PROFILE_UPDATED: 'profile_updated',
  SLACK_CONNECTED: 'slack_connected',
  ZOOM_CONNECTED: 'zoom_connected',

  // Billing
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_UPGRADED: 'subscription_upgraded',
  SUBSCRIPTION_DOWNGRADED: 'subscription_downgraded',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  UPGRADE_PROMPT_SHOWN: 'upgrade_prompt_shown',
  UPGRADE_PROMPT_CLICKED: 'upgrade_prompt_clicked',

  // Lock Lifecycle Events
  LOCK_CREATED: 'lock_created',
  LOCK_STARTED: 'lock_started',
  LOCK_BLOCKED: 'lock_blocked',
  LOCK_DONE: 'lock_done',
  LOCK_EXPIRED: 'lock_expired',
  LOCK_CANCELED: 'lock_canceled',
  LOCK_REASSIGNED: 'lock_reassigned',

  // User Engagement Events
  MODAL_OPENED: 'modal_opened',
  MODAL_COMPLETED: 'modal_completed',
  MODAL_ABANDONED: 'modal_abandoned',

  // Time Zone Events
  TIMEZONE_DETECTED: 'timezone_detected',
  DEADLINE_ADJUSTED: 'deadline_adjusted',

  // Escalation Events
  ESCALATION_TRIGGERED: 'escalation_triggered',
  ESCALATION_CLICKED: 'escalation_clicked',

  // Funnel Events
  FUNNEL_STEP: 'funnel_step',

  // Errors
  ERROR_OCCURRED: 'error_occurred',

  // Performance
  WEB_VITALS: 'web_vitals',
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

/**
 * Funnel Definitions
 * Maps funnel names to ordered steps for tracking conversion
 */
export const FUNNELS = {
  LOCK_COMPLETION: {
    name: 'lock_completion',
    steps: ['created', 'started', 'done'] as const,
  },
  ONBOARDING: {
    name: 'onboarding',
    steps: ['started', 'profile_setup', 'slack_connected', 'completed'] as const,
  },
  MODAL: {
    name: 'modal',
    steps: ['opened', 'filled', 'submitted'] as const,
  },
} as const;

export type FunnelName = keyof typeof FUNNELS;
export type FunnelStep<F extends FunnelName> = (typeof FUNNELS)[F]['steps'][number];

/**
 * Funnel tracking metadata
 */
export interface FunnelMetadata {
  funnelName: string;
  step: string;
  stepIndex: number;
  totalSteps: number;
  sessionId?: string;
  [key: string]: unknown;
}
