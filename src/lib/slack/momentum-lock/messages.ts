/**
 * Momentum Lock Message Builders
 *
 * Builds Slack messages for wake-up DMs, escalations, and notifications.
 * Includes rich Block Kit formatting with progress indicators.
 */

import { type MomentumLock } from "@/lib/db/schema";
import { getTimezoneAbbrev } from "@/lib/availability";

interface SlackBlock {
  type: string;
  [key: string]: any;
}

// Progress bar configuration using ASCII characters for Slack compatibility
const PROGRESS_BAR_LENGTH = 10;
const PROGRESS_FILLED_CHAR = "|";
const PROGRESS_EMPTY_CHAR = ".";

/**
 * Format a time in a specific timezone
 */
function formatTimeInTimezone(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  }).format(date);
}

/**
 * Build a visual progress bar for time remaining
 * Returns string like "[||||||||..] 80% time remaining"
 */
export function buildProgressBar(
  startTime: Date,
  endTime: Date,
  now: Date = new Date()
): string {
  const totalDuration = endTime.getTime() - startTime.getTime();
  const elapsed = now.getTime() - startTime.getTime();
  const percentElapsed = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  const percentRemaining = 100 - percentElapsed;

  const filledCount = Math.round((percentElapsed / 100) * PROGRESS_BAR_LENGTH);
  const emptyCount = PROGRESS_BAR_LENGTH - filledCount;

  const filledPart = PROGRESS_FILLED_CHAR.repeat(filledCount);
  const emptyPart = PROGRESS_EMPTY_CHAR.repeat(emptyCount);

  return `[${filledPart}${emptyPart}] ${Math.round(percentRemaining)}% time remaining`;
}

/**
 * Format hours remaining in human-readable format
 * Returns strings like "3 hours", "1 day 2 hours", "45 minutes"
 */
