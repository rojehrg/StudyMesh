import { NextResponse } from 'next/server';
import { verifySlackRequest } from '@/lib/slack/verify-signature';
import { db } from '@/lib/db';
import { commandEvents, momentumLocks, momentumLockEvents } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createLogger } from '@/lib/logger';
import {
  parseLockFormValues,
  CALLBACK_ID_DRAFT,
  CALLBACK_ID_EDIT,
  CALLBACK_ID_BLOCKED_REASON,
  buildBlockedReasonModal,
  openModal,
  type LockModalPrivateMetadata,
  type BlockedReasonMetadata,
} from '@/lib/slack/momentum-lock/modal-builder';

const log = createLogger({ service: 'momentum-lock' });

/**
 * Track command events for send rate measurement
 * North star metric: send_rate = sent / modal_opened
 */
async function trackEvent(
  eventType: 'invoked' | 'modal_opened' | 'sent' | 'abandoned',
  slackUserId: string,
  slackTeamId: string,
  context?: string,
  recipientSlackId?: string,
  metadata?: Record<string, any>
) {
  try {
    await db.insert(commandEvents).values({
      slackUserId,
      slackTeamId,
      eventType,
      context: context?.slice(0, 500),
      recipientSlackId,
      metadata: metadata || {},
    });
  } catch (error) {
    console.error('[Slack Interactions] Failed to track event:', error);
  }
}

/**
 * Slack Interactions Handler
 *
 * Handles:
 * - view_submission: When user submits a modal
 * - view_closed: When user closes modal without submitting
 * - block_actions: When user clicks a button or selects from dropdown
 */
