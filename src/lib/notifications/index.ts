// Notification service for Slack and Email

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
        text: `Sent via Meshflow • <${process.env.NEXT_PUBLIC_APP_URL || 'https://meshflow.app'}/meetings|View all meetings>`
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
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey || !participant.email || participant.emailNotifications === false) {
    return false;
  }

  try {
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
      <h1 style="color: white; margin: 0; font-size: 24px;">📅 Meeting Invite</h1>
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
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://meshflow.app'}/meetings" style="color: #6366f1; text-decoration: none; font-size: 14px;">View all your meetings on Meshflow →</a>
      </div>
    </div>

    <div style="background: #f8fafc; padding: 16px 32px; text-align: center;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">Sent via Meshflow</p>
    </div>
  </div>
</body>
</html>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'Meshflow <notifications@meshflow.app>',
        to: participant.email,
        subject: `Meeting Invite: ${meeting.title} - ${new Date(meeting.scheduledTime).toLocaleDateString()}`,
        html: emailHtml
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send email notification:', error);
    return false;
  }
}

// Send all notifications for a meeting participant
export async function notifyParticipant(
  participant: ParticipantData,
  meeting: MeetingNotificationData
): Promise<string[]> {
  const notifiedVia: string[] = [];

  // Always create in-app notification (handled separately via database insert)
  notifiedVia.push('in_app');

  // Try Slack first (faster delivery)
  if (participant.slackHandle) {
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