export function formatHoursUntilDeadline(hoursRemaining: number): string {
  if (hoursRemaining < 0) {
    return "overdue";
  }

  if (hoursRemaining < 1) {
    const minutes = Math.round(hoursRemaining * 60);
    if (minutes <= 1) {
      return "less than a minute";
    }
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  if (hoursRemaining < 24) {
    const hours = Math.round(hoursRemaining);
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  const days = Math.floor(hoursRemaining / 24);
  const remainingHours = Math.round(hoursRemaining % 24);

  if (remainingHours === 0) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  }

  return `${days} day${days !== 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
}

/**
 * Build timezone context string for messages
 * Returns "Their time: 9:15 AM PT" format
 */
export function formatTheirTime(
  timezone: string | null,
  now: Date = new Date()
): string {
  const tz = timezone || 'America/New_York';
  const time = formatTimeInTimezone(now, tz);
  const abbrev = getTimezoneAbbrev(tz);
  return `Their time: ${time} ${abbrev}`;
}

/**
 * Build timezone context block for messages
 * Shows "Your time: 9am PT | Their time: 12pm ET" format
 */
export function buildTimezoneContextBlock(
  ownerTimezone: string | null,
  requesterTimezone: string | null,
  now: Date = new Date()
): SlackBlock | null {
  const ownerTz = ownerTimezone || 'America/New_York';
  const requesterTz = requesterTimezone || 'America/New_York';

  // If timezones are the same, no need to show context
  if (ownerTz === requesterTz) {
    return null;
  }

  const ownerTime = formatTimeInTimezone(now, ownerTz);
  const requesterTime = formatTimeInTimezone(now, requesterTz);
  const ownerTzAbbrev = getTimezoneAbbrev(ownerTz);
  const requesterTzAbbrev = getTimezoneAbbrev(requesterTz);

  return {
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `Your time: ${ownerTime} ${ownerTzAbbrev} | Their time: ${requesterTime} ${requesterTzAbbrev}`,
      },
    ],
  };
}

/**
 * Format deadline with timezone context for owner
 * Returns "Deadline: 5pm your time" format
 */
export function formatDeadlineForOwner(
  deadlineAt: Date,
  ownerTimezone: string | null
): string {
  const ownerTz = ownerTimezone || 'America/New_York';
  const deadlineTime = formatTimeInTimezone(deadlineAt, ownerTz);
  const ownerTzAbbrev = getTimezoneAbbrev(ownerTz);
  return `Deadline: ${deadlineTime} ${ownerTzAbbrev}`;
}

/**
 * Build wake-up DM message for lock owner
 *
 * Sent when the owner comes online (based on timezone + working hours)
 * Includes rich formatting with progress bar and timezone context
 */
export function buildWakeUpMessage(lock: MomentumLock, threadLink: string | null): {
  text: string;
  blocks: SlackBlock[];
} {
  const { requesterUserId, requiredOutcome, acceptableFallback, impactStatement, deadlineAt, ownerTimezone, requesterTimezone, createdAt } = lock;

  // Calculate remaining time
  const now = new Date();
  const deadline = new Date(deadlineAt);
  const created = new Date(createdAt);
  const diff = deadline.getTime() - now.getTime();
  const hoursRemaining = diff / (60 * 60 * 1000);

  // Human-readable time remaining
  const timeRemainingText = formatHoursUntilDeadline(hoursRemaining);

  // Build progress bar
  const progressBar = buildProgressBar(created, deadline, now);

  // Determine urgency level for formatting
  let urgencyPrefix = "";
  if (hoursRemaining <= 1) {
    urgencyPrefix = "*URGENT:* ";
  } else if (hoursRemaining <= 3) {
    urgencyPrefix = "*Soon:* ";
  }

  const fallbackSection = acceptableFallback
    ? `\n\n*If blocked:* _${acceptableFallback}_`
    : "";

  const impactSection = impactStatement
    ? `\n\n*Why it matters:* ${impactStatement}`
    : "";

  // Format deadline in owner's timezone
  const deadlineDisplay = formatDeadlineForOwner(deadline, ownerTimezone);

  // Build timezone context showing requester's time
  const requesterTimeContext = requesterTimezone && requesterTimezone !== ownerTimezone
    ? formatTheirTime(requesterTimezone, now)
    : null;

  const text = `While you were offline, the team set a Momentum Lock. ${requiredOutcome}`;

  const blocks: SlackBlock[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "Momentum Lock",
        emoji: false,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `While you were offline, <@${requesterUserId}> set a commitment for you.`,
      },
    },
    // Show requester's timezone context if different
    ...(requesterTimeContext
      ? [
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: requesterTimeContext,
              },
            ],
          },
        ]
      : []),
    {
      type: "divider",
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*What's needed:*\n${requiredOutcome}${fallbackSection}${impactSection}`,
      },
    },
    // Progress and deadline section
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `\`${progressBar}\`\n${urgencyPrefix}*${timeRemainingText}* until deadline`,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: threadLink
            ? `*${deadlineDisplay}* | <${threadLink}|View thread>`
            : `*${deadlineDisplay}*`,
        },
      ],
    },
    {
      type: "divider",
    },
    {
      type: "actions",
      block_id: "wakeup_actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Start",
            emoji: false,
          },
          style: "primary",
          action_id: "momentum_lock_start",
          value: lock.id,
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "I'm Blocked",
            emoji: false,
          },
          action_id: "momentum_lock_blocked",
          value: lock.id,
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Done",
            emoji: false,
          },
          style: "primary",
          action_id: "momentum_lock_done",
          value: lock.id,
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Need Context",
            emoji: false,
          },
          action_id: "momentum_lock_context",
          value: lock.id,
        },
      ],
    },
  ];

  return { text, blocks };
}

/**
 * Build escalation DM message for fallback owner
 *
 * Sent when deadline is approaching and primary owner hasn't responded
 * Includes progress bar and rich timezone context
 */
