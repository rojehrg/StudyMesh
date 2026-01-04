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

  // Errors
  ERROR_OCCURRED: 'error_occurred',
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
