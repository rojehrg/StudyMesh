import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendNudgeResponseSlackDM } from "@/lib/notifications";
import { decryptToken } from "@/lib/encryption";

export async function POST(req: Request) {
  try {
    // Authentication check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
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

    if (!responderName) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // If we have a recipientUserId, try to send via OAuth DM first
    if (recipientUserId) {
      // Get recipient's Slack info from their profile
      const { data: recipientProfile } = await supabase
        .from('profiles')
        .select('slack_user_id, slack_access_token, slack_connected, organization_id')
        .eq('user_id', recipientUserId)
        .single();

      if (recipientProfile?.slack_connected && recipientProfile?.slack_user_id) {
        // Try to use organization's bot token (preferred for DMs)
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
            } catch (e) {
              console.error('[NudgeResponse] Failed to decrypt org token:', e);
            }
          }
        }

        // Fallback to user's own token if no org token
        if (!botToken && recipientProfile.slack_access_token) {
          try {
            botToken = decryptToken(recipientProfile.slack_access_token);
          } catch (e) {
            console.error('[NudgeResponse] Failed to decrypt user token:', e);
          }
        }

        if (botToken) {
          const sent = await sendNudgeResponseSlackDM(
            botToken,
            recipientProfile.slack_user_id,
            { responderName, accepted, topic, podCode }
          );

          if (sent) {
            return NextResponse.json({ ok: true, method: 'oauth_dm' });
          }
        }
      }
    }

    // Fallback to webhook (legacy support)
    const webhook = process.env.SLACK_WEBHOOK_URL;
    if (!webhook) {
      console.log('[NudgeResponse] No webhook configured and OAuth DM failed');
      return NextResponse.json({ skipped: true, reason: "No notification method available" }, { status: 200 });
    }

    if (!recipientSlackHandle) {
      return NextResponse.json({ error: "Missing recipientSlackHandle for webhook" }, { status: 400 });
    }

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

    // Add topic context if available
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

    // Add action prompt for accepted nudges
    if (accepted && actionText) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `👉 ${actionText}`
        }
      });
    }

    // Add pod context
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: podCode
            ? `📁 Pod: *${podCode}* • <${process.env.NEXT_PUBLIC_APP_URL || 'https://attunly.app'}/classes/${podCode}|Open in Attunly>`
            : `<${process.env.NEXT_PUBLIC_APP_URL || 'https://attunly.app'}/notifications|View in Attunly>`
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

    if (!resp.ok) {
      const body = await resp.text();
      console.error("[NudgeResponse] Slack webhook failed", body);
      return NextResponse.json({ error: "Slack webhook failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, method: 'webhook' });
  } catch (error) {
    console.error("[NudgeResponse] Error:", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