export function buildEscalationMessage(lock: MomentumLock, threadLink: string | null): {
  text: string;
  blocks: SlackBlock[];
} {
  const { ownerUserId, requiredOutcome, acceptableFallback, deadlineAt, ownerTimezone, createdAt } = lock;

  // Calculate remaining time
  const now = new Date();
  const deadline = new Date(deadlineAt);
  const created = new Date(createdAt);
  const hoursRemaining = (deadline.getTime() - now.getTime()) / (60 * 60 * 1000);

  // Human-readable time remaining
  const timeText = formatHoursUntilDeadline(hoursRemaining);

  // Build progress bar
  const progressBar = buildProgressBar(created, deadline, now);

  // Owner's timezone context
  const ownerTimeContext = ownerTimezone ? formatTheirTime(ownerTimezone, now) : null;

  const text = `Heads up. A Momentum Lock may need backup. The team is waiting on: ${requiredOutcome}`;

  const fallbackHint = acceptableFallback
    ? `\n\n*Acceptable partial:* _${acceptableFallback}_`
    : "";

  const blocks: SlackBlock[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "Momentum Lock Backup Request",
        emoji: false,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `A Momentum Lock may need your help. The original owner <@${ownerUserId}> hasn't responded yet.`,
      },
    },
    // Add owner's timezone context if available
    ...(ownerTimeContext
      ? [
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: ownerTimeContext,
              },
            ],
          },
        ]
      : []),
    {
      type: "divider",
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*What's needed:*\n${requiredOutcome}${fallbackHint}`,
      },
    },
    // Progress section
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `\`${progressBar}\`\n*${timeText}* remaining`,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: threadLink
            ? `<${threadLink}|View thread> | If you can't help, no worries.`
            : `If you can't help, no worries.`,
        },
      ],
    },
    {
      type: "divider",
    },
    {
      type: "actions",
      block_id: "escalation_actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "I Can Take This",
            emoji: false,
          },
          style: "primary",
          action_id: "momentum_lock_reassign_full",
          value: lock.id,
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "I Can Help Partially",
            emoji: false,
          },
          action_id: "momentum_lock_reassign_partial",
          value: lock.id,
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Cannot Help",
            emoji: false,
          },
          action_id: "momentum_lock_cannot_help",
          value: lock.id,
        },
      ],
    },
  ];

  return { text, blocks };
}

/**
 * Build blocked options menu message
 *
 * Shown as ephemeral when owner clicks "I'm Blocked"
 */
export function buildBlockedOptionsMessage(lockId: string): {
  text: string;
  blocks: SlackBlock[];
} {
  const text = "What's blocking you?";

  const blocks: SlackBlock[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*What's blocking you?*\nChoose the option that best describes your situation:",
      },
    },
    {
      type: "actions",
      block_id: "blocked_options",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Need input from someone",
            emoji: true,
          },
          action_id: "blocked_need_input",
          value: lockId,
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Can ship partial version",
            emoji: true,
          },
          action_id: "blocked_partial",
          value: lockId,
        },
      ],
    },
    {
      type: "actions",
      block_id: "blocked_options_2",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Should be re-scoped",
            emoji: true,
          },
          action_id: "blocked_rescope",
          value: lockId,
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Can't touch before they wake",
            emoji: true,
          },
          action_id: "blocked_escalate_now",
          value: lockId,
        },
      ],
    },
  ];

  return { text, blocks };
}

/**
 * Build status update message for thread
 */
export function buildStatusUpdateMessage(
  lockId: string,
  status: 'started' | 'blocked' | 'done',
  actorUserId: string,
  details?: string
): {
  text: string;
  blocks: SlackBlock[];
} {
  let statusText: string;
  let prefix: string;

  switch (status) {
    case 'started':
      prefix = "[Started]";
      statusText = `<@${actorUserId}> started working on this`;
      break;
    case 'blocked':
      prefix = "[Blocked]";
      statusText = `<@${actorUserId}> is blocked${details ? `: ${details}` : ''}`;
      break;
    case 'done':
      prefix = "[Done]";
      statusText = `<@${actorUserId}> completed this`;
      break;
  }

  const text = `${prefix} ${statusText}`;

  const blocks: SlackBlock[] = [
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `*${prefix}* ${statusText}`,
        },
      ],
    },
  ];

  return { text, blocks };
}

/**
 * Build completion confirmation message
 */
