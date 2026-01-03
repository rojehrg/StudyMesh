// Notification service for Slack and Email (using MailerSend)
import { decryptToken } from "@/lib/encryption";

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
    console.log('[Email] Skipping: MAILERSEND_API_KEY not configured');
    return false;
  }

  // Use trial domain or custom domain
  // Trial domain format: trial-xxxxx.mlsender.net
  const fromEmail = process.env.MAILERSEND_FROM_EMAIL || 'notifications@trial-v69oxl5qq17g785k.mlsender.net';
  const fromName = process.env.MAILERSEND_FROM_NAME || 'Attunly';

  try {
    console.log('[Email] Sending via MailerSend to:', email.to, 'Subject:', email.subject);

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
      console.error('[Email] MailerSend API error:', response.status, errorData);
      return false;
    }

    // MailerSend returns 202 with x-message-id header on success
    const messageId = response.headers.get('x-message-id');
    console.log('[Email] Sent successfully, Message ID:', messageId);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send via MailerSend:', error);
    return false;
  }
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
      console.error('Failed to open Slack DM channel:', openData.error);
      return false;
    }

    const channelId = openData.channel.id;
    const blocks = buildSlackMeetingBlocks(meeting);

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
      console.error('Failed to send Slack message:', messageData.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send Slack DM:', error);
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

    return response.ok;
  } catch (error) {
    console.error('Failed to send Slack webhook:', error);
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
    console.log('[Email] Skipping: No email address for participant', participant.userId);
    return false;
  }

  if (participant.emailNotifications === false) {
    console.log('[Email] Skipping: User has disabled email notifications', participant.email);
    return false;
  }

  const formattedDate = new Date(meeting.scheduledTime).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  const participantName = participant.firstName || 'there';

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meeting Invite</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background-color: #f8fafc; padding: 40px 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%); padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Meeting Invite</h1>
    </div>

    <div style="padding: 32px;">
      <p style="color: #374151; font-size: 16px; margin: 0 0 24px;">Hi ${participantName},</p>

      <p style="color: #374151; font-size: 16px; margin: 0 0 24px;">
        <strong>${meeting.organizerName}</strong> has invited you to a meeting.
      </p>

      <div style="background: #f8fafc; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 16px;">${meeting.title}</h2>

        <div style="display: flex; flex-wrap: wrap; gap: 16px;">
          <div style="flex: 1; min-width: 200px;">
            <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin: 0 0 4px;">When</p>
            <p style="color: #1f2937; font-size: 14px; margin: 0;">${formattedDate}</p>
          </div>
          <div style="flex: 1; min-width: 200px;">
            <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin: 0 0 4px;">Duration</p>
            <p style="color: #1f2937; font-size: 14px; margin: 0;">${meeting.durationMinutes} minutes</p>
          </div>
        </div>

        ${meeting.description ? `
        <div style="margin-top: 16px;">
          <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin: 0 0 4px;">Description</p>
          <p style="color: #1f2937; font-size: 14px; margin: 0;">${meeting.description}</p>
        </div>
        ` : ''}

        ${meeting.podName ? `
        <div style="margin-top: 16px;">
          <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin: 0 0 4px;">Pod</p>
          <p style="color: #1f2937; font-size: 14px; margin: 0;">${meeting.podName}</p>
        </div>
        ` : ''}
      </div>

      ${meeting.meetingLink ? `
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${meeting.meetingLink}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Join Meeting</a>
      </div>
      ` : ''}

      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://attunly.app'}/meetings" style="color: #6366f1; text-decoration: none; font-size: 14px;">View all your meetings on Attunly</a>
      </div>
    </div>

    <div style="background: #f8fafc; padding: 16px 32px; text-align: center;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">Sent via Attunly</p>
    </div>
  </div>
