import { NextResponse } from 'next/server';
import { verifySlackRequest } from '@/lib/slack/verify-signature';

/**
 * Slack Events API Handler
 *
 * Handles:
 * 1. URL verification challenge (required for setup)
 * 2. Event subscriptions (reactions, messages, etc.)
 */
export async function POST(request: Request) {
  try {
    // Get raw body for signature verification
    const body = await request.text();

    // Parse JSON body
    let payload;
    try {
      payload = JSON.parse(body);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Handle URL verification challenge (sent when setting up events URL)
    if (payload.type === 'url_verification') {
      console.log('[Slack Events] URL verification challenge received');
      return NextResponse.json({ challenge: payload.challenge });
    }

    // For actual events, verify the request signature
    const isValid = await verifySlackRequest(request, body);
    if (!isValid) {
      console.error('[Slack Events] Invalid signature');
      return NextResponse.json({ error: 'Invalid request signature' }, { status: 401 });
    }

    // Handle event callbacks
    if (payload.type === 'event_callback') {
      const event = payload.event;
      console.log('[Slack Events] Event received:', {
        type: event?.type,
        subtype: event?.subtype,
      });

      // Handle specific event types here
      // For now, just acknowledge receipt

      // Return 200 immediately to acknowledge receipt
      // Slack requires response within 3 seconds
      return new NextResponse(null, { status: 200 });
    }

    // Unknown event type
    console.log('[Slack Events] Unknown payload type:', payload.type);
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('[Slack Events] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Slack only sends POST for events
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. This endpoint only accepts POST requests from Slack.' },
    { status: 405 }
  );
}