export function buildCompletionMessage(lock: MomentumLock): {
  text: string;
  blocks: SlackBlock[];
} {
  const text = `Lock completed. ${lock.requiredOutcome}`;

  const blocks: SlackBlock[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Momentum Lock completed*\n\n_${lock.requiredOutcome}_`,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `Delivered by <@${lock.ownerUserId}> | Requested by <@${lock.requesterUserId}>`,
        },
      ],
    },
  ];

  return { text, blocks };
}

/**
 * Build reminder DM message for lock owner
 *
 * Sent as deadline approaches to remind owner
 * Includes progress bar and rich timezone context
 */
export function buildReminderMessage(
  lock: MomentumLock,
  threadLink: string | null,
  isUrgent: boolean = false
): {
  text: string;
  blocks: SlackBlock[];
} {
  const { requesterUserId, requiredOutcome, acceptableFallback, deadlineAt, ownerTimezone, requesterTimezone, createdAt } = lock;

  // Calculate remaining time
  const now = new Date();
  const deadline = new Date(deadlineAt);
  const created = new Date(createdAt);
  const diff = deadline.getTime() - now.getTime();
  const hoursRemaining = diff / (60 * 60 * 1000);

  // Human-readable time remaining
  const timeText = formatHoursUntilDeadline(hoursRemaining);

  // Build progress bar
  const progressBar = buildProgressBar(created, deadline, now);

  const header = isUrgent
    ? "Deadline approaching"
    : "Friendly reminder";

  const text = `${header}: ${requiredOutcome} (${timeText} remaining)`;

  const fallbackSection = acceptableFallback
    ? `\n\n*If blocked:* _${acceptableFallback}_`
    : "";

  // Format deadline in owner's timezone
  const deadlineDisplay = formatDeadlineForOwner(deadline, ownerTimezone);

  // Build timezone context showing requester's time
  const requesterTimeContext = requesterTimezone && requesterTimezone !== ownerTimezone
    ? formatTheirTime(requesterTimezone, now)
    : null;

  const blocks: SlackBlock[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: isUrgent
          ? `*Deadline approaching*\n\n<@${requesterUserId}> is waiting on:\n_${requiredOutcome}_${fallbackSection}`
          : `*Friendly reminder*\n\n<@${requesterUserId}> is waiting on:\n_${requiredOutcome}_${fallbackSection}`,
      },
    },
    // Show requester's timezone context if different
    ...(requesterTimeContext
      ? [
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: requesterTimeContext,
              },
            ],
          },
        ]
      : []),
    {
      type: "divider",
    },
    // Progress and deadline section
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `\`${progressBar}\`\n*${timeText}* until deadline`,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: threadLink
            ? `*${deadlineDisplay}* | <${threadLink}|View thread>`
            : `*${deadlineDisplay}*`,
        },
      ],
    },
    {
      type: "divider",
    },
    {
      type: "actions",
      block_id: "reminder_actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Start",
            emoji: false,
          },
          style: "primary",
          action_id: "momentum_lock_start",
          value: lock.id,
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "I'm Blocked",
            emoji: false,
          },
          action_id: "momentum_lock_blocked",
          value: lock.id,
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Done",
            emoji: false,
          },
          style: "primary",
          action_id: "momentum_lock_done",
          value: lock.id,
        },
      ],
    },
  ];

  return { text, blocks };
}

/**
 * Generate thread link from channel and thread_ts
 */
export function generateThreadLink(
  workspaceId: string,
  channelId: string,
  threadTs: string | null
): string | null {
  if (!threadTs) return null;
  // Convert thread_ts to link format (remove the dot)
  const linkTs = threadTs.replace('.', '');
  return `https://slack.com/archives/${channelId}/p${linkTs}`;
}

// ============================================
// ESCALATION CHAIN MESSAGES
// ============================================

/**
 * Build escalation notification for escalation chain recipients
 *
 * Enhanced version with escalation level context and pause option
 */
export function buildEscalationNotification(
  lock: MomentumLock,
  threadLink: string | null,
  escalationLevel: number
): {
  text: string;
  blocks: SlackBlock[];
} {
  const { ownerUserId, requiredOutcome, acceptableFallback, deadlineAt } = lock;

  // Calculate remaining time
  const now = new Date();
  const deadline = new Date(deadlineAt);
  const diff = deadline.getTime() - now.getTime();
  const hoursRemaining = Math.max(0, Math.round(diff / (60 * 60 * 1000)));

  let timeText: string;
  if (hoursRemaining <= 1) {
    timeText = "less than 1 hour";
  } else if (hoursRemaining < 24) {
    timeText = `${hoursRemaining} hours`;
  } else {
    const days = Math.round(hoursRemaining / 24);
    timeText = days === 1 ? "1 day" : `${days} days`;
  }

  const text = `Escalation: A Momentum Lock needs attention. ${requiredOutcome}`;

  const fallbackHint = acceptableFallback
    ? `\n\n_Acceptable fallback: ${acceptableFallback}_`
    : "\n\n_Even a partial unblock keeps things moving._";

  // Build escalation level indicator
  const levelText = escalationLevel === 1
    ? "First escalation"
    : `Escalation level ${escalationLevel}`;

  const blocks: SlackBlock[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "Escalation",
        emoji: false,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*A Momentum Lock has been escalated to you.*\n\nThe original owner <@${ownerUserId}> hasn't responded, and the deadline is approaching.`,
      },
    },
    {
      type: "divider",
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*What's needed:*\n${requiredOutcome}${fallbackHint}`,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `*Time remaining:* ${timeText} | *${levelText}*${threadLink ? ` | <${threadLink}|View thread>` : ''}`,
        },
      ],
    },
    {
      type: "divider",
    },
    {
      type: "actions",
      block_id: "escalation_chain_actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "I Can Take This",
            emoji: false,
          },
          style: "primary",
          action_id: "momentum_lock_reassign_full",
          value: lock.id,
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "I Can Help Partially",
            emoji: false,
          },
          action_id: "momentum_lock_reassign_partial",
          value: lock.id,
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Pause Escalation",
            emoji: false,
          },
          action_id: "momentum_lock_pause_escalation",
          value: lock.id,
        },
      ],
    },
  ];

  return { text, blocks };
}

