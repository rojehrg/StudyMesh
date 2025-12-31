import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    // Authentication check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const webhook = process.env.SLACK_WEBHOOK_URL;
    if (!webhook) {
      return NextResponse.json({ skipped: true, reason: "Webhook not configured" }, { status: 200 });
    }

    const {
      recipientSlackHandle,
      responderName,
      accepted,
      topic,
      podCode
    } = await req.json();

    if (!recipientSlackHandle || !responderName) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Format the Slack handle for proper @mention
    let mention = recipientSlackHandle.trim();
    if (mention.startsWith("U") || mention.startsWith("W")) {
      mention = `<@${mention}>`;
    } else if (mention.startsWith("@")) {
      mention = mention;
    } else {
      mention = `@${mention}`;
    }

    const emoji = accepted ? "✅" : "⏰";
    const statusText = accepted
      ? `accepted your nudge and wants to connect!`
      : `isn't available right now, but thanks for reaching out.`;

    const actionText = accepted
      ? "Head to Meshflow to schedule a meeting!"
      : "";

    const blocks = [
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
      } as any);
    }

    // Add action prompt for accepted nudges
    if (accepted && actionText) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `👉 ${actionText}`
        }
      } as any);
    }

    // Add pod context
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: podCode
            ? `📁 Pod: *${podCode}* • <${process.env.NEXT_PUBLIC_APP_URL || 'https://meshflow.app'}/classes/${podCode}|Open in Meshflow>`
            : `<${process.env.NEXT_PUBLIC_APP_URL || 'https://meshflow.app'}/notifications|View in Meshflow>`
        }
      ]
    } as any);

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
      console.error("Slack webhook failed", body);
      return NextResponse.json({ error: "Slack webhook failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Slack nudge response error", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
