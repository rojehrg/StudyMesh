/**
 * Microcopy constants for UI elements throughout Attunly.
 * Follows brand guidelines: calm, editorial tone, no emojis, clarity over features.
 *
 * Key terminology:
 * - "Request" (not "Lock" or "Momentum Lock" in UI)
 * - "Assigned to" (not "Owner")
 * - "Requested by" (not "Requester")
 * - "Requests sent" (not "Send rate")
 * - "Request status" (not "Lock status")
 */

export const MICROCOPY = {
  momentumLock: {
    // Status labels
    statusPending: 'Pending',
    statusStarted: 'In progress',
    statusBlocked: 'Blocked',
    statusDone: 'Complete',

    // Status descriptions (for tooltips or expanded views)
    statusPendingDescription: 'Waiting for acknowledgment',
    statusStartedDescription: 'They have seen this and started working on it',
    statusBlockedDescription: 'They are stuck and need something else first',
    statusDoneDescription: 'This request has been completed',

    // Deadline hints
    deadlineHint: 'Deadlines are context, not pressure. Set a realistic expectation.',
    deadlineLabel: 'Needed by',
    deadlinePast: 'Past the requested time',
    deadlineSoon: 'Due soon',
    deadlineToday: 'Due today',

    // Actions
    actionStart: 'Start',
    actionBlocked: 'Blocked',
    actionDone: 'Done',
    actionCancel: 'Cancel request',
    actionEdit: 'Edit request',

    // Prompts
    promptOutcome: 'What do you need from them?',
    promptDeadline: 'When do you need this by?',
    promptBlockedReason: 'What is blocking you?',
    promptAssignee: 'Who should respond?',

    // Confirmations
    confirmCancel: 'Cancel this request? The person assigned will be notified.',
    confirmDone: 'Mark as complete?',

    // Notifications
    notifyNewRequest: 'You have a new request',
    notifyStarted: 'saw your request and started',
    notifyBlocked: 'is blocked on your request',
    notifyDone: 'marked your request as complete',
    notifyReminder: 'Reminder: You have a pending request',
  },

  timezone: {
    // Overlap messaging
    overlapGood: 'Good overlap with your working hours',
    overlapLimited: 'Limited overlap with your hours',
    noOverlap: 'No overlap with your working hours',

    // Suggestions
    suggestionAsync: 'Consider setting a deadline for their next working day',
    suggestionUrgent: 'For urgent items, try someone with overlapping hours',
    suggestionContext: 'Include context since they may not be online to ask questions',

    // Labels
    labelTheirTime: 'Their local time',
    labelYourTime: 'Your local time',
    labelWorkingHours: 'Working hours',
    labelCurrentlyWorking: 'Currently in working hours',
    labelOutsideHours: 'Outside working hours',
    labelOverlapHours: 'hours of overlap',
  },

  dashboard: {
    // Section headers
    headerPending: 'Pending responses',
    headerActive: 'Active requests',
    headerCompleted: 'Recently completed',
    headerSent: 'Requests you sent',
    headerReceived: 'Requests for you',

    // Labels
    labelRequestedBy: 'Requested by',
    labelAssignedTo: 'Assigned to',
    labelRequestsSent: 'Requests sent',
    labelRequestsReceived: 'Requests received',
    labelAverageResponseTime: 'Average response time',
    labelCompletionRate: 'Completion rate',

    // Filters
    filterAll: 'All',
    filterPending: 'Pending',
    filterInProgress: 'In progress',
    filterBlocked: 'Blocked',
    filterComplete: 'Complete',
  },

  forms: {
    // Validation messages
    validationRequired: 'This field is required',
    validationTooLong: 'Please keep this shorter',
    validationInvalidDate: 'Please choose a valid date',
    validationPastDate: 'Please choose a future date',

    // Placeholders
    placeholderOutcome: 'e.g., Review the updated designs',
    placeholderBlockedReason: 'e.g., Waiting on API documentation from the backend team',
    placeholderSearch: 'Search requests',
    placeholderSelectPerson: 'Select a person',
  },

  errors: {
    generic: 'Something went wrong. Please try again.',
    networkError: 'Could not connect. Check your connection and try again.',
    unauthorized: 'You do not have permission to do this.',
    notFound: 'This request could not be found.',
    alreadyComplete: 'This request has already been completed.',
    cannotModify: 'This request can no longer be modified.',
  },

  success: {
    requestSent: 'Request sent',
    requestUpdated: 'Request updated',
    requestCancelled: 'Request cancelled',
    statusUpdated: 'Status updated',
    settingsSaved: 'Settings saved',
  },

  labels: {
    // Time-related
    justNow: 'Just now',
    minutesAgo: 'min ago',
    hoursAgo: 'hr ago',
    daysAgo: 'd ago',
    yesterday: 'Yesterday',
    today: 'Today',
    tomorrow: 'Tomorrow',

    // General
    you: 'You',
    unknown: 'Unknown',
    none: 'None',
    optional: 'Optional',
    required: 'Required',
  },
} as const;

export type MicrocopyCategory = keyof typeof MICROCOPY;