export async function POST(request: Request) {
  try {
    const body = await request.text();

    const isValid = await verifySlackRequest(request, body);
    if (!isValid) {
      console.error('[Slack Interactions] Invalid signature');
      return NextResponse.json(
        { error: 'Invalid request signature' },
        { status: 401 }
      );
    }

    const params = new URLSearchParams(body);
    const payloadStr = params.get('payload');

    if (!payloadStr) {
      console.error('[Slack Interactions] No payload found');
      return NextResponse.json(
        { error: 'No payload' },
        { status: 400 }
      );
    }

    const payload = JSON.parse(payloadStr);
    const { type, user, team, view } = payload;
    // callback_id is inside view for modal submissions
    const callback_id = view?.callback_id || payload.callback_id;

    console.log('[Slack Interactions] Received:', {
      type,
      callback_id,
      userId: user?.id,
      teamId: team?.id,
      viewCallbackId: view?.callback_id,
      payloadCallbackId: payload.callback_id,
      viewType: view?.type,
    });

    console.log('[Slack Interactions] About to handle type:', type);

    switch (type) {
      case 'view_submission':
        return handleViewSubmission(payload);

      case 'view_closed':
        // Track abandoned events when modal is closed without submitting
        if (callback_id === 'ask_for_help_submit' && user?.id && team?.id) {
          const context = view?.state?.values?.context_block?.context_input?.value;
          trackEvent('abandoned', user.id, team.id, context);
        }
        return NextResponse.json({ ok: true });

      case 'block_actions':
        return handleBlockActions(payload);

      case 'shortcut':
        // Global shortcuts
        return handleShortcut(payload);

      default:
        console.warn('[Slack Interactions] Unknown type:', type);
        return NextResponse.json({ ok: true });
    }
  } catch (error) {
    console.error('[Slack Interactions] Error:', error);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}

/**
 * Handles modal form submissions.
 */
async function handleViewSubmission(payload: any) {
  const { user, team, view } = payload;
  const callback_id = view?.callback_id;

  // Handle momentum lock modal submissions
  if (callback_id === CALLBACK_ID_DRAFT || callback_id === CALLBACK_ID_EDIT) {
    return handleLockModalSubmission(payload);
  }

  // Handle blocked reason modal submission
  if (callback_id === CALLBACK_ID_BLOCKED_REASON) {
    return handleBlockedReasonSubmission(payload);
  }

  if (callback_id !== 'ask_for_help_submit') {
    console.warn('[Slack Interactions] Unknown callback_id:', callback_id);
    return NextResponse.json({ ok: true });
  }

  const values = view.state.values;

  const context = values.context_block?.context_input?.value || '';
  // Handle both static_select and users_select
  const recipientId =
    values.recipient_block?.recipient_select?.selected_option?.value ||
    values.recipient_block?.recipient_select?.selected_user;
  const message = values.message_block?.message_input?.value || '';

  console.log('[Slack Interactions] Form submitted:', {
    userId: user.id,
    context,
    recipientId,
    messageLength: message.length,
  });

  // Validate recipient
  if (!recipientId) {
    return NextResponse.json({
      response_action: 'errors',
      errors: {
        recipient_block: 'Please select someone to send this to.',
      },
    });
  }

  try {
    await sendSlackDM(recipientId, message, user.id, team.id);

    // Track successful send
    if (user?.id && team?.id) {
      trackEvent('sent', user.id, team.id, context, recipientId, {
        messageLength: message.length,
      });
    }

    // Send confirmation to sender
    await sendConfirmationToSender(user.id, recipientId);

    return NextResponse.json({
      response_action: 'clear',
    });
  } catch (error) {
    console.error('[Slack Interactions] Failed to send DM:', error);

    return NextResponse.json({
      response_action: 'errors',
      errors: {
        message_block: 'Failed to send message. Please try again.',
      },
    });
  }
}

/**
 * Handles button clicks and dropdown selections.
 */
async function handleBlockActions(payload: any) {
  const { actions, user, team, channel, message, response_url } = payload;

  for (const action of actions) {
    const actionId = action.action_id;
    const value = action.value || action.selected_option?.value || action.selected_user;

    console.log('[Slack Interactions] Action:', { actionId, value });

    // Handle momentum lock actions
    if (actionId.startsWith('momentum_lock_') || actionId.startsWith('blocked_')) {
      return handleLockAction(actionId, value, user, team, response_url, payload);
    }
  }

  return NextResponse.json({ ok: true });
}

/**
 * Handle momentum lock button actions
 */
async function handleLockAction(
  actionId: string,
  lockId: string,
  user: any,
  team: any,
  responseUrl: string,
  payload: any
): Promise<NextResponse> {
  log.info('Lock action received', { actionId, lockId, userId: user?.id });

  const botToken = process.env.SLACK_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ ok: true });
  }

  try {
    // Fetch the lock
    const [lock] = await db
      .select()
      .from(momentumLocks)
      .where(eq(momentumLocks.id, lockId));

    if (!lock) {
      log.error('Lock not found', { lockId });
      await respondEphemeral(responseUrl, 'Lock not found.');
      return NextResponse.json({ ok: true });
    }

    switch (actionId) {
      case 'momentum_lock_start':
        return handleStartAction(lock, user, responseUrl);

      case 'momentum_lock_blocked':
        return handleBlockedAction(lock, user, responseUrl, payload);

      case 'momentum_lock_done':
        return handleDoneAction(lock, user, responseUrl);

      case 'momentum_lock_context':
        return handleContextAction(lock, user, responseUrl);

      // Blocked flow options
      case 'blocked_need_input':
        return handleBlockedNeedInput(lock, user, responseUrl);

      case 'blocked_partial':
        return handleBlockedPartial(lock, user, responseUrl);

      case 'blocked_rescope':
        return handleBlockedRescope(lock, user, responseUrl);

      case 'blocked_escalate_now':
        return handleBlockedEscalateNow(lock, user, responseUrl);

      // Escalation responses
      case 'momentum_lock_reassign_full':
        return handleReassignFull(lock, user, responseUrl);

      case 'momentum_lock_reassign_partial':
        return handleReassignPartial(lock, user, responseUrl);

      case 'momentum_lock_cannot_help':
        return handleCannotHelp(lock, user, responseUrl);

      default:
        log.warn('Unknown lock action', { actionId });
        return NextResponse.json({ ok: true });
    }
  } catch (error: any) {
    log.error('Error handling lock action', { error: error.message, actionId, lockId });
    return NextResponse.json({ ok: true });
  }
}

