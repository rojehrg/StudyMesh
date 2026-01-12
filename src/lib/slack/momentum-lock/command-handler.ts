/**
 * Momentum Lock Command Handler
 *
 * Handles the /attunly lock subcommand to create momentum locks.
 */

import { createLogger } from "@/lib/logger";
import { inferLockFromThread, type SlackMessage } from "./inference";
import { buildLockDraftModal, buildMissingFieldModal, openModal, type LockModalConfig } from "./modal-builder";

const log = createLogger({ service: "momentum-lock" });

export interface LockCommandParams {
  teamId: string;
  userId: string;
  userName?: string;
  channelId: string;
  triggerId: string;
  threadTs?: string;  // Only available if invoked from a thread
  text?: string;      // Additional text after "/attunly lock"
}

interface SlackConversationReply {
  messages?: SlackMessage[];
  ok: boolean;
  error?: string;
}

/**
 * Fetch thread messages from Slack
 */
async function fetchThreadMessages(
  channelId: string,
  threadTs: string,
  botToken: string
): Promise<SlackMessage[]> {
  try {
    const response = await fetch(
      `https://slack.com/api/conversations.replies?channel=${channelId}&ts=${threadTs}&limit=50`,
      {
        headers: {
          Authorization: `Bearer ${botToken}`,
        },
      }
    );

    const data: SlackConversationReply = await response.json();

    if (!data.ok) {
      log.error("Failed to fetch thread messages", { error: data.error, channelId, threadTs });
      return [];
    }

    return data.messages || [];
  } catch (error: any) {
    log.error("Error fetching thread messages", { error: error.message, channelId, threadTs });
    return [];
  }
}

/**
 * Post an ephemeral message to the user
 */
async function postEphemeral(
  channelId: string,
  userId: string,
  text: string,
  botToken: string
): Promise<void> {
  try {
    await fetch("https://slack.com/api/chat.postEphemeral", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel: channelId,
        user: userId,
        text,
      }),
    });
  } catch (error: any) {
    log.error("Failed to post ephemeral", { error: error.message });
  }
}

/**
 * Get thread participants for fallback suggestions
 */
function getThreadParticipants(messages: SlackMessage[]): Array<{ id: string; name: string }> {
  const participants = new Map<string, { id: string; name: string }>();

  for (const msg of messages) {
    if (msg.user && !participants.has(msg.user)) {
      participants.set(msg.user, { id: msg.user, name: msg.user }); // Name will be resolved later
    }
  }

  return Array.from(participants.values());
}

/**
 * Handle the /attunly lock command
 *
 * Flow:
 * 1. Check if we're in a thread (required for context)
 * 2. Fetch thread messages
 * 3. Run inference to extract lock fields
 * 4. Open the draft modal (or missing field modal if low confidence)
 */
export async function handleLockCommand(params: LockCommandParams): Promise<{
  success: boolean;
  error?: string;
}> {
  const { teamId, userId, channelId, triggerId, threadTs, text } = params;

  log.info("Lock command received", { teamId, userId, channelId, threadTs });

  const botToken = process.env.SLACK_BOT_TOKEN;
  if (!botToken) {
    log.error("SLACK_BOT_TOKEN not set");
    return { success: false, error: "Bot not configured" };
  }

  // Check if invoked from a thread
  if (!threadTs) {
    // Not in a thread - show helpful message
    await postEphemeral(
      channelId,
      userId,
      "To create a Momentum Lock, use `/attunly lock` in a thread where work is being discussed. " +
      "This allows me to understand the context and suggest who should own the work.",
      botToken
    );
    return { success: true };
  }

  // Fetch thread messages for context
  const messages = await fetchThreadMessages(channelId, threadTs, botToken);

  if (messages.length === 0) {
    // Couldn't read thread - might be a permissions issue
    log.warn("No messages fetched from thread", { channelId, threadTs });
    await postEphemeral(
      channelId,
      userId,
      "I couldn't read this thread. This might be a permissions issue. " +
      "Please ask your Slack admin to reconnect Attunly with the required permissions.",
      botToken
    );
    return { success: false, error: "Could not read thread" };
  }

  log.info("Fetched thread messages", { count: messages.length });

  // Run inference to extract lock fields
  const inference = await inferLockFromThread(messages, userId, teamId);

  // Get thread participants for fallback suggestions
  const threadParticipants = getThreadParticipants(messages);

  // Build modal config
  const modalConfig: LockModalConfig = {
    triggerId,
    channelId,
    threadTs,
    requesterId: userId,
    inference,
    threadParticipants,
  };

  // Choose which modal to show based on inference confidence
  let modal;
  if (inference.confidence === 'low' && inference.missingField) {
    // Single question modal for the most critical missing field
    modal = buildMissingFieldModal(modalConfig, inference.missingField);
    log.info("Showing missing field modal", { missingField: inference.missingField });
  } else {
    // Full draft modal with inferred values
    modal = buildLockDraftModal(modalConfig);
    log.info("Showing full draft modal", { confidence: inference.confidence });
  }

  // Open the modal
  const opened = await openModal(triggerId, modal);

  if (!opened) {
    await postEphemeral(
      channelId,
      userId,
      "Failed to open the lock creation form. Please try again.",
      botToken
    );
    return { success: false, error: "Failed to open modal" };
  }

  log.info("Lock modal opened successfully");
  return { success: true };
}

/**
 * Check if command text indicates a lock subcommand
 */
export function isLockCommand(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  return normalized === 'lock' || normalized.startsWith('lock ');
}

/**
 * Extract any additional text after "lock" keyword
 */
export function parseLockCommandText(text: string): string {
  const normalized = text.trim();
  if (normalized.toLowerCase() === 'lock') {
    return '';
  }
  // Remove "lock " prefix (case insensitive)
  return normalized.replace(/^lock\s+/i, '');
}