</body>
</html>
  `;

  const subject = `Meeting Invite: ${meeting.title} - ${new Date(meeting.scheduledTime).toLocaleDateString()}`;

  return sendEmailViaMailerSend({
    to: participant.email,
    toName: participantName,
    subject,
    html: emailHtml
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
      console.error('[Nudge] Failed to open Slack DM channel:', openData.error);
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
      console.error('[Nudge] Failed to send Slack message:', messageData.error);
      return false;
    }

    console.log('[Nudge] Slack DM sent successfully');
    return true;
  } catch (error) {
    console.error('[Nudge] Failed to send Slack DM:', error);
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
      console.error('[NudgeResponse] Failed to open Slack DM channel:', openData.error);
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
      console.error('[NudgeResponse] Failed to send Slack message:', messageData.error);
      return false;
    }

    console.log('[NudgeResponse] Slack DM sent successfully');
    return true;
  } catch (error) {
    console.error('[NudgeResponse] Failed to send Slack DM:', error);
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
    console.log('[Email Nudge] Skipping: No recipient email');
    return false;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://attunly.com';
  const recipientName = data.recipientName || 'there';

  const actionText = data.nudgeType === 'offer'
    ? `wants to help you with`
    : `is looking for help with`;

  const headerText = data.nudgeType === 'offer'
    ? 'Someone wants to help!'
    : 'Someone needs your help!';

  const meetingLengthText = data.meetingLength && data.meetingLength !== 'async'
    ? `<p style="color: #6b7280; font-size: 14px; margin: 8px 0 0;">Suggested meeting length: <strong>${data.meetingLength}</strong></p>`
    : '';

  const podLink = data.podCode
    ? `<a href="${appUrl}/classes/${data.podCode}" style="color: #7c3aed; text-decoration: none;">View in ${data.podCode}</a>`
    : `<a href="${appUrl}/notifications" style="color: #7c3aed; text-decoration: none;">View in Attunly</a>`;

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Nudge</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background-color: #f8fafc; padding: 40px 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">${headerText}</h1>
    </div>

    <div style="padding: 32px;">
      <p style="color: #374151; font-size: 16px; margin: 0 0 24px;">Hi ${recipientName},</p>

      <p style="color: #374151; font-size: 16px; margin: 0 0 24px;">
        <strong>${data.senderName}</strong> ${actionText} <strong>${data.topic}</strong>.
      </p>

      <div style="background: #faf5ff; border-radius: 8px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #7c3aed;">
        <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin: 0 0 8px;">Topic</p>
        <p style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 0;">${data.topic}</p>
        ${meetingLengthText}
        ${data.podCode ? `<p style="color: #6b7280; font-size: 14px; margin: 8px 0 0;">Pod: <strong>${data.podCode}</strong></p>` : ''}
      </div>

      ${data.message ? `
      <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin: 0 0 8px;">Message</p>
        <p style="color: #374151; font-size: 14px; margin: 0; white-space: pre-wrap;">${data.message}</p>
      </div>
      ` : ''}

      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${appUrl}/notifications" style="display: inline-block; background: #7c3aed; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Respond to Nudge</a>
      </div>

      <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
        ${podLink}
      </p>
    </div>

    <div style="background: #f8fafc; padding: 16px 32px; text-align: center;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">Sent via Attunly</p>
    </div>
  </div>
</body>
</html>
  `;

  const subject = data.nudgeType === 'offer'
    ? `${data.senderName} wants to help you with ${data.topic}`
    : `${data.senderName} needs help with ${data.topic}`;

  return sendEmailViaMailerSend({
    to: data.recipientEmail,
    toName: recipientName,
    subject,
    html: emailHtml
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
    console.log('[Email MeetingRSVP] Skipping: No organizer email');
    return false;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://attunly.com';
  const organizerName = data.organizerName || 'there';

  const formattedDate = new Date(data.scheduledTime).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  const headerText = data.status === 'accepted' ? 'Meeting Accepted!' : 'Meeting Declined';
  const headerColor = data.status === 'accepted'
    ? 'linear-gradient(135deg, #059669 0%, #34d399 100%)'
    : 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)';

  const statusText = data.status === 'accepted'
    ? `has accepted your meeting invitation`
    : `has declined your meeting invitation`;

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meeting RSVP</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background-color: #f8fafc; padding: 40px 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <div style="background: ${headerColor}; padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">${headerText}</h1>
    </div>

    <div style="padding: 32px;">
      <p style="color: #374151; font-size: 16px; margin: 0 0 24px;">Hi ${organizerName},</p>

      <p style="color: #374151; font-size: 16px; margin: 0 0 24px;">
        <strong>${data.responderName}</strong> ${statusText}.
      </p>

      <div style="background: #f8fafc; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 16px;">${data.meetingTitle}</h2>
        <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin: 0 0 4px;">Scheduled for</p>
        <p style="color: #1f2937; font-size: 14px; margin: 0;">${formattedDate}</p>
      </div>

      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${appUrl}/meetings" style="display: inline-block; background: #6366f1; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Meeting Details</a>
      </div>

      ${data.status === 'accepted' ? `
      <p style="color: #059669; font-size: 14px; text-align: center; margin: 0;">
        Great news! Your meeting is confirmed.
      </p>
      ` : `
      <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
        You may want to reach out to reschedule or find another time that works.
      </p>
      `}
    </div>

    <div style="background: #f8fafc; padding: 16px 32px; text-align: center;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">Sent via Attunly</p>
    </div>
  </div>
</body>
</html>
  `;

  const subject = data.status === 'accepted'
    ? `${data.responderName} accepted: ${data.meetingTitle}`
    : `${data.responderName} declined: ${data.meetingTitle}`;

  return sendEmailViaMailerSend({
    to: data.organizerEmail,
    toName: organizerName,
    subject,
    html: emailHtml
  });
}

// Send email notification when someone responds to a nudge
export async function sendEmailNudgeResponseNotification(
  data: NudgeResponseEmailData
): Promise<boolean> {
  if (!data.recipientEmail) {
    console.log('[Email NudgeResponse] Skipping: No recipient email');
    return false;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://attunly.com';
  const recipientName = data.recipientName || 'there';

  const headerText = data.accepted ? 'Nudge Accepted!' : 'Nudge Response';
  const headerColor = data.accepted
    ? 'linear-gradient(135deg, #059669 0%, #34d399 100%)'
    : 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)';

  const statusText = data.accepted
    ? `accepted your nudge and wants to connect!`
    : `isn't available right now, but thanks for reaching out.`;

  const ctaButton = data.accepted
    ? `<div style="text-align: center; margin-bottom: 24px;">
        <a href="${appUrl}/meetings" style="display: inline-block; background: #059669; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Schedule a Meeting</a>
      </div>`
    : '';

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nudge Response</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background-color: #f8fafc; padding: 40px 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <div style="background: ${headerColor}; padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">${headerText}</h1>
    </div>

    <div style="padding: 32px;">
      <p style="color: #374151; font-size: 16px; margin: 0 0 24px;">Hi ${recipientName},</p>

      <p style="color: #374151; font-size: 16px; margin: 0 0 24px;">
        <strong>${data.responderName}</strong> ${statusText}
      </p>

      ${data.topic ? `
      <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin: 0 0 4px;">Original Topic</p>
        <p style="color: #1f2937; font-size: 16px; font-weight: 500; margin: 0;">${data.topic}</p>
      </div>
      ` : ''}

      ${ctaButton}

      ${data.accepted ? `
      <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
        Head to Attunly to schedule a time that works for both of you.
      </p>
      ` : `
      <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
        No worries - try reaching out to someone else or check back later.
      </p>
      `}
    </div>

    <div style="background: #f8fafc; padding: 16px 32px; text-align: center;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">Sent via Attunly</p>
    </div>
  </div>
</body>
</html>
  `;

  const subject = data.accepted
    ? `${data.responderName} accepted your nudge!`
    : `${data.responderName} responded to your nudge`;

  return sendEmailViaMailerSend({
    to: data.recipientEmail,
    toName: recipientName,
    subject,
    html: emailHtml
  });
}
