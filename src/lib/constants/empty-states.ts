/**
 * Empty state copy for various dashboard and feature views.
 * Follows Attunly brand guidelines: calm, editorial tone, no emojis.
 */

export const EMPTY_STATES = {
  dashboard: {
    title: 'Nothing pending right now',
    description: 'When you request a response from someone, it will appear here. You will see when they acknowledge it and whether they are blocked.',
    action: 'Send your first request',
  },

  noLocks: {
    title: 'No active requests',
    description: 'All requests have been completed. Send a new request when you need clarity on something.',
    action: 'Create a request',
  },

  noTeamMembers: {
    title: 'No teammates yet',
    description: 'Invite your team to start requesting responses from each other. Works best with distributed teams across time zones.',
    action: 'Invite teammates',
  },

  noAvailability: {
    title: 'Availability not set',
    description: 'Add your working hours so teammates know the best time to expect a response from you.',
    action: 'Set your hours',
  },

  noHistory: {
    title: 'No past requests',
    description: 'Completed requests will appear here. You can review what was requested and when it was resolved.',
    action: 'View current requests',
  },

  noNotifications: {
    title: 'All caught up',
    description: 'No new updates right now. You will be notified when someone responds to your requests.',
    action: null,
  },

  noBlockedRequests: {
    title: 'Nothing blocked',
    description: 'When someone marks a request as blocked, it will appear here with their explanation.',
    action: null,
  },

  noSearchResults: {
    title: 'No results found',
    description: 'Try adjusting your search terms or filters.',
    action: 'Clear filters',
  },

  noAnalytics: {
    title: 'Not enough data yet',
    description: 'Analytics will appear once your team has completed a few requests. Keep using Attunly and check back soon.',
    action: null,
  },

  noTimezoneOverlap: {
    title: 'Limited overlap hours',
    description: 'You and this person have minimal working hours in common. Async requests with clear deadlines work best here.',
    action: 'Send a request anyway',
  },
} as const;

export type EmptyStateKey = keyof typeof EMPTY_STATES;