/**
 * Build escalation chain display for lock messages
 *
 * Shows the escalation chain in a readable format
 */
export function buildEscalationChainDisplay(
  escalationChain: string[] | null,
  currentLevel: number,
  ownerUserId: string,
  isPaused: boolean = false
): SlackBlock[] {
  const chain = escalationChain ?? [];

  if (chain.length === 0) {
    return [];
  }

  // Build chain visualization
  const chainParts: string[] = [];

  // Owner (level 0)
  if (currentLevel === 0) {
    chainParts.push(`*<@${ownerUserId}>* (current)`);
  } else {
    chainParts.push(`<@${ownerUserId}>`);
  }

  // Chain members
  chain.forEach((userId, index) => {
    const level = index + 1;
    if (level === currentLevel) {
      chainParts.push(`*<@${userId}>* (current)`);
    } else if (level < currentLevel) {
      chainParts.push(`<@${userId}> (notified)`);
    } else {
      chainParts.push(`<@${userId}>`);
    }
  });

  const chainText = chainParts.join(" -> ");
  const statusText = isPaused ? " [Paused]" : "";

  return [
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `*Escalation chain:* ${chainText}${statusText}`,
        },
      ],
    },
  ];
}

/**
 * Build message with escalation controls for requester
 *
 * Allows requester to manually escalate or pause escalation
 */
export function buildRequesterEscalationControls(
  lock: MomentumLock,
  threadLink: string | null
): {
  text: string;
  blocks: SlackBlock[];
} {
  const isPaused = lock.escalationPaused ?? false;
  const currentLevel = lock.currentEscalationLevel ?? 0;
  const chain = lock.escalationChain ?? [];
  const hasChain = chain.length > 0 || lock.fallbackUserId;

  const text = "Escalation controls for your Momentum Lock";

  const blocks: SlackBlock[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Escalation Controls*\n\n_${lock.requiredOutcome}_`,
      },
    },
  ];

  // Add escalation chain display
  if (hasChain) {
    blocks.push(
      ...buildEscalationChainDisplay(chain, currentLevel, lock.ownerUserId, isPaused)
    );
  }

  blocks.push(
    {
      type: "divider",
    },
    {
      type: "actions",
      block_id: "requester_escalation_controls",
      elements: [
        // Manual escalate button (only if not at end of chain)
        ...(currentLevel < chain.length || (currentLevel === 0 && lock.fallbackUserId)
          ? [
              {
                type: "button" as const,
                text: {
                  type: "plain_text" as const,
                  text: "Escalate Now",
                  emoji: false,
                },
                style: "primary" as const,
                action_id: "momentum_lock_manual_escalate",
                value: lock.id,
                confirm: {
                  title: {
                    type: "plain_text" as const,
                    text: "Confirm Escalation",
                  },
                  text: {
                    type: "mrkdwn" as const,
                    text: "This will immediately escalate the lock to the next person in the chain. Continue?",
                  },
                  confirm: {
                    type: "plain_text" as const,
                    text: "Escalate",
                  },
                  deny: {
                    type: "plain_text" as const,
                    text: "Cancel",
                  },
                },
              },
            ]
          : []),
        // Pause/Resume button
        {
          type: "button" as const,
          text: {
            type: "plain_text" as const,
            text: isPaused ? "Resume Escalation" : "Pause Escalation",
            emoji: false,
          },
          action_id: isPaused
            ? "momentum_lock_resume_escalation"
            : "momentum_lock_pause_escalation",
          value: lock.id,
        },
      ],
    }
  );

  // Add thread link if available
  if (threadLink) {
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `<${threadLink}|View thread>`,
        },
      ],
    });
  }

  return { text, blocks };
}

/**
 * Build escalation paused confirmation message
 */
export function buildEscalationPausedMessage(lock: MomentumLock): {
  text: string;
  blocks: SlackBlock[];
} {
  const text = "Escalation paused for this Momentum Lock";

  const blocks: SlackBlock[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Escalation paused*\n\nAuto-escalation has been paused for:\n_${lock.requiredOutcome}_\n\nYou can resume escalation at any time.`,
      },
    },
    {
      type: "actions",
      block_id: "escalation_paused_actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Resume Escalation",
            emoji: false,
          },
          action_id: "momentum_lock_resume_escalation",
          value: lock.id,
        },
      ],
    },
  ];

  return { text, blocks };
}

