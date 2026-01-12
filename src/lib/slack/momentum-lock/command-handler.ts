/**
 * Momentum Lock Command Handler
 *
 * Simple: /attunly lock → open modal → done
 */

import { buildLockDraftModal, openModal } from "./modal-builder";

export interface LockCommandParams {
  teamId: string;
  userId: string;
  channelId: string;
  triggerId: string;
}

/**
 * Handle the /attunly lock command
 * Simply opens the modal - user fills in everything
 */
export async function handleLockCommand(params: LockCommandParams): Promise<{
  success: boolean;
  error?: string;
}> {
  const { teamId, userId, channelId, triggerId } = params;

  console.log('[Lock Command] Opening modal', { teamId, userId, channelId });

  // Build a simple modal with empty fields
  const modal = buildLockDraftModal({
    triggerId,
    channelId,
    threadTs: '', // Not used anymore
    requesterId: userId,
    inference: {
      requiredOutcome: null,
      primaryOwner: null,
      fallbackOwner: null,
      deadline: null,
      impactStatement: null,
      confidence: 'low',
      missingField: null,
    },
  });

  // Open the modal
  const opened = await openModal(triggerId, modal);

  if (!opened) {
    console.error('[Lock Command] Failed to open modal');
    return { success: false, error: "Failed to open modal" };
  }

  console.log('[Lock Command] Modal opened successfully');
  return { success: true };
}

/**
 * Check if command text indicates a lock subcommand
 */
export function isLockCommand(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  return normalized === 'lock' || normalized.startsWith('lock ');
}
