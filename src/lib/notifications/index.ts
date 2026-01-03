// Notification service for Slack and Email (using MailerSend)
import { decryptToken } from "@/lib/encryption";
import { createLogger } from "@/lib/logger";

// Create service-specific loggers
const emailLog = createLogger({ service: 'email' });
const slackLog = createLogger({ service: 'slack' });

// ==========================================
// MAILERSEND EMAIL HELPER
// ==========================================

interface MailerSendEmail {
  to: string;
  toName?: string;
  subject: string;
  html: string;
}

async function sendEmailViaMailerSend(email: MailerSendEmail): Promise<boolean> {
  const apiKey = process.env.MAILERSEND_API_KEY;

  if (!apiKey) {
    emailLog.warn('Skipping: MAILERSEND_API_KEY not configured');
    return false;
  }

  const fromEmail = process.env.MAILERSEND_FROM_EMAIL || 'notifications@attunly.com';
  const fromName = process.env.MAILERSEND_FROM_NAME || 'Attunly';

  try {
    emailLog.info('Sending email', { to: email.to, subject: email.subject, action: 'send' });

    const response = await fetch('https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: {
          email: fromEmail,
          name: fromName
        },
        to: [{
          email: email.to,
          name: email.toName || email.to.split('@')[0]
        }],
        subject: email.subject,
        html: email.html
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      emailLog.error('MailerSend API error', {
        status: response.status,
        error: errorData,
        to: email.to
      });
      return false;
    }

    const messageId = response.headers.get('x-message-id');
    emailLog.info('Sent successfully', { messageId, to: email.to });
    return true;
  } catch (error: any) {
    emailLog.error('Failed to send via MailerSend', { error: error.message, to: email.to });
    return false;
  }
}

// ==========================================
// EMAIL TEMPLATE WRAPPER
// ==========================================

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://attunly.com';
const LOGO_URL = 'https://attunly.com/icon.png';

function wrapEmailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header with Logo -->
          <tr>
            <td style="padding: 32px 40px 24px; text-align: center; border-bottom: 1px solid #f3f4f6;">
              <a href="${APP_URL}" style="text-decoration: none; display: inline-flex; align-items: center; gap: 10px;">
                <img src="${LOGO_URL}" alt="Attunly" width="36" height="36" style="border-radius: 8px;" />
                <span style="font-size: 22px; font-weight: 700; color: #111827;">Attunly</span>
              </a>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; text-align: center; border-top: 1px solid #f3f4f6;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">
                <a href="${APP_URL}/settings" style="color: #7c3aed; text-decoration: none;">Manage notifications</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Sent with love from Attunly
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

interface MeetingNotificationData {
  meetingId: string;
  title: string;
  description?: string;
  scheduledTime: Date;
  durationMinutes: number;
  meetingLink?: string;
  organizerName: string;
  podName?: string;
}

interface ParticipantData {
  userId: string;
  email?: string;
  slackHandle?: string;
  slackUserId?: string;
  slackAccessToken?: string;
  slackConnected?: boolean;
  firstName?: string;
  lastName?: string;
  emailNotifications?: boolean;
}