/**
 * Handle "Start" action - owner begins work
 */
async function handleStartAction(lock: any, user: any, responseUrl: string) {
  await db
    .update(momentumLocks)
    .set({ status: 'started' })
    .where(eq(momentumLocks.id, lock.id));

  await db.insert(momentumLockEvents).values({
    lockId: lock.id,
    eventType: 'started',
    actorUserId: user.id,
  });

  // Notify requester that owner started
  await notifyRequester(lock, user.id, 'started');

  // Confirm to owner
  await respondEphemeral(responseUrl, 'Got it. The requester has been notified.');

  log.info('Lock started', { lockId: lock.id, userId: user.id });
  return NextResponse.json({ ok: true });
}

/**
 * Handle "Blocked" action - open free-text modal for reason
 * MVP: Simple free-text input instead of 4-option menu
 */
async function handleBlockedAction(lock: any, user: any, responseUrl: string, payload: any) {
  // Open modal for blocked reason
  const triggerId = payload.trigger_id;
  if (!triggerId) {
    await respondEphemeral(responseUrl, 'Something went wrong. Please try again.');
    return NextResponse.json({ ok: true });
  }

  const modal = buildBlockedReasonModal(lock.id);
  const success = await openModal(triggerId, modal);

  if (!success) {
    await respondEphemeral(responseUrl, 'Failed to open the form. Please try again.');
  }

  return NextResponse.json({ ok: true });
}

/**
 * Handle "Done" action - owner completed the work
 */
async function handleDoneAction(lock: any, user: any, responseUrl: string) {
  await db
    .update(momentumLocks)
    .set({ status: 'done' })
    .where(eq(momentumLocks.id, lock.id));

  await db.insert(momentumLockEvents).values({
    lockId: lock.id,
    eventType: 'done',
    actorUserId: user.id,
  });

  // Notify requester
  await notifyRequester(lock, user.id, 'completed');

  // Confirm to owner
  await respondEphemeral(responseUrl, 'Done. The requester has been notified.');

  log.info('Lock completed', { lockId: lock.id, userId: user.id });
  return NextResponse.json({ ok: true });
}

/**
 * Handle "Need Context" action
 */
async function handleContextAction(lock: any, user: any, responseUrl: string) {
  const { generateThreadLink } = await import('@/lib/slack/momentum-lock/messages');
  const threadLink = generateThreadLink(lock.workspaceId, lock.channelId, lock.threadTs);

  await respondEphemeral(
    responseUrl,
    `Here's the original thread where this was discussed: ${threadLink}\n\nIf you need more context, reply to the requester <@${lock.requesterUserId}> directly.`
  );

  return NextResponse.json({ ok: true });
}

/**
 * Handle blocked - need input from someone else
 */
async function handleBlockedNeedInput(lock: any, user: any, responseUrl: string) {
  await db
    .update(momentumLocks)
    .set({ status: 'blocked' })
    .where(eq(momentumLocks.id, lock.id));

  await db.insert(momentumLockEvents).values({
    lockId: lock.id,
    eventType: 'blocked',
    actorUserId: user.id,
    payload: { reason: 'need_input' },
  });

  await postToThread(lock, `<@${user.id}> is blocked and needs input from someone else.`);
  await respondEphemeral(responseUrl, 'Got it. The requester has been notified that you need input from someone.');

  return NextResponse.json({ ok: true });
}

/**
 * Handle blocked - can ship partial version
 */
async function handleBlockedPartial(lock: any, user: any, responseUrl: string) {
  await db
    .update(momentumLocks)
    .set({ status: 'blocked' })
    .where(eq(momentumLocks.id, lock.id));

  await db.insert(momentumLockEvents).values({
    lockId: lock.id,
    eventType: 'blocked',
    actorUserId: user.id,
    payload: { reason: 'partial_delivery' },
  });

  await postToThread(lock, `<@${user.id}> can ship a partial version. ${lock.acceptableFallback ? `Fallback plan: ${lock.acceptableFallback}` : ''}`);
  await respondEphemeral(responseUrl, 'Got it. The requester has been notified about the partial delivery.');

  return NextResponse.json({ ok: true });
}

