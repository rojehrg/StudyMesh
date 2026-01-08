/**
 * Slack Block Kit Modal Builder
 *
 * Builds the "Ask for Help" modal that opens when users type /attunly.
 *
 * Modal structure (optimized for send rate):
 * 1. Context input (pre-filled with what they typed)
 * 2. Recent contacts (quick-select from recent DMs - PRIMARY)
 * 3. Message preview (AI-generated, editable)
 * 4. Person suggestions (optional, secondary - collapsed by default)
 */

export interface TeamMember {
  slackUserId: string;
  displayName: string;
  score?: number;
  availabilityHint?: string;
}

export interface RecentContact {
  slackUserId: string;
  displayName: string;
  avatarUrl?: string;
}

export interface LingoTranslation {
  originalQuestion: string;
  translatedQuestion: string;
  sourceDepartment: string;
  targetDepartment: string;
  wasTranslated: boolean;
}

export interface ModalConfig {
  initialContext: string;
  teamMembers?: TeamMember[];
  suggestedMessage?: string;
  recentContacts?: RecentContact[];
  lingoTranslation?: LingoTranslation;
}

/**
 * Builds the main "Ask for Help" modal view.
 * Optimized for send rate - keep friction low.
 */
export function buildAskForHelpModal(config: ModalConfig) {
  const { initialContext, teamMembers = [], suggestedMessage, recentContacts = [], lingoTranslation } = config;

  const blocks: any[] = [
    // Context input
    {
      type: 'input',
      block_id: 'context_block',
      label: {
        type: 'plain_text',
        text: 'What do you need help with?',
      },
      element: {
        type: 'plain_text_input',
        action_id: 'context_input',
        multiline: true,
        initial_value: initialContext,
        placeholder: {
          type: 'plain_text',
          text: 'e.g., Quick question about the payments API integration...',
        },
      },
    },
  ];

  // Add lingo translation preview if cross-department translation happened
  if (lingoTranslation?.wasTranslated) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Translated for ${lingoTranslation.targetDepartment}:*\n${lingoTranslation.translatedQuestion}`,
      },
    });
    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `_Your original: "${lingoTranslation.originalQuestion}"_`,
        },
      ],
    });
    blocks.push({
      type: 'divider',
    });
  }

  // Build recipient options - combine recent contacts + suggestions
  const recipientOptions: any[] = [];
  const seenUserIds = new Set<string>();

  // Add recent contacts first (they're the primary quick-select)
  for (const contact of recentContacts) {
    if (!seenUserIds.has(contact.slackUserId)) {
      recipientOptions.push({
        text: {
          type: 'plain_text',
          text: contact.displayName,
        },
        value: contact.slackUserId,
      });
      seenUserIds.add(contact.slackUserId);
    }
  }

  // Add team member suggestions (if any, and not duplicates)
  for (const member of teamMembers) {
    if (!seenUserIds.has(member.slackUserId)) {
      const label = member.availabilityHint
        ? `${member.displayName} - ${member.availabilityHint}`
        : member.displayName;
      recipientOptions.push({
        text: {
          type: 'plain_text',
          text: label,
        },
        value: member.slackUserId,
      });
      seenUserIds.add(member.slackUserId);
    }
  }

  // Recipient selector - always show if we have options
  if (recipientOptions.length > 0) {
    // Pre-select the most recent contact to reduce friction
    const initialOption = recentContacts.length > 0
      ? recipientOptions[0]
      : undefined;

    blocks.push({
      type: 'input',
      block_id: 'recipient_block',
      label: {
        type: 'plain_text',
        text: 'Send to',
      },
      element: {
        type: 'static_select',
        action_id: 'recipient_select',
        placeholder: {
          type: 'plain_text',
          text: 'Select someone',
        },
        options: recipientOptions.slice(0, 10), // Slack limit
        ...(initialOption && { initial_option: initialOption }),
      },
    });
  } else {
    // No contacts available - show users_select to let them pick anyone
    blocks.push({
      type: 'input',
      block_id: 'recipient_block',
      label: {
        type: 'plain_text',
        text: 'Send to',
      },
      element: {
        type: 'users_select',
        action_id: 'recipient_select',
        placeholder: {
          type: 'plain_text',
          text: 'Select someone',
        },
      },
    });
  }

  // Message preview (editable)
  const defaultMessage = suggestedMessage || generateDefaultMessage(initialContext);
  blocks.push({
    type: 'input',
    block_id: 'message_block',
    label: {
      type: 'plain_text',
      text: 'Message',
    },
    element: {
      type: 'plain_text_input',
      action_id: 'message_input',
      multiline: true,
      initial_value: defaultMessage,
    },
  });

  // Simple hint - low pressure
  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: "Sent as a DM. They'll respond when convenient.",
      },
    ],
  });

  return {
    type: 'modal' as const,
    callback_id: 'ask_for_help_submit',
    title: {
      type: 'plain_text' as const,
      text: 'Ask for Help',
    },
    submit: {
      type: 'plain_text' as const,
      text: 'Send', // Direct, action-oriented CTA
    },
    close: {
      type: 'plain_text' as const,
      text: 'Cancel',
    },
    blocks,
  };
}

/**
 * Generates a simple default message when AI isn't available.
 */
function generateDefaultMessage(context: string): string {
  const trimmedContext = context.trim();

  if (!trimmedContext) {
    return "Hey! Quick question when you have a sec. Let me know when's a good time.";
  }

  if (trimmedContext.length < 20) {
    return `Hey! Quick question when you have a sec - ${trimmedContext.toLowerCase()}. No rush.`;
  }

  return `Hey! Quick question when you have a sec.\n\n${trimmedContext}\n\nNo rush - happy to wait for a good time.`;
}

/**
 * Opens a modal in Slack using the trigger_id.
 * Must be called within 3 seconds of receiving the slash command.
 */
export async function openModal(triggerId: string, view: ReturnType<typeof buildAskForHelpModal>) {
  const response = await fetch('https://slack.com/api/views.open', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
    },
    body: JSON.stringify({
      trigger_id: triggerId,
      view,
    }),
  });

  const result = await response.json();

  if (!result.ok) {
    console.error('[Slack Modal] Failed to open:', result.error);
    throw new Error(`Failed to open modal: ${result.error}`);
  }

  return result;
}