// Build Slack blocks for meeting notification
function buildSlackMeetingBlocks(meeting: MeetingNotificationData) {
  const formattedDate = new Date(meeting.scheduledTime).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  const blocks: any[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `📅 Meeting Invite: ${meeting.title}`,
        emoji: true
      }
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Organized by:*\n${meeting.organizerName}`
        },
        {
          type: "mrkdwn",
          text: `*When:*\n${formattedDate}`
        }
      ]
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Duration:*\n${meeting.durationMinutes} minutes`
        },
        {
          type: "mrkdwn",
          text: meeting.podName ? `*Pod:*\n${meeting.podName}` : `*Type:*\n1:1 Meeting`
        }
      ]
    }
  ];

  if (meeting.description) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Description:*\n${meeting.description}`
      }
    });
  }

  if (meeting.meetingLink) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `🔗 <${meeting.meetingLink}|Join Meeting>`
      }
    });
  }

  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `Sent via Attunly • <${process.env.NEXT_PUBLIC_APP_URL || 'https://attunly.app'}/meetings|View all meetings>`
      }
    ]
  });

  return blocks;
}

// Send Slack DM using OAuth token (preferred method)
async function sendSlackDM(
  accessToken: string,
  slackUserId: string,
  meeting: MeetingNotificationData
): Promise<boolean> {
  try {
    slackLog.info('Opening DM channel', { slackUserId, action: 'conversations.open' });

    // First, open a DM channel with the user
    const openResponse = await fetch('https://slack.com/api/conversations.open', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ users: slackUserId }),
    });

    const openData = await openResponse.json();
    if (!openData.ok) {
      slackLog.error('Failed to open DM channel', { slackUserId, error: openData.error });
      return false;
    }

    const channelId = openData.channel.id;
    const blocks = buildSlackMeetingBlocks(meeting);

    slackLog.info('Sending meeting invite', { channelId, meetingTitle: meeting.title, action: 'chat.postMessage' });

    // Send the message
    const messageResponse = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: channelId,
        text: `You've been invited to a meeting: ${meeting.title}`,
        blocks,
      }),
    });

    const messageData = await messageResponse.json();
    if (!messageData.ok) {
      slackLog.error('Failed to send message', { channelId, error: messageData.error });
      return false;
    }

    slackLog.info('Meeting invite sent successfully', { channelId, messageTs: messageData.ts });
    return true;
  } catch (error: any) {
    slackLog.error('Failed to send DM', { slackUserId, error: error.message });
    return false;
  }
}

// Send Slack notification via webhook (fallback method)
async function sendSlackWebhook(
  webhookUrl: string,
  slackHandle: string,
  meeting: MeetingNotificationData
): Promise<boolean> {
  try {
    slackLog.info('Sending via webhook', { slackHandle, meetingTitle: meeting.title, action: 'webhook' });

    const blocks = buildSlackMeetingBlocks(meeting);

    // Format recipient mention
    let recipientMention = slackHandle;
    if (recipientMention.startsWith('@')) {
      recipientMention = recipientMention.slice(1);
    }
    if (recipientMention.startsWith('U') || recipientMention.startsWith('W')) {
      recipientMention = `<@${recipientMention}>`;
    } else {
      recipientMention = `@${recipientMention}`;
    }

    const payload = {
      text: `${recipientMention} You've been invited to a meeting: ${meeting.title}`,
      blocks
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      slackLog.info('Webhook sent successfully', { slackHandle });
    } else {
      slackLog.error('Webhook failed', { slackHandle, status: response.status });
    }

    return response.ok;
  } catch (error: any) {
    slackLog.error('Failed to send webhook', { slackHandle, error: error.message });
    return false;
  }
}

// Send Slack notification for meeting invite
// Prefers OAuth DM, falls back to webhook if not connected
export async function sendSlackMeetingNotification(
  participant: ParticipantData,
  meeting: MeetingNotificationData
): Promise<boolean> {
  // Try OAuth DM first (best user experience)
  if (participant.slackConnected && participant.slackAccessToken && participant.slackUserId) {
    const dmSent = await sendSlackDM(
      participant.slackAccessToken,
      participant.slackUserId,
      meeting
    );
    if (dmSent) return true;
    // If DM fails, fall through to webhook
  }

  // Fallback to webhook (channel mention)
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (webhookUrl && participant.slackHandle) {
    return sendSlackWebhook(webhookUrl, participant.slackHandle, meeting);
  }

  return false;
}

