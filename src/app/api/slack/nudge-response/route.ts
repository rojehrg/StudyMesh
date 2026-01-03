import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendNudgeResponseSlackDM, sendEmailNudgeResponseNotification } from "@/lib/notifications";
import { decryptToken } from "@/lib/encryption";
import { createLogger } from "@/lib/logger";

export async function POST(req: Request) {
  const log = createLogger({ service: 'slack', action: 'nudge_response' });

  try {
    // Authentication check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      log.warn('Unauthorized access attempt');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      recipientSlackHandle,
      recipientUserId,
      responderName,
      accepted,
      topic,
      podCode
    } = await req.json();

    log.info('Processing nudge response', {
      userId: user.id,
      recipientUserId,
      accepted,
      topic
    });

    if (!responderName) {
      log.warn('Missing responderName');
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const notifiedVia: string[] = [];

    // If we have a recipientUserId, get their profile for notifications
    if (recipientUserId) {
      // Get recipient's full profile for both Slack and email
      const { data: recipientProfile } = await supabase
        .from('profiles')
        .select('slack_user_id, slack_access_token, slack_connected, organization_id, email, first_name, email_notifications')
        .eq('user_id', recipientUserId)
        .single();

      if (recipientProfile) {
        // Try Slack DM first
        if (recipientProfile.slack_connected && recipientProfile.slack_user_id) {
          let botToken: string | null = null;

          if (recipientProfile.organization_id) {
            const { data: org } = await supabase
              .from('organizations')
              .select('slack_access_token')
              .eq('id', recipientProfile.organization_id)
              .single();

            if (org?.slack_access_token) {
              try {
                botToken = decryptToken(org.slack_access_token);
              } catch (e: any) {
                log.error('Failed to decrypt org token', { error: e.message });
              }
            }
          }

          // Fallback to user's own token if no org token
          if (!botToken && recipientProfile.slack_access_token) {
            try {
              botToken = decryptToken(recipientProfile.slack_access_token);
            } catch (e: any) {
              log.error('Failed to decrypt user token', { error: e.message });
            }
          }

          if (botToken) {
            const slackSent = await sendNudgeResponseSlackDM(
              botToken,
              recipientProfile.slack_user_id,
              { responderName, accepted, topic, podCode }
            );

            if (slackSent) {
              notifiedVia.push('slack');
            }
          }
        }

        // Send email notification (if user has email and hasn't disabled notifications)
        if (recipientProfile.email && recipientProfile.email_notifications !== false) {
          const emailSent = await sendEmailNudgeResponseNotification({
            responderName,
            accepted,
            topic,
            podCode,
            recipientEmail: recipientProfile.email,
            recipientName: recipientProfile.first_name || undefined
          });

          if (emailSent) {
            notifiedVia.push('email');
          }
        }
      }
    }

    // If we got at least one notification through, return success
    if (notifiedVia.length > 0) {
      return NextResponse.json({ ok: true, notifiedVia });
    }

    // Fallback to webhook (legacy support)
    const webhook = process.env.SLACK_WEBHOOK_URL;
    if (webhook && recipientSlackHandle) {
      // Format the Slack handle for proper @mention
      let mention = recipientSlackHandle.trim();
      if (mention.startsWith("U") || mention.startsWith("W")) {
        mention = `<@${mention}>`;
      } else if (!mention.startsWith("@")) {
        mention = `@${mention}`;
      }

      const emoji = accepted ? "✅" : "⏰";
      const statusText = accepted
        ? `accepted your nudge and wants to connect!`
        : `isn't available right now, but thanks for reaching out.`;

      const actionText = accepted
        ? "Head to Attunly to schedule a meeting!"
        : "";

      const blocks: any[] = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `${emoji} *Nudge Response*\n\n${mention} — *${responderName}* ${statusText}`
          }
        }
      ];

      if (topic) {
        blocks.push({
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `📝 Topic: *${topic}*`
            }
          ]
        });
      }

      if (accepted && actionText) {
        blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: `👉 ${actionText}`
          }
        });
      }

      blocks.push({
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: podCode
              ? `📁 Pod: *${podCode}* • <${process.env.NEXT_PUBLIC_APP_URL || 'https://attunly.com'}/classes/${podCode}|Open in Attunly>`
              : `<${process.env.NEXT_PUBLIC_APP_URL || 'https://attunly.com'}/notifications|View in Attunly>`
          }
        ]
      });

      const resp = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `Nudge Response: ${responderName} ${accepted ? 'accepted' : 'declined'} your nudge`,
          blocks
        }),
      });

      if (resp.ok) {
        log.info('Webhook sent successfully', { recipientSlackHandle, accepted });
        return NextResponse.json({ ok: true, notifiedVia: ['webhook'] });
      }

      log.error('Webhook failed', { recipientSlackHandle, status: resp.status });
    }

    // No notification method available
    log.info('No notification method available', { recipientUserId });
    return NextResponse.json({ skipped: true, reason: "No notification method available" }, { status: 200 });

  } catch (error: any) {
    log.error('Unexpected error', { error: error.message });
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
