/**
 * Momentum Lock Modal Builder
 *
 * Builds Block Kit modals for lock creation and editing.
 */

import { InferredLock, getDeadlineOptions, formatDeadline } from "./inference";

// Slack API types (simplified)
interface SlackBlock {
  type: string;
  [key: string]: any;
}

interface SlackView {
  type: "modal";
  callback_id: string;
  title: { type: "plain_text"; text: string };
  submit?: { type: "plain_text"; text: string };
  close?: { type: "plain_text"; text: string };
  blocks: SlackBlock[];
  private_metadata?: string;
}

export interface LockModalConfig {
  triggerId: string;
  channelId: string;
  threadTs?: string;
  requesterId: string;
  inference: InferredLock;
  threadParticipants?: Array<{ id: string; name: string }>;
}

export interface LockModalPrivateMetadata {
  channelId: string;
  threadTs?: string;
  requesterId: string;
}

const CALLBACK_ID_DRAFT = "momentum_lock_draft";
const CALLBACK_ID_EDIT = "momentum_lock_edit";

/**
 * Build the main lock creation modal
 */
export function buildLockDraftModal(config: LockModalConfig): SlackView {
  const { channelId, threadTs, requesterId, inference } = config;

  const deadlineOptions = getDeadlineOptions();

  const metadata: LockModalPrivateMetadata = {
    channelId,
    threadTs,
    requesterId,
  };

  const blocks: SlackBlock[] = [
    // Owner - who do you need a response from
    {
      type: "input",
      block_id: "owner_block",
      label: { type: "plain_text", text: "Who do you need a response from?" },
      element: {
        type: "users_select",
        action_id: "owner_select",
        placeholder: { type: "plain_text", text: "Select a person" },
        ...(inference.primaryOwner && { initial_user: inference.primaryOwner }),
      },
    },

    // Required Outcome - what do you need from them
    {
      type: "input",
      block_id: "outcome_block",
      label: { type: "plain_text", text: "What do you need from them?" },
      element: {
        type: "plain_text_input",
        action_id: "outcome_input",
        placeholder: { type: "plain_text", text: "e.g., Confirm the API change is safe to ship" },
        ...(inference.requiredOutcome && { initial_value: inference.requiredOutcome }),
        max_length: 200,
      },
      hint: {
        type: "plain_text",
        text: "One sentence is enough. This helps them understand what you're waiting on.",
      },
    },

    // Deadline - when do you need to hear back
    {
      type: "input",
      block_id: "deadline_block",
      label: { type: "plain_text", text: "When do you need to hear back?" },
      element: {
        type: "static_select",
        action_id: "deadline_select",
        placeholder: { type: "plain_text", text: "Select a time" },
        initial_option: {
          text: { type: "plain_text", text: deadlineOptions[1].label },
          value: deadlineOptions[1].value,
        },
        options: deadlineOptions.map(opt => ({
          text: { type: "plain_text", text: opt.label },
          value: opt.value,
        })),
      },
      hint: {
        type: "plain_text",
        text: "This is just for context. It's okay if they can't respond by then.",
      },
    },
  ];

  return {
    type: "modal",
    callback_id: CALLBACK_ID_DRAFT,
    title: { type: "plain_text", text: "Request a response" },
    submit: { type: "plain_text", text: "Send" },
    close: { type: "plain_text", text: "Cancel" },
    blocks,
    private_metadata: JSON.stringify(metadata),
  };
}

/**
 * Build a simpler modal when we need to ask for a missing field
 */