// Send email notification for meeting invite
export async function sendEmailMeetingNotification(
  participant: ParticipantData,
  meeting: MeetingNotificationData
): Promise<boolean> {
  if (!participant.email) {
    emailLog.info('Skipping: No email address', { userId: participant.userId });
    return false;
  }

  if (participant.emailNotifications === false) {
    emailLog.info('Skipping: Notifications disabled', { email: participant.email });
    return false;
  }

  const formattedDate = new Date(meeting.scheduledTime).toLocaleString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  const participantName = participant.firstName || 'there';

  const content = `
    <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #111827;">You're invited! 🎉</h1>
    <p style="margin: 0 0 24px; font-size: 16px; color: #6b7280;">
      ${meeting.organizerName} wants to meet with you
    </p>

    <div style="background: linear-gradient(135deg, #ede9fe 0%, #faf5ff 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #5b21b6;">${meeting.title}</h2>

      <table cellpadding="0" cellspacing="0" style="width: 100%;">
        <tr>
          <td style="padding-bottom: 12px;">
            <span style="font-size: 13px; color: #7c3aed; font-weight: 600;">WHEN</span><br/>
            <span style="font-size: 15px; color: #374151;">${formattedDate}</span>
          </td>
          <td style="padding-bottom: 12px;">
            <span style="font-size: 13px; color: #7c3aed; font-weight: 600;">DURATION</span><br/>
            <span style="font-size: 15px; color: #374151;">${meeting.durationMinutes} min</span>
          </td>
        </tr>
      </table>

      ${meeting.description ? `
      <div style="margin-top: 8px; padding-top: 12px; border-top: 1px solid rgba(124, 58, 237, 0.2);">
        <span style="font-size: 13px; color: #7c3aed; font-weight: 600;">ABOUT</span><br/>
        <span style="font-size: 14px; color: #374151;">${meeting.description}</span>
      </div>
      ` : ''}

      ${meeting.podName ? `
      <div style="margin-top: 12px;">
        <span style="display: inline-block; background: #7c3aed; color: white; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 999px;">${meeting.podName}</span>
      </div>
      ` : ''}
    </div>

    <div style="text-align: center;">
      <a href="${APP_URL}/meetings" style="display: inline-block; background: #7c3aed; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">View Meeting Details</a>
    </div>

    <p style="margin: 24px 0 0; font-size: 14px; color: #9ca3af; text-align: center;">
      Check your calendar and respond when you can!
    </p>
  `;

  const subject = `${meeting.organizerName} invited you: ${meeting.title}`;

  return sendEmailViaMailerSend({
    to: participant.email,
    toName: participantName,
    subject,
    html: wrapEmailTemplate(content)
  });
}

// Send all notifications for a meeting participant
export async function notifyParticipant(
  participant: ParticipantData,
  meeting: MeetingNotificationData
): Promise<string[]> {
  const notifiedVia: string[] = [];

  // Always create in-app notification (handled separately via database insert)
  notifiedVia.push('in_app');

  // Try Slack first (faster delivery) - check slackConnected and slackUserId for OAuth DMs
  if (participant.slackConnected && participant.slackUserId) {
    const slackSent = await sendSlackMeetingNotification(participant, meeting);
    if (slackSent) {
      notifiedVia.push('slack');
    }
  } else if (participant.slackHandle) {
    // Fallback to webhook if user has handle but not OAuth connected
    const slackSent = await sendSlackMeetingNotification(participant, meeting);
    if (slackSent) {
      notifiedVia.push('slack');
    }
  }

  // Send email as backup/additional channel
  if (participant.email && participant.emailNotifications !== false) {
    const emailSent = await sendEmailMeetingNotification(participant, meeting);
    if (emailSent) {
      notifiedVia.push('email');
    }
  }

  return notifiedVia;
}

// ==========================================
// NUDGE NOTIFICATIONS (Slack DM)
// ==========================================

interface NudgeData {
  senderName: string;
  topic: string;
  podCode?: string;
  nudgeType: 'ask' | 'offer';
  meetingLength?: string;
  message?: string;
}

interface NudgeEmailData extends NudgeData {
  recipientEmail: string;
  recipientName?: string;
}

interface NudgeResponseData {
  responderName: string;
  accepted: boolean;
  topic?: string;
  podCode?: string;
}

interface NudgeResponseEmailData extends NudgeResponseData {
  recipientEmail: string;
  recipientName?: string;
}

