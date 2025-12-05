import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const webhook = process.env.SLACK_WEBHOOK_URL;
    if (!webhook) {
      return NextResponse.json({ skipped: true, reason: "Webhook not configured" }, { status: 200 });
    }

    const { recipientSlackHandle, senderName, topic, podCode } = await req.json();
    if (!recipientSlackHandle || !senderName || !topic) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const text = [
      `👋 *Nudge from ${senderName}*`,
      `• Topic: ${topic}`,
      podCode ? `• Pod: ${podCode}` : null,
      `• Recipient: ${recipientSlackHandle}`,
      "",
      "Reply in Slack to connect."
    ].filter(Boolean).join("\n");

    const resp = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
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

