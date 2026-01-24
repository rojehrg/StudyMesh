import { NextResponse } from 'next/server';
import { verifySlackRequest } from '@/lib/slack/verify-signature';
import { handleLockCommand } from '@/lib/slack/momentum-lock/command-handler';
import { handleStatusCommand } from '@/lib/slack/momentum-lock/status-handler';

/**
 * Slack Slash Command Handler
 *
 * Subcommands:
 * - /attunly         → Open lock creation modal (default)
 * - /attunly lock    → Open lock creation modal
 * - /attunly status  → Show your active locks (ephemeral)
 * - /attunly help    → Show available commands (ephemeral)
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
    if (!teamId || !userId || !channelId) {
      console.error('[Slack Command] Missing required params');
      return NextResponse.json({
        response_type: 'ephemeral',
        text: 'Something went wrong. Please try again.',
      });
    }

    // Parse subcommand from text
    const subcommand = text.trim().toLowerCase().split(/\s+/)[0] || '';

    console.log('[Slack Command] Processing subcommand:', subcommand || '(none)');

    // Route to appropriate handler based on subcommand
    switch (subcommand) {
      case 'status':
        // /attunly status - Show user's active locks
        return handleStatusCommand({ teamId, userId, channelId });

      case 'help':
        // /attunly help - Show available commands
        return NextResponse.json({
          response_type: 'ephemeral',
          text: '*Attunly Commands*\n\n' +
            '*·* `/attunly` - Create a momentum lock\n' +
            '*·* `/attunly status` - See your active locks\n' +
            '*·* `/attunly help` - Show this help message',
        });

      case 'lock':
      case '':
      default:
        // /attunly or /attunly lock - Open the lock creation modal
        // Requires triggerId for modal
        if (!triggerId) {
          console.error('[Slack Command] Missing triggerId for modal');
          return NextResponse.json({
            response_type: 'ephemeral',
            text: 'Something went wrong. Please try again.',
          });
        }

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