export function buildMissingFieldModal(
  config: LockModalConfig,
  missingField: 'owner' | 'deadline' | 'outcome'
): SlackView {
  const { channelId, threadTs, requesterId, inference } = config;
  const deadlineOptions = getDeadlineOptions();

  const metadata: LockModalPrivateMetadata = {
    channelId,
    threadTs,
    requesterId,
  };

  const blocks: SlackBlock[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Almost there!*\nJust one more thing to create the lock.",
      },
    },
    { type: "divider" },
  ];

  // Add context about what was inferred
  if (inference.requiredOutcome && missingField !== 'outcome') {
    blocks.push({
      type: "context",
      elements: [
        { type: "mrkdwn", text: `📋 *Outcome:* ${inference.requiredOutcome}` },
      ],
    });
  }

  if (inference.primaryOwner && missingField !== 'owner') {
    blocks.push({
      type: "context",
      elements: [
        { type: "mrkdwn", text: `👤 *Owner:* <@${inference.primaryOwner}>` },
      ],
    });
  }

  // Add the missing field input
  switch (missingField) {
    case 'owner':
      blocks.push({
        type: "input",
        block_id: "owner_block",
        label: { type: "plain_text", text: "Who needs to deliver?", emoji: true },
        element: {
          type: "users_select",
          action_id: "owner_select",
          placeholder: { type: "plain_text", text: "Select a person" },
        },
      });
      break;

    case 'deadline':
      blocks.push({
        type: "input",
        block_id: "deadline_block",
        label: { type: "plain_text", text: "When do you need this?", emoji: true },
        element: {
          type: "static_select",
          action_id: "deadline_select",
          placeholder: { type: "plain_text", text: "Select deadline" },
          options: deadlineOptions.map(opt => ({
            text: { type: "plain_text", text: opt.label },
            value: opt.value,
          })),
        },
      });
      break;

    case 'outcome':
      blocks.push({
        type: "input",
        block_id: "outcome_block",
        label: { type: "plain_text", text: "What needs to happen?", emoji: true },
        element: {
          type: "plain_text_input",
          action_id: "outcome_input",
          placeholder: { type: "plain_text", text: "e.g., Review and approve the PR" },
          max_length: 200,
        },
      });
      break;
  }

  return {
    type: "modal",
    callback_id: CALLBACK_ID_DRAFT,
    title: { type: "plain_text", text: "Momentum Lock" },
    submit: { type: "plain_text", text: "Create Lock" },
    close: { type: "plain_text", text: "Cancel" },
    blocks,
    private_metadata: JSON.stringify(metadata),
  };
}

/**
 * Parse form values from modal submission
 */
export interface ParsedLockForm {
  ownerId: string;
  requiredOutcome: string;
  deadlineAt: Date;
}

export function parseLockFormValues(values: Record<string, any>): ParsedLockForm | null {
  try {
    const ownerId = values.owner_block?.owner_select?.selected_user;
    const requiredOutcome = values.outcome_block?.outcome_input?.value;
    const deadlineValue = values.deadline_block?.deadline_select?.selected_option?.value;

    if (!ownerId || !requiredOutcome) {
      return null;
    }

    return {
      ownerId,
      requiredOutcome,
      deadlineAt: deadlineValue ? new Date(deadlineValue) : new Date(Date.now() + 16 * 60 * 60 * 1000),
    };
  } catch {
    return null;
  }
}

/**
 * Build modal for blocked reason (free-text input)
 */
export interface BlockedReasonMetadata {
  lockId: string;
}

const CALLBACK_ID_BLOCKED_REASON = "momentum_lock_blocked_reason";

export function buildBlockedReasonModal(lockId: string): SlackView {
  const metadata: BlockedReasonMetadata = { lockId };

  return {
    type: "modal",
    callback_id: CALLBACK_ID_BLOCKED_REASON,
    title: { type: "plain_text", text: "What's blocking you?" },
    submit: { type: "plain_text", text: "Send" },
    close: { type: "plain_text", text: "Cancel" },
    blocks: [
      {
        type: "input",
        block_id: "reason_block",
        label: { type: "plain_text", text: "What's getting in the way right now?" },
        element: {
          type: "plain_text_input",
          action_id: "reason_input",
          multiline: true,
          max_length: 500,
        },
        hint: {
          type: "plain_text",
          text: "A short answer is fine.",
        },
      },
    ],
    private_metadata: JSON.stringify(metadata),
  };
}

export { CALLBACK_ID_DRAFT, CALLBACK_ID_EDIT, CALLBACK_ID_BLOCKED_REASON };

/**
 * Open a modal via Slack API
 */
export async function openModal(triggerId: string, view: SlackView): Promise<boolean> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    console.error("[Modal] SLACK_BOT_TOKEN not set");
    return false;
  }

  console.log("[Modal] Opening modal", {
    callback_id: view.callback_id,
    trigger_id_prefix: triggerId.substring(0, 20),
  });

  try {
    // 2.5-second timeout (Slack trigger_id expires after 3 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch("https://slack.com/api/views.open", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        trigger_id: triggerId,
        view,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!data.ok) {
      console.error("[Modal] Slack API error:", {
        error: data.error,
        response_metadata: data.response_metadata,
        callback_id: view.callback_id,
      });
      return false;
    }

    console.log("[Modal] Modal opened successfully", { callback_id: view.callback_id });
    return true;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error("[Modal] Timeout - trigger_id may have expired");
    } else {
      console.error("[Modal] Exception:", error.message);
    }
    return false;
  }
}
