/**
 * Momentum Lock Message Builders
 *
 * Builds Slack messages for wake-up DMs, escalations, and notifications.
 */

import { type MomentumLock } from "@/lib/db/schema";
import { getTimezoneAbbrev } from "@/lib/availability";

interface SlackBlock {
  type: string;
  [key: string]: any;
}

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
 */
export function buildWakeUpMessage(lock: MomentumLock, threadLink: string | null): {
  text: string;
  blocks: SlackBlock[];
} {
  const { requesterUserId, requiredOutcome, acceptableFallback, impactStatement, deadlineAt, ownerTimezone, requesterTimezone } = lock;

  // Calculate remaining time
  const now = new Date();
  const deadline = new Date(deadlineAt);
  const diff = deadline.getTime() - now.getTime();
  const hoursRemaining = Math.max(0, Math.round(diff / (60 * 60 * 1000)));

  let urgencyText: string;
  if (hoursRemaining <= 1) {
    urgencyText = "Less than 1 hour remaining";
  } else if (hoursRemaining <= 3) {
    urgencyText = `${hoursRemaining} hours remaining (soon)`;
  } else if (hoursRemaining <= 8) {
    urgencyText = `${hoursRemaining} hours remaining`;
  } else {
    urgencyText = `${hoursRemaining} hours remaining`;
  }

  const fallbackSection = acceptableFallback
    ? `\n\n*If blocked:* _${acceptableFallback}_`
    : "";

  const impactSection = impactStatement
    ? `\n\n*Why it matters:* ${impactStatement}`
    : "";

  // Format deadline in owner's timezone
  const deadlineDisplay = formatDeadlineForOwner(deadline, ownerTimezone);

  // Build timezone context block (shows "Your time | Their time" if different)
  const timezoneContextBlock = buildTimezoneContextBlock(ownerTimezone, requesterTimezone, now);

  const text = `While you were offline, the team set a Momentum Lock. ${requiredOutcome}`;

  const blocks: SlackBlock[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "Momentum Lock",
        emoji: true,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `While you were offline, <@${requesterUserId}> set a commitment for you.`,
      },
    },
    // Add timezone context block if timezones differ
    ...(timezoneContextBlock ? [timezoneContextBlock] : []),
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
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: threadLink
            ? `*${deadlineDisplay}* (${urgencyText}) | <${threadLink}|View thread>`
            : `*${deadlineDisplay}* (${urgencyText})`,
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
            emoji: true,
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
            emoji: true,
          },
          action_id: "momentum_lock_blocked",
          value: lock.id,
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Done",
            emoji: true,
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
            emoji: true,
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
 */
export function buildEscalationMessage(lock: MomentumLock, threadLink: string | null): {
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

  const text = `Heads up. A Momentum Lock may need backup. The team is waiting on: ${requiredOutcome}`;

  const fallbackHint = acceptableFallback
    ? `\n\n_Even partial progress counts: ${acceptableFallback}_`
    : "\n\n_Even a partial unblock keeps things moving._";

  const blocks: SlackBlock[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Heads up.* A Momentum Lock may need backup.`,
      },
    },
    {
      type: "divider",
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*The team is waiting on:*\n${requiredOutcome}\n\n*Original owner:* <@${ownerUserId}>\n*Time remaining:* ${timeText}${fallbackHint}`,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: threadLink
            ? `<${threadLink}|View thread> • If you can't help, no worries—you can ignore this.`
            : `If you can't help, no worries—you can ignore this.`,
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
            emoji: true,
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
            emoji: true,
          },
          action_id: "momentum_lock_reassign_partial",
          value: lock.id,
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "I Cannot Help",
            emoji: true,
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
 */
export function buildReminderMessage(
  lock: MomentumLock,
  threadLink: string | null,
  isUrgent: boolean = false
): {
  text: string;
  blocks: SlackBlock[];
} {
  const { requesterUserId, requiredOutcome, acceptableFallback, deadlineAt, ownerTimezone, requesterTimezone } = lock;

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

  const header = isUrgent
    ? "Deadline approaching soon"
    : "Friendly reminder";

  const text = `${header}: ${requiredOutcome} (${timeText} remaining)`;

  const fallbackSection = acceptableFallback
    ? `\n\n*If blocked:* _${acceptableFallback}_`
    : "";

  // Format deadline in owner's timezone
  const deadlineDisplay = formatDeadlineForOwner(deadline, ownerTimezone);

  // Build timezone context block (shows "Your time | Their time" if different)
  const timezoneContextBlock = buildTimezoneContextBlock(ownerTimezone, requesterTimezone, now);

  const blocks: SlackBlock[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: isUrgent
          ? `*Deadline approaching soon*\n\n<@${requesterUserId}> is waiting on:\n_${requiredOutcome}_${fallbackSection}`
          : `*Friendly reminder*\n\n<@${requesterUserId}> is waiting on:\n_${requiredOutcome}_${fallbackSection}`,
      },
    },
    // Add timezone context block if timezones differ
    ...(timezoneContextBlock ? [timezoneContextBlock] : []),
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: threadLink
            ? `*${deadlineDisplay}* (${timeText} remaining) | <${threadLink}|View thread>`
            : `*${deadlineDisplay}* (${timeText} remaining)`,
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
            emoji: true,
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
            emoji: true,
          },
          action_id: "momentum_lock_blocked",
          value: lock.id,
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Done",
            emoji: true,
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
