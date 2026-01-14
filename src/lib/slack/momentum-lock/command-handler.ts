/**
 * Momentum Lock Command Handler
 *
 * Supports two flows:
 * 1. /attunly lock - Opens empty modal for manual entry
 * 2. /attunly lock (from thread) - Extracts context from thread and pre-fills modal
 */

import { buildLockDraftModal, openModal } from "./modal-builder";
import { inferLockFromThread, type SlackMessage } from "./inference";

export interface LockCommandParams {
  teamId: string;
  userId: string;
  channelId: string;
  triggerId: string;
  threadTs?: string; // Optional - if invoked from a thread
}

/**
 * Fetch thread messages from Slack API
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

    const result = await response.json();
    if (!result.ok) {
      console.error("[Lock Command] Failed to fetch thread:", result.error);
      return [];
    }

    return (result.messages || []).map((msg: any) => ({
      user: msg.user || "",
      text: msg.text || "",
      ts: msg.ts || "",
      thread_ts: msg.thread_ts,
      type: msg.type || "message",
    }));
  } catch (error) {
    console.error("[Lock Command] Error fetching thread:", error);
    return [];
  }
}

/**
 * Handle the /attunly lock command
 *
 * If threadTs is provided, will attempt to infer lock details from thread context.
 * Otherwise, opens an empty modal for manual entry.
 */
export async function handleLockCommand(params: LockCommandParams): Promise<{
  success: boolean;
  error?: string;
}> {
  const { teamId, userId, channelId, triggerId, threadTs } = params;

  console.log("[Lock Command] Processing", { teamId, userId, channelId, threadTs: !!threadTs });

  const botToken = process.env.SLACK_BOT_TOKEN;
  if (!botToken) {
    console.error("[Lock Command] SLACK_BOT_TOKEN not set");
    return { success: false, error: "Bot token not configured" };
  }

  // Default empty inference
  let inference: {
    requiredOutcome: string | null;
    primaryOwner: string | null;
    fallbackOwner: string | null;
    deadline: Date | null;
    impactStatement: string | null;
    confidence: "high" | "medium" | "low";
    missingField: "owner" | "deadline" | "outcome" | null;
  } = {
    requiredOutcome: null,
    primaryOwner: null,
    fallbackOwner: null,
    deadline: null,
    impactStatement: null,
    confidence: "low",
    missingField: null,
  };

  // If invoked from a thread, try to infer lock details
  if (threadTs) {
    console.log("[Lock Command] Fetching thread context for inference");

    const messages = await fetchThreadMessages(channelId, threadTs, botToken);

    if (messages.length > 0) {
      console.log("[Lock Command] Running thread inference on", messages.length, "messages");

      const inferredLock = await inferLockFromThread(messages, userId, teamId);

      inference = {
        requiredOutcome: inferredLock.requiredOutcome,
        primaryOwner: inferredLock.primaryOwner,
        fallbackOwner: inferredLock.fallbackOwner,
        deadline: inferredLock.deadline,
        impactStatement: inferredLock.impactStatement,
        confidence: inferredLock.confidence,
        missingField: inferredLock.missingField,
      };

      console.log("[Lock Command] Inference complete", {
        confidence: inference.confidence,
        hasOwner: !!inference.primaryOwner,
        hasOutcome: !!inference.requiredOutcome,
        hasDeadline: !!inference.deadline,
      });
    }
  }

  // Build modal with inferred values (or empty if no thread context)
  const modal = buildLockDraftModal({
    triggerId,
    channelId,
    threadTs: threadTs || undefined,
    requesterId: userId,
    inference,
  });

  // Open the modal
  const opened = await openModal(triggerId, modal);

  if (!opened) {
    console.error("[Lock Command] Failed to open modal");
    return { success: false, error: "Failed to open modal" };
  }

  console.log("[Lock Command] Modal opened successfully");
  return { success: true };
}

/**
 * Check if command text indicates a lock subcommand
 */
export function isLockCommand(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  return normalized === 'lock' || normalized.startsWith('lock ');
}