/**
 * Handle blocked - should be re-scoped
 */
async function handleBlockedRescope(lock: any, user: any, responseUrl: string) {
  await db.insert(momentumLockEvents).values({
    lockId: lock.id,
    eventType: 'blocked',
    actorUserId: user.id,
    payload: { reason: 'needs_rescope' },
  });

  await postToThread(lock, `<@${user.id}> thinks this should be re-scoped. <@${lock.requesterUserId}>, can you discuss the smallest shippable version?`);
  await respondEphemeral(responseUrl, 'Got it. The requester has been pinged to discuss re-scoping.');

  return NextResponse.json({ ok: true });
}

/**
 * Handle blocked - can't touch before they wake (immediate escalation)
 */
async function handleBlockedEscalateNow(lock: any, user: any, responseUrl: string) {
  if (!lock.fallbackUserId) {
    await respondEphemeral(responseUrl, 'No fallback person is set for this lock. Please reach out to the requester directly.');
    return NextResponse.json({ ok: true });
  }

  // Trigger immediate escalation
  const { buildEscalationMessage, generateThreadLink } = await import('@/lib/slack/momentum-lock/messages');
  const threadLink = generateThreadLink(lock.workspaceId, lock.channelId, lock.threadTs);
  const message = buildEscalationMessage(lock, threadLink);

  const botToken = process.env.SLACK_BOT_TOKEN;
  if (botToken) {
    // Send to fallback
    const openResponse = await fetch('https://slack.com/api/conversations.open', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ users: lock.fallbackUserId }),
    });

    const openResult = await openResponse.json();
    if (openResult.ok) {
      await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: openResult.channel.id,
          text: message.text,
          blocks: message.blocks,
        }),
      });
    }
  }

  await db
    .update(momentumLocks)
    .set({ escalationSentAt: new Date() })
    .where(eq(momentumLocks.id, lock.id));

  await db.insert(momentumLockEvents).values({
    lockId: lock.id,
    eventType: 'escalated',
    actorUserId: user.id,
    payload: { reason: 'manual_escalation', escalatedTo: lock.fallbackUserId },
  });

  await respondEphemeral(responseUrl, `Escalated to <@${lock.fallbackUserId}>. They'll be notified to help.`);

  return NextResponse.json({ ok: true });
}

/**
 * Handle fallback taking full ownership
 */
async function handleReassignFull(lock: any, user: any, responseUrl: string) {
  const previousOwner = lock.ownerUserId;

  await db
    .update(momentumLocks)
    .set({
      ownerUserId: user.id,
      status: 'active',
    })
    .where(eq(momentumLocks.id, lock.id));

  await db.insert(momentumLockEvents).values({
    lockId: lock.id,
    eventType: 'reassigned',
    actorUserId: user.id,
    payload: { previousOwner, newOwner: user.id, type: 'full' },
  });

  await postToThread(lock, `<@${user.id}> is taking over this lock from <@${previousOwner}>.`);
  await respondEphemeral(responseUrl, 'You\'ve taken ownership of this lock. Good luck!');

  return NextResponse.json({ ok: true });
}

/**
 * Handle fallback helping partially
 */
async function handleReassignPartial(lock: any, user: any, responseUrl: string) {
  await db.insert(momentumLockEvents).values({
    lockId: lock.id,
    eventType: 'reassigned',
    actorUserId: user.id,
    payload: { helper: user.id, type: 'partial' },
  });

  await postToThread(lock, `<@${user.id}> is helping with this lock. <@${lock.ownerUserId}> is still the primary owner.`);
  await respondEphemeral(responseUrl, 'Thanks for helping! The original owner is still responsible, but your help is appreciated.');

  return NextResponse.json({ ok: true });
}

/**
 * Handle fallback unable to help
 */
async function handleCannotHelp(lock: any, user: any, responseUrl: string) {
  await db.insert(momentumLockEvents).values({
    lockId: lock.id,
    eventType: 'escalated',
    actorUserId: user.id,
    payload: { fallbackDeclined: true },
  });

  await respondEphemeral(responseUrl, 'No problem. Thanks for letting us know.');

  return NextResponse.json({ ok: true });
}