/**
 * Build escalation resumed confirmation message
 */
export function buildEscalationResumedMessage(lock: MomentumLock): {
  text: string;
  blocks: SlackBlock[];
} {
  const text = "Escalation resumed for this Momentum Lock";

  const blocks: SlackBlock[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Escalation resumed*\n\nAuto-escalation is now active for:\n_${lock.requiredOutcome}_\n\nThe next person in the chain will be notified if the deadline approaches.`,
      },
    },
    {
      type: "actions",
      block_id: "escalation_resumed_actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Pause Escalation",
            emoji: false,
          },
          action_id: "momentum_lock_pause_escalation",
          value: lock.id,
        },
      ],
    },
  ];

  return { text, blocks };
}

// ============================================
// CONFIRMATION MESSAGES
// ============================================

/**
 * Build ephemeral confirmation message sent to requester after lock creation
 *
 * Includes direct link to lock in dashboard and summary of the lock
 */
export function buildLockCreatedConfirmation(
  lock: MomentumLock,
  threadLink: string | null,
  dashboardUrl: string | null
): {
  text: string;
  blocks: SlackBlock[];
} {
  const { ownerUserId, requiredOutcome, deadlineAt, ownerTimezone, fallbackUserId } = lock;

  const now = new Date();
  const deadline = new Date(deadlineAt);
  const hoursRemaining = (deadline.getTime() - now.getTime()) / (60 * 60 * 1000);
  const timeText = formatHoursUntilDeadline(hoursRemaining);

  // Format deadline in owner's timezone
  const deadlineDisplay = formatDeadlineForOwner(deadline, ownerTimezone);

  // Build owner's timezone context
  const ownerTimeContext = ownerTimezone ? formatTheirTime(ownerTimezone, now) : null;

  const text = `Momentum Lock created. ${requiredOutcome}`;

  const blocks: SlackBlock[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Momentum Lock created*\n\nYou've requested a response from <@${ownerUserId}>:`,
      },
    },
    {
      type: "divider",
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `_${requiredOutcome}_`,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `*${deadlineDisplay}* (${timeText})${fallbackUserId ? ` | Backup: <@${fallbackUserId}>` : ''}`,
        },
      ],
    },
  ];

  // Add owner's timezone context if available
  if (ownerTimeContext) {
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: ownerTimeContext,
        },
      ],
    });
  }

  blocks.push({ type: "divider" });

  // Add links section
  const linkElements: string[] = [];
  if (dashboardUrl) {
    linkElements.push(`<${dashboardUrl}|View in dashboard>`);
  }
  if (threadLink) {
    linkElements.push(`<${threadLink}|View thread>`);
  }

  if (linkElements.length > 0) {
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: linkElements.join(" | "),
        },
      ],
    });
  }

  // Add notification info
  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `<@${ownerUserId}> will be notified when they start their workday. You'll be updated when they respond.`,
      },
    ],
  });

  return { text, blocks };
}

/**
 * Build lock status change notification for requester
 *
 * Sent when owner starts, gets blocked, or completes the lock
 */
