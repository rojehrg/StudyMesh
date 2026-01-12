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
  const { channelId, threadTs, requesterId, inference, threadParticipants } = config;

  const deadlineOptions = getDeadlineOptions();
  const defaultDeadline = inference.deadline
    ? inference.deadline.toISOString()
    : deadlineOptions[2].value; // Tomorrow morning

  const metadata: LockModalPrivateMetadata = {
    channelId,
    threadTs,
    requesterId,
  };

  const blocks: SlackBlock[] = [
    // Header section
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Create a Momentum Lock*\nSet clear expectations for when this work needs to be done.",
      },
    },
    { type: "divider" },

    // Primary Owner
    {
      type: "input",
      block_id: "owner_block",
      label: { type: "plain_text", text: "Who needs to deliver?", emoji: true },
      element: {
        type: "users_select",
        action_id: "owner_select",
        placeholder: { type: "plain_text", text: "Select a person" },
        ...(inference.primaryOwner && { initial_user: inference.primaryOwner }),
      },
    },

    // Fallback Owner (optional)
    {
      type: "input",
      block_id: "fallback_block",
      optional: true,
      label: { type: "plain_text", text: "Fallback (if they're blocked)", emoji: true },
      element: {
        type: "users_select",
        action_id: "fallback_select",
        placeholder: { type: "plain_text", text: "Select a backup person" },
        ...(inference.fallbackOwner && { initial_user: inference.fallbackOwner }),
      },
    },

    // Required Outcome
    {
      type: "input",
      block_id: "outcome_block",
      label: { type: "plain_text", text: "What needs to happen?", emoji: true },
      element: {
        type: "plain_text_input",
        action_id: "outcome_input",
        placeholder: { type: "plain_text", text: "e.g., Review and approve the PR" },
        ...(inference.requiredOutcome && { initial_value: inference.requiredOutcome }),
        max_length: 200,
      },
      hint: {
        type: "plain_text",
        text: "One clear sentence describing the deliverable.",
      },
    },

    // Acceptable Fallback (optional)
    {
      type: "input",
      block_id: "fallback_outcome_block",
      optional: true,
      label: { type: "plain_text", text: "Acceptable fallback outcome", emoji: true },
      element: {
        type: "plain_text_input",
        action_id: "fallback_outcome_input",
        placeholder: { type: "plain_text", text: "e.g., Leave comments with concerns" },
        max_length: 200,
      },
      hint: {
        type: "plain_text",
        text: "What's acceptable if full delivery isn't possible?",
      },
    },

    // Deadline
    {
      type: "input",
      block_id: "deadline_block",
      label: { type: "plain_text", text: "When do you need this?", emoji: true },
      element: {
        type: "static_select",
        action_id: "deadline_select",
        placeholder: { type: "plain_text", text: "Select deadline" },
        initial_option: {
          text: { type: "plain_text", text: deadlineOptions[2].label },
          value: deadlineOptions[2].value,
        },
        options: deadlineOptions.map(opt => ({
          text: { type: "plain_text", text: opt.label },
          value: opt.value,
        })),
      },
    },

    // Context hint
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "💡 The owner will receive a message when they wake up with everything they need to act.",
        },
      ],
    },
  ];

  // If inference confidence is low, show a hint
  if (inference.confidence === 'low') {
    blocks.splice(2, 0, {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "⚠️ _Couldn't infer all details from the thread. Please fill in the blanks._",
        },
      ],
    });
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
  fallbackId?: string;
  requiredOutcome: string;
  acceptableFallback?: string;
  deadlineAt: Date;
}

export function parseLockFormValues(values: Record<string, any>): ParsedLockForm | null {
  try {
    const ownerId = values.owner_block?.owner_select?.selected_user;
    const fallbackId = values.fallback_block?.fallback_select?.selected_user;
    const requiredOutcome = values.outcome_block?.outcome_input?.value;
    const acceptableFallback = values.fallback_outcome_block?.fallback_outcome_input?.value;
    const deadlineValue = values.deadline_block?.deadline_select?.selected_option?.value;

    if (!ownerId || !requiredOutcome) {
      return null;
    }

    return {
      ownerId,
      fallbackId: fallbackId || undefined,
      requiredOutcome,
      acceptableFallback: acceptableFallback || undefined,
      deadlineAt: deadlineValue ? new Date(deadlineValue) : new Date(Date.now() + 16 * 60 * 60 * 1000),
    };
  } catch {
    return null;
  }
}

/**
 * Open a modal via Slack API
 */
export async function openModal(triggerId: string, view: SlackView): Promise<boolean> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    console.error("SLACK_BOT_TOKEN not set");
    return false;
  }

  try {
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
    });

    const data = await response.json();

    if (!data.ok) {
      console.error("Failed to open modal:", data.error, data.response_metadata);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error opening modal:", error);
    return false;
  }
}

export { CALLBACK_ID_DRAFT, CALLBACK_ID_EDIT };