/**
 * Post a message to the lock's thread
 */
async function postToThread(lock: any, text: string) {
  const botToken = process.env.SLACK_BOT_TOKEN;
  if (!botToken) return;

  try {
    await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: lock.channelId,
        thread_ts: lock.threadTs,
        text,
      }),
    });
  } catch (error: any) {
    log.error('Failed to post to thread', { error: error.message });
  }
}

/**
 * Notify the requester about a status change
 * MVP format: simple, clear updates
 */
async function notifyRequester(lock: any, actorUserId: string, status: 'started' | 'completed') {
  const botToken = process.env.SLACK_BOT_TOKEN;
  if (!botToken || lock.requesterUserId === actorUserId) return;

  try {
    const openResponse = await fetch('https://slack.com/api/conversations.open', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ users: lock.requesterUserId }),
    });

    const openResult = await openResponse.json();
    if (!openResult.ok) return;

    let text: string;
    if (status === 'started') {
      text = `Update: <@${actorUserId}> saw your request and started looking into it.`;
    } else {
      text = `Update: <@${actorUserId}> marked your request as done.`;
    }

    await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: openResult.channel.id,
        text,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Re: ${lock.requiredOutcome}`,
              },
            ],
          },
        ],
      }),
    });

    log.info('Requester notified', { lockId: lock.id, status });
  } catch (error: any) {
    log.error('Failed to notify requester', { error: error.message });
  }
}

/**
 * Send ephemeral response via response_url
 */
async function respondEphemeral(responseUrl: string, text: string) {
  try {
    await fetch(responseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        replace_original: false,
        response_type: 'ephemeral',
        text,
      }),
    });
  } catch (error: any) {
    log.error('Failed to send ephemeral response', { error: error.message });
  }
}

/**
 * Sends a DM to a Slack user with strong sender attribution and reply button.
 */
async function sendSlackDM(
  recipientId: string,
  message: string,
  senderId: string,
  teamId: string
) {
  const botToken = process.env.SLACK_BOT_TOKEN;

  if (!botToken) {
    throw new Error('SLACK_BOT_TOKEN not configured');
  }

  // Open a conversation with the recipient
  const openResponse = await fetch('https://slack.com/api/conversations.open', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${botToken}`,
    },
    body: JSON.stringify({
      users: recipientId,
    }),
  });

  const openResult = await openResponse.json();

  if (!openResult.ok) {
    throw new Error(`Failed to open conversation: ${openResult.error}`);
  }

  const channelId = openResult.channel.id;

  // Build deep link for reply button
  const replyDeepLink = `slack://user?team=${teamId}&id=${senderId}`;

  // Send the message with strong attribution and reply button
  const messageResponse = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${botToken}`,
    },
    body: JSON.stringify({
      channel: channelId,
      text: `<@${senderId}> asked via Attunly:\n\n${message}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*<@${senderId}> asked via Attunly:*`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: message,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: `Reply to <@${senderId}>`,
                emoji: true,
              },
              url: replyDeepLink,
              action_id: 'reply_to_sender',
            },
          ],
        },
      ],
    }),
  });

  const messageResult = await messageResponse.json();

  if (!messageResult.ok) {
    throw new Error(`Failed to send message: ${messageResult.error}`);
  }

  return messageResult;
}

/**
 * Sends confirmation to sender that message was delivered.
 * "Sent to @Bob. If they reply, it will come back to you directly."
 */
async function sendConfirmationToSender(senderId: string, recipientId: string) {
  const botToken = process.env.SLACK_BOT_TOKEN;

  if (!botToken) return;

  try {
    // Open conversation with sender
    const openResponse = await fetch('https://slack.com/api/conversations.open', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${botToken}`,
      },
      body: JSON.stringify({
        users: senderId,
      }),
    });

    const openResult = await openResponse.json();
    if (!openResult.ok) return;

    // Send confirmation with reply expectation
    await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${botToken}`,
      },
      body: JSON.stringify({
        channel: openResult.channel.id,
        text: `Sent to <@${recipientId}>. If they reply, it will come back to you directly.`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `Sent to <@${recipientId}>. If they reply, it will come back to you directly.`,
            },
          },
        ],
      }),
    });
  } catch (error) {
    // Non-critical - don't fail if confirmation doesn't send
    console.error('[Slack Interactions] Failed to send confirmation:', error);
  }
}


/**
 * Handle global shortcuts
 */
async function handleShortcut(payload: any) {
  const { callback_id } = payload;

  log.info('Global shortcut received', { callback_id });

  // No global shortcuts implemented yet
  return NextResponse.json({ ok: true });
}

/**
 * Handle momentum lock modal submission
 */
async function handleLockModalSubmission(payload: any) {
  const { user, team, view } = payload;
  const values = view.state.values;

  log.info('Lock modal submitted', { userId: user?.id, teamId: team?.id });

  // Parse private metadata for channel/thread context
  let metadata: LockModalPrivateMetadata;
  try {
    metadata = JSON.parse(view.private_metadata || '{}');
  } catch {
    log.error('Failed to parse modal metadata');
    return NextResponse.json({
      response_action: 'errors',
      errors: {
        outcome_block: 'Something went wrong. Please try again.',
      },
    });
  }

  // Parse form values
  const formData = parseLockFormValues(values);

  if (!formData) {
    return NextResponse.json({
      response_action: 'errors',
      errors: {
        owner_block: 'Please select who needs to deliver.',
        outcome_block: 'Please describe what needs to happen.',
      },
    });
  }

  const { ownerId, requiredOutcome, deadlineAt } = formData;
  const { channelId, threadTs, requesterId } = metadata;

  try {
    // Create the lock in the database
    const [newLock] = await db.insert(momentumLocks).values({
      workspaceId: team.id,
      channelId,
      threadTs,
      createdByUserId: user.id,
      requesterUserId: requesterId,
      ownerUserId: ownerId,
      requiredOutcome,
      deadlineAt,
      status: 'active',
    }).returning();

    log.info('Lock created', { lockId: newLock.id, ownerId, deadlineAt });

    // Log the creation event
    await db.insert(momentumLockEvents).values({
      lockId: newLock.id,
      eventType: 'created',
      actorUserId: user.id,
      payload: {
        requiredOutcome,
        deadlineAt: deadlineAt.toISOString(),
      },
    });

    // Send DM to owner immediately
    await postLockConfirmation({
      channelId,
      threadTs,
      lockId: newLock.id,
      ownerId,
      requiredOutcome,
      deadlineAt,
      requesterId,
    });

    return NextResponse.json({
      response_action: 'clear',
    });
  } catch (error: any) {
    log.error('Failed to create lock', { error: error.message });
    return NextResponse.json({
      response_action: 'errors',
      errors: {
        outcome_block: 'Failed to create lock. Please try again.',
      },
    });
  }
}

/**
 * Handle blocked reason modal submission
 * MVP: Simple free-text reason, notify requester immediately
 */
async function handleBlockedReasonSubmission(payload: any) {
  const { user, team, view } = payload;
  const values = view.state.values;

  log.info('Blocked reason submitted', { userId: user?.id });

  // Parse metadata to get lockId
  let metadata: BlockedReasonMetadata;
  try {
    metadata = JSON.parse(view.private_metadata || '{}');
  } catch {
    log.error('Failed to parse blocked reason metadata');
    return NextResponse.json({
      response_action: 'errors',
      errors: {
        reason_block: 'Something went wrong. Please try again.',
      },
    });
  }

  const { lockId } = metadata;
  const reason = values.reason_block?.reason_input?.value || '';

  if (!reason.trim()) {
    return NextResponse.json({
      response_action: 'errors',
      errors: {
        reason_block: 'Please describe what\'s blocking you.',
      },
    });
  }

  try {
    // Fetch the lock
    const [lock] = await db
      .select()
      .from(momentumLocks)
      .where(eq(momentumLocks.id, lockId));

    if (!lock) {
      log.error('Lock not found for blocked reason', { lockId });
      return NextResponse.json({ response_action: 'clear' });
    }

    // Update status to blocked
    await db
      .update(momentumLocks)
      .set({ status: 'blocked' })
      .where(eq(momentumLocks.id, lockId));

    // Log the event with reason
    await db.insert(momentumLockEvents).values({
      lockId,
      eventType: 'blocked',
      actorUserId: user.id,
      payload: { reason },
    });

    // Notify requester with the blocked reason
    await notifyRequesterBlocked(lock, user.id, reason);

    log.info('Lock blocked with reason', { lockId, userId: user.id });

    return NextResponse.json({ response_action: 'clear' });
  } catch (error: any) {
    log.error('Failed to handle blocked reason', { error: error.message });
    return NextResponse.json({ response_action: 'clear' });
  }
}

/**
 * Notify requester that owner is blocked (with reason)
 * MVP format: simple update message
 */
async function notifyRequesterBlocked(lock: any, actorUserId: string, reason: string) {
  const botToken = process.env.SLACK_BOT_TOKEN;
  if (!botToken || lock.requesterUserId === actorUserId) return;

  try {
    const openResponse = await fetch('https://slack.com/api/conversations.open', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ users: lock.requesterUserId }),
    });

    const openResult = await openResponse.json();
    if (!openResult.ok) return;

    await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: openResult.channel.id,
        text: `Update from <@${actorUserId}>: I'm blocked because "${reason}"`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Update from <@${actorUserId}>*\n\nI'm blocked because: _"${reason}"_`,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Re: ${lock.requiredOutcome}`,
              },
            ],
          },
        ],
      }),
    });

    log.info('Requester notified of blocked status', { lockId: lock.id });
  } catch (error: any) {
    log.error('Failed to notify requester of blocked', { error: error.message });
  }
}