export function buildRequesterStatusNotification(
  lock: MomentumLock,
  status: 'started' | 'blocked' | 'done',
  threadLink: string | null,
  details?: string
): {
  text: string;
  blocks: SlackBlock[];
} {
  const { ownerUserId, requiredOutcome } = lock;

  let headerText: string;
  let bodyText: string;
  let style: 'positive' | 'neutral' | 'attention';

  switch (status) {
    case 'started':
      headerText = "Lock started";
      bodyText = `<@${ownerUserId}> has started working on your request.`;
      style = 'positive';
      break;
    case 'blocked':
      headerText = "Owner is blocked";
      bodyText = `<@${ownerUserId}> is blocked on your request.${details ? `\n\n*Reason:* ${details}` : ''}`;
      style = 'attention';
      break;
    case 'done':
      headerText = "Lock completed";
      bodyText = `<@${ownerUserId}> has completed your request.`;
      style = 'positive';
      break;
  }

  const text = `${headerText}: ${requiredOutcome}`;

  const blocks: SlackBlock[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${headerText}*\n\n${bodyText}`,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `_${requiredOutcome}_`,
        },
      ],
    },
  ];

  if (threadLink) {
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `<${threadLink}|View thread>`,
        },
      ],
    });
  }

  return { text, blocks };
}

/**
 * Build active lock summary message
 *
 * Shows a rich summary of an active lock with all relevant details
 */
export function buildLockSummaryMessage(
  lock: MomentumLock,
  threadLink: string | null,
  dashboardUrl: string | null
): {
  text: string;
  blocks: SlackBlock[];
} {
  const {
    ownerUserId,
    requesterUserId,
    requiredOutcome,
    acceptableFallback,
    impactStatement,
    deadlineAt,
    ownerTimezone,
    requesterTimezone,
    status,
    createdAt,
    fallbackUserId,
  } = lock;

  const now = new Date();
  const deadline = new Date(deadlineAt);
  const created = new Date(createdAt);
  const hoursRemaining = (deadline.getTime() - now.getTime()) / (60 * 60 * 1000);
  const timeText = formatHoursUntilDeadline(hoursRemaining);

  // Build progress bar
  const progressBar = buildProgressBar(created, deadline, now);

  // Format times
  const deadlineDisplay = formatDeadlineForOwner(deadline, ownerTimezone);
  const ownerTimeContext = ownerTimezone ? formatTheirTime(ownerTimezone, now) : null;

  // Status indicator
  const statusMap: Record<string, string> = {
    draft: "Draft",
    active: "Active",
    started: "In Progress",
    blocked: "Blocked",
    done: "Completed",
    canceled: "Canceled",
    expired: "Expired",
  };
  const statusText = statusMap[status] || status;

  const text = `Momentum Lock: ${requiredOutcome}`;

  const blocks: SlackBlock[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "Momentum Lock",
        emoji: false,
      },
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Owner:*\n<@${ownerUserId}>`,
        },
        {
          type: "mrkdwn",
          text: `*Requester:*\n<@${requesterUserId}>`,
        },
        {
          type: "mrkdwn",
          text: `*Status:*\n${statusText}`,
        },
        {
          type: "mrkdwn",
          text: `*Time Remaining:*\n${timeText}`,
        },
      ],
    },
    {
      type: "divider",
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*What's needed:*\n${requiredOutcome}`,
      },
    },
  ];

  // Add fallback info if available
  if (acceptableFallback) {
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `*If blocked:* ${acceptableFallback}`,
        },
      ],
    });
  }

  // Add impact statement if available
  if (impactStatement) {
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `*Why it matters:* ${impactStatement}`,
        },
      ],
    });
  }

  // Add backup person if available
  if (fallbackUserId) {
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `*Backup:* <@${fallbackUserId}>`,
        },
      ],
    });
  }

  blocks.push({ type: "divider" });

  // Progress section
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `\`${progressBar}\`\n*${deadlineDisplay}*`,
    },
  });

  // Add owner's timezone context
  if (ownerTimeContext) {
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: ownerTimeContext,
        },
      ],
    });
  }

  // Add links
  const linkElements: string[] = [];
  if (dashboardUrl) {
    linkElements.push(`<${dashboardUrl}|View in dashboard>`);
  }
  if (threadLink) {
    linkElements.push(`<${threadLink}|View thread>`);
  }

  if (linkElements.length > 0) {
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: linkElements.join(" | "),
        },
      ],
    });
  }

  return { text, blocks };
}