// Build Slack blocks for nudge notification
function buildNudgeBlocks(nudge: NudgeData): any[] {
  const actionText = nudge.nudgeType === 'offer'
    ? `wants to help you with *${nudge.topic}*`
    : `is looking for help with *${nudge.topic}*`;

  const blocks: any[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `🔔 *Attunly Nudge*\n\n*${nudge.senderName}* ${actionText}`
      }
    }
  ];

  if (nudge.podCode) {
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `📁 Pod: *${nudge.podCode}* • <${process.env.NEXT_PUBLIC_APP_URL || 'https://attunly.app'}/classes/${nudge.podCode}|View in Attunly>`
        }
      ]
    });
  } else {
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `<${process.env.NEXT_PUBLIC_APP_URL || 'https://attunly.app'}/notifications|Reply in Attunly>`
        }
      ]
    });
  }

  return blocks;
}

// Build Slack blocks for nudge response notification
function buildNudgeResponseBlocks(response: NudgeResponseData): any[] {
  const emoji = response.accepted ? "✅" : "⏰";
  const statusText = response.accepted
    ? `accepted your nudge and wants to connect!`
    : `isn't available right now, but thanks for reaching out.`;

  const blocks: any[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${emoji} *Nudge Response*\n\n*${response.responderName}* ${statusText}`
      }
    }
  ];

  if (response.topic) {
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `📝 Topic: *${response.topic}*`
        }
      ]
    });
  }

  if (response.accepted) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `👉 Head to Attunly to schedule a meeting!`
      }
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://attunly.app';
  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: response.podCode
          ? `📁 Pod: *${response.podCode}* • <${appUrl}/classes/${response.podCode}|Open in Attunly>`
          : `<${appUrl}/notifications|View in Attunly>`
      }
    ]
  });

  return blocks;
}

// Send nudge notification via Slack DM (using OAuth token)
export async function sendNudgeSlackDM(
  accessToken: string,
  recipientSlackUserId: string,
  nudge: NudgeData
): Promise<boolean> {
  try {
    slackLog.info('Opening DM for nudge', { recipientSlackUserId, topic: nudge.topic, action: 'nudge' });

    // Open DM channel
    const openResponse = await fetch('https://slack.com/api/conversations.open', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ users: recipientSlackUserId }),
    });

    const openData = await openResponse.json();
    if (!openData.ok) {
      slackLog.error('Failed to open DM channel for nudge', { recipientSlackUserId, error: openData.error });
      return false;
    }

    const channelId = openData.channel.id;
    const blocks = buildNudgeBlocks(nudge);

    const actionText = nudge.nudgeType === 'offer'
      ? `wants to help you with ${nudge.topic}`
      : `is looking for help with ${nudge.topic}`;

    // Send the message
    const messageResponse = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: channelId,
        text: `Attunly Nudge: ${nudge.senderName} ${actionText}`,
        blocks,
      }),
    });

    const messageData = await messageResponse.json();
    if (!messageData.ok) {
      slackLog.error('Failed to send nudge message', { channelId, error: messageData.error });
      return false;
    }

    slackLog.info('Nudge DM sent successfully', { channelId, topic: nudge.topic });
    return true;
  } catch (error: any) {
    slackLog.error('Failed to send nudge DM', { recipientSlackUserId, error: error.message });
    return false;
  }
}

// Send nudge response notification via Slack DM
export async function sendNudgeResponseSlackDM(
  accessToken: string,
  recipientSlackUserId: string,
  response: NudgeResponseData
): Promise<boolean> {
  try {
    slackLog.info('Opening DM for nudge response', {
      recipientSlackUserId,
      accepted: response.accepted,
      action: 'nudge_response'
    });

    // Open DM channel
    const openResponse = await fetch('https://slack.com/api/conversations.open', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ users: recipientSlackUserId }),
    });

    const openData = await openResponse.json();
    if (!openData.ok) {
      slackLog.error('Failed to open DM channel for response', { recipientSlackUserId, error: openData.error });
      return false;
    }

    const channelId = openData.channel.id;
    const blocks = buildNudgeResponseBlocks(response);

    // Send the message
    const messageResponse = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: channelId,
        text: `Nudge Response: ${response.responderName} ${response.accepted ? 'accepted' : 'declined'} your nudge`,
        blocks,
      }),
    });

    const messageData = await messageResponse.json();
    if (!messageData.ok) {
      slackLog.error('Failed to send response message', { channelId, error: messageData.error });
      return false;
    }

    slackLog.info('Nudge response DM sent successfully', { channelId, accepted: response.accepted });
    return true;
  } catch (error: any) {
    slackLog.error('Failed to send nudge response DM', { recipientSlackUserId, error: error.message });
    return false;
  }
}

// ==========================================
// EMAIL NOTIFICATIONS FOR NUDGES
// ==========================================

// Send email notification when someone receives a nudge
export async function sendEmailNudgeNotification(
  data: NudgeEmailData
): Promise<boolean> {
  if (!data.recipientEmail) {
    emailLog.info('Skipping nudge email: No recipient', { action: 'nudge' });
    return false;
  }

  const recipientName = data.recipientName || 'there';

  const isOffer = data.nudgeType === 'offer';
  const emoji = isOffer ? '🙌' : '💡';
  const headline = isOffer
    ? `${data.senderName} wants to help you!`
    : `${data.senderName} could use your help!`;
  const subtext = isOffer
    ? `They noticed you might need a hand with something`
    : `They're working on something you might know about`;

  const content = `
    <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #111827;">${emoji} ${headline}</h1>
    <p style="margin: 0 0 24px; font-size: 16px; color: #6b7280;">
      ${subtext}
    </p>

    <div style="background: linear-gradient(135deg, #ede9fe 0%, #faf5ff 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <span style="font-size: 13px; color: #7c3aed; font-weight: 600;">TOPIC</span>
      <h2 style="margin: 4px 0 0; font-size: 20px; font-weight: 600; color: #5b21b6;">${data.topic}</h2>

      ${data.meetingLength && data.meetingLength !== 'async' ? `
      <div style="margin-top: 16px;">
        <span style="font-size: 13px; color: #7c3aed; font-weight: 600;">SUGGESTED TIME</span><br/>
        <span style="font-size: 15px; color: #374151;">${data.meetingLength}</span>
      </div>
      ` : ''}

      ${data.podCode ? `
      <div style="margin-top: 12px;">
        <span style="display: inline-block; background: #7c3aed; color: white; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 999px;">${data.podCode}</span>
      </div>
      ` : ''}
    </div>

    ${data.message ? `
    <div style="background: #f9fafb; border-radius: 10px; padding: 16px; margin-bottom: 24px; border-left: 3px solid #d1d5db;">
      <span style="font-size: 12px; color: #6b7280; font-weight: 600;">MESSAGE</span>
      <p style="margin: 4px 0 0; font-size: 14px; color: #374151; white-space: pre-wrap;">${data.message}</p>
    </div>
    ` : ''}

    <div style="text-align: center;">
      <a href="${APP_URL}/notifications" style="display: inline-block; background: #7c3aed; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">Respond to ${data.senderName}</a>
    </div>

    <p style="margin: 24px 0 0; font-size: 14px; color: #9ca3af; text-align: center;">
      ${isOffer ? 'Good things happen when we help each other out!' : "Your expertise could make someone's day!"}
    </p>
  `;

  const subject = isOffer
    ? `${data.senderName} wants to help you with ${data.topic}`
    : `${data.senderName} needs help with ${data.topic}`;

  return sendEmailViaMailerSend({
    to: data.recipientEmail,
    toName: recipientName,
    subject,
    html: wrapEmailTemplate(content)
  });
}

// ==========================================
// EMAIL NOTIFICATIONS FOR MEETING RSVP
// ==========================================

interface MeetingRsvpEmailData {
  organizerEmail: string;
  organizerName?: string;
  responderName: string;
  meetingTitle: string;
  scheduledTime: Date;
  status: 'accepted' | 'declined';
  meetingLink?: string;
}

// Send email notification to organizer when someone RSVPs to their meeting
export async function sendEmailMeetingRsvpNotification(
  data: MeetingRsvpEmailData
): Promise<boolean> {
  if (!data.organizerEmail) {
    emailLog.info('Skipping RSVP email: No organizer email', { action: 'rsvp' });
    return false;
  }

  const organizerName = data.organizerName || 'there';

  const formattedDate = new Date(data.scheduledTime).toLocaleString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  const isAccepted = data.status === 'accepted';
  const emoji = isAccepted ? '✅' : '😔';
  const headline = isAccepted
    ? `${data.responderName} is in!`
    : `${data.responderName} can't make it`;
  const bgColor = isAccepted
    ? 'linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%)'
    : 'linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)';
  const accentColor = isAccepted ? '#059669' : '#dc2626';

  const content = `
    <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #111827;">${emoji} ${headline}</h1>
    <p style="margin: 0 0 24px; font-size: 16px; color: #6b7280;">
      ${isAccepted ? "You're all set for your meeting" : "They won't be able to join this one"}
    </p>

    <div style="background: ${bgColor}; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 600; color: ${accentColor};">${data.meetingTitle}</h2>

      <table cellpadding="0" cellspacing="0" style="width: 100%;">
        <tr>
          <td>
            <span style="font-size: 13px; color: ${accentColor}; font-weight: 600;">WHEN</span><br/>
            <span style="font-size: 15px; color: #374151;">${formattedDate}</span>
          </td>
        </tr>
      </table>
    </div>

    <div style="text-align: center;">
      <a href="${APP_URL}/meetings" style="display: inline-block; background: #7c3aed; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">View Meeting</a>
    </div>

    <p style="margin: 24px 0 0; font-size: 14px; color: #9ca3af; text-align: center;">
      ${isAccepted ? 'Looking forward to a great session!' : "No worries - maybe next time!"}
    </p>
  `;

  const subject = isAccepted
    ? `${data.responderName} accepted: ${data.meetingTitle}`
    : `${data.responderName} declined: ${data.meetingTitle}`;

  return sendEmailViaMailerSend({
    to: data.organizerEmail,
    toName: organizerName,
    subject,
    html: wrapEmailTemplate(content)
  });
}

// Send email notification when someone responds to a nudge
export async function sendEmailNudgeResponseNotification(
  data: NudgeResponseEmailData
): Promise<boolean> {
  if (!data.recipientEmail) {
    emailLog.info('Skipping nudge response email: No recipient', { action: 'nudge_response' });
    return false;
  }

  const recipientName = data.recipientName || 'there';

  const isAccepted = data.accepted;
  const emoji = isAccepted ? '🎉' : '⏰';
  const headline = isAccepted
    ? `${data.responderName} is down to connect!`
    : `${data.responderName} is busy right now`;
  const bgColor = isAccepted
    ? 'linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%)'
    : 'linear-gradient(135deg, #f3f4f6 0%, #f9fafb 100%)';
  const accentColor = isAccepted ? '#059669' : '#6b7280';

  const content = `
    <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #111827;">${emoji} ${headline}</h1>
    <p style="margin: 0 0 24px; font-size: 16px; color: #6b7280;">
      ${isAccepted ? 'Great news! They want to help out.' : "They can't make it work right now, but don't give up!"}
    </p>

    ${data.topic ? `
    <div style="background: ${bgColor}; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <span style="font-size: 13px; color: ${accentColor}; font-weight: 600;">YOUR TOPIC</span>
      <h2 style="margin: 4px 0 0; font-size: 18px; font-weight: 600; color: #374151;">${data.topic}</h2>
    </div>
    ` : ''}

    ${isAccepted ? `
    <div style="text-align: center;">
      <a href="${APP_URL}/classes/${data.podCode || ''}" style="display: inline-block; background: #059669; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">Schedule a Time</a>
    </div>

    <p style="margin: 24px 0 0; font-size: 14px; color: #9ca3af; text-align: center;">
      Pick a time that works and make it happen!
    </p>
    ` : `
    <div style="text-align: center;">
      <a href="${APP_URL}/classes/${data.podCode || ''}" style="display: inline-block; background: #7c3aed; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">Find Someone Else</a>
    </div>

    <p style="margin: 24px 0 0; font-size: 14px; color: #9ca3af; text-align: center;">
      There are plenty of others who might be able to help!
    </p>
    `}
  `;

  const subject = isAccepted
    ? `${data.responderName} accepted your nudge!`
    : `${data.responderName} responded to your nudge`;

  return sendEmailViaMailerSend({
    to: data.recipientEmail,
    toName: recipientName,
    subject,
    html: wrapEmailTemplate(content)
  });
}
