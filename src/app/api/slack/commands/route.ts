import { NextResponse } from 'next/server';
import { verifySlackRequest } from '@/lib/slack/verify-signature';
import { handleLockCommand } from '@/lib/slack/momentum-lock/command-handler';

/**
 * Slack Slash Command Handler
 *
 * /attunly - Opens the Momentum Lock modal
 *
 * IMPORTANT: Must respond within 3 seconds or Slack shows an error.
 */
export async function POST(request: Request) {
  try {
    // Get raw body for signature verification
    const body = await request.text();

    // Verify the request came from Slack
    const isValid = await verifySlackRequest(request, body);
    if (!isValid) {
      console.error('[Slack Command] Invalid signature');
      return NextResponse.json(
        { error: 'Invalid request signature' },
        { status: 401 }
      );
    }

    // Parse form-urlencoded body
    const params = new URLSearchParams(body);
    const command = params.get('command');
    const text = params.get('text') || '';
    const userId = params.get('user_id');
    const userName = params.get('user_name');
    const teamId = params.get('team_id');
    const triggerId = params.get('trigger_id');
    const channelId = params.get('channel_id');

    console.log('[Slack Command] Received:', {
      command,
      text,
      userId,
      userName,
      teamId,
    });

    // Check if we have required params
    if (!triggerId || !teamId || !userId || !channelId) {
      console.error('[Slack Command] Missing required params');
      return NextResponse.json({
        response_type: 'ephemeral',
        text: 'Something went wrong. Please try again.',
      });
    }

    // All /attunly commands open the Momentum Lock modal
    console.log('[Slack Command] Opening Momentum Lock modal');

    const result = await handleLockCommand({
      teamId,
      userId,
      channelId,
      triggerId,
    });

    if (result.success) {
      return new NextResponse(null, { status: 200 });
    } else {
      return NextResponse.json({
        response_type: 'ephemeral',
        text: result.error || 'Failed to open Momentum Lock. Please try again.',
      });
    }
  } catch (error) {
    console.error('[Slack Command] Error:', error);

    return NextResponse.json({
      response_type: 'ephemeral',
      text: 'Something went wrong. Please try again.',
    });
  }
}

// Slack only sends POST for slash commands
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. This endpoint only accepts POST requests from Slack.' },
    { status: 405 }
  );
}
