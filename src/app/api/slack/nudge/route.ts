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

    const { recipientSlackHandle, senderName, topic, podCode, nudgeType } = await req.json();
    if (!recipientSlackHandle || !senderName || !topic) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Format the Slack handle for proper @mention
    let mention = recipientSlackHandle.trim();
    if (mention.startsWith("U") || mention.startsWith("W")) {
      // Slack user ID format - use proper mention
      mention = `<@${mention}>`;
    } else if (mention.startsWith("@")) {
      // @username format
      mention = mention;
    } else {
      // Plain username - add @
      mention = `@${mention}`;
    }

    const actionText = nudgeType === 'offer'
      ? `wants to help you with *${topic}*`
      : `is looking for help with *${topic}*`;

    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `🔔 *Meshflow Nudge*\n\n${mention} — *${senderName}* ${actionText}`
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: podCode ? `📁 Pod: *${podCode}* • Reply to connect!` : "Reply to connect!"
          }
        ]
      }
    ];

    const resp = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `Meshflow Nudge: ${senderName} ${actionText}`,
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
    console.error("Slack nudge error", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