/**
 * Post lock confirmation - sends DM to owner with lock details
 * MVP format: simple, clear, 3 buttons
 */
async function postLockConfirmation(params: {
  channelId: string;
  threadTs?: string;
  lockId: string;
  ownerId: string;
  requiredOutcome: string;
  deadlineAt: Date;
  requesterId: string;
}) {
  const botToken = process.env.SLACK_BOT_TOKEN;
  if (!botToken) return;

  const { lockId, ownerId, requiredOutcome, deadlineAt, requesterId } = params;

  // Calculate relative time
  const now = new Date();
  const diff = deadlineAt.getTime() - now.getTime();
  const hours = Math.round(diff / (60 * 60 * 1000));
  let relativeTime: string;
  if (hours < 1) {
    relativeTime = 'less than 1 hour';
  } else if (hours === 1) {
    relativeTime = 'in 1 hour';
  } else if (hours < 24) {
    relativeTime = `in ${hours} hours`;
  } else {
    const days = Math.round(hours / 24);
    relativeTime = days === 1 ? 'in 1 day' : `in ${days} days`;
  }

  try {
    // Send DM to owner with the lock details and action buttons
    const openResponse = await fetch('https://slack.com/api/conversations.open', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ users: ownerId }),
    });

    const openResult = await openResponse.json();
    if (!openResult.ok) {
      log.error('Failed to open DM with owner', { error: openResult.error });
      return;
    }

    // Owner DM - calm, neutral tone
    await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: openResult.channel.id,
        text: `<@${requesterId}> is waiting on you for: ${requiredOutcome}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `<@${requesterId}> is waiting on you for:\n\n→ ${requiredOutcome}`,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `By: ${relativeTime}`,
              },
            ],
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: { type: 'plain_text', text: 'Start', emoji: true },
                action_id: 'momentum_lock_start',
                value: lockId,
              },
              {
                type: 'button',
                text: { type: 'plain_text', text: 'Blocked', emoji: true },
                action_id: 'momentum_lock_blocked',
                value: lockId,
              },
              {
                type: 'button',
                text: { type: 'plain_text', text: 'Done', emoji: true },
                action_id: 'momentum_lock_done',
                value: lockId,
              },
            ],
          },
        ],
      }),
    });

    log.info('Lock confirmation DM sent to owner');
  } catch (error: any) {
    log.error('Failed to send lock confirmation', { error: error.message });
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
