import { NextResponse } from 'next/server';
import { verifySlackRequest } from '@/lib/slack/verify-signature';
import { db } from '@/lib/db';
import { commandEvents } from '@/lib/db/schema';

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
    });

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
  const { actions } = payload;

  for (const action of actions) {
    console.log('[Slack Interactions] Action:', {
      actionId: action.action_id,
      value: action.value || action.selected_option?.value || action.selected_user,
    });
  }

  return NextResponse.json({ ok: true });
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

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
