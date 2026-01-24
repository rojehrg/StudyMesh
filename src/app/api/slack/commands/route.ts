import { NextResponse } from 'next/server';
import { verifySlackRequest } from '@/lib/slack/verify-signature';
import { handleLockCommand } from '@/lib/slack/momentum-lock/command-handler';
import { handleStatusCommand } from '@/lib/slack/momentum-lock/status-handler';
import { handleWhosNowCommand } from '@/lib/slack/momentum-lock/whosnow-handler';
import { handleHandoffCommand } from '@/lib/slack/momentum-lock/handoff-handler';
import { handleOverlapCommand } from '@/lib/slack/momentum-lock/overlap-handler';
import { handleStandupCommand } from '@/lib/slack/momentum-lock/standup-handler';
import { handleDigestCommand } from '@/lib/slack/momentum-lock/digest-handler';

/**
 * Parse a Slack user mention from command text
 * Returns the user ID or null if no valid mention found
 */
function parseUserMention(text: string): string | null {
  const match = text.match(/<@([A-Z0-9]+)(?:\|[^>]+)?>/);
  return match ? match[1] : null;
}

/**
 * Slack Slash Command Handler
 *
 * Supports both unified and individual commands:
 *
 * Unified (via /attunly):
 * - /attunly         → Open lock creation modal (default)
 * - /attunly lock    → Open lock creation modal
 * - /attunly status  → Show your active locks (ephemeral)
 * - /attunly help    → Show available commands (ephemeral)
 *
 * Individual commands (same endpoint, different Slack command):
 * - /standup         → Auto-generate standup from locks
 * - /status          → Show your active locks
 * - /digest          → Weekly activity summary
 * - /whosnow         → Who's online right now
 * - /handoff @user   → EOD handoff summary
 * - /overlap @user   → Find working hour overlap
 *
 * IMPORTANT: Must respond within 3 seconds or Slack shows an error.
 *
 * To register individual commands in Slack API Dashboard,
 * point each command to the same endpoint: /api/slack/commands
 */

/**
 * Map direct command names to their subcommand equivalents
 */
const DIRECT_COMMAND_MAP: Record<string, string> = {
  '/standup': 'standup',
  '/status': 'status',
  '/digest': 'digest',
  '/whosnow': 'whosnow',
  '/handoff': 'handoff',
  '/overlap': 'overlap',
};

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
    const command = params.get('command') || '';
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

    // Determine subcommand: check for direct command first, then parse from text
    let subcommand: string;
    if (DIRECT_COMMAND_MAP[command]) {
      // Direct command like /standup, /status, etc.
      subcommand = DIRECT_COMMAND_MAP[command];
      console.log('[Slack Command] Direct command detected:', command, '->', subcommand);
    } else {
      // Parse subcommand from text (for /attunly <subcommand>)
      subcommand = text.trim().toLowerCase().split(/\s+/)[0] || '';
    }

    console.log('[Slack Command] Processing subcommand:', subcommand || '(none)', 'from command:', command);

    // Route to appropriate handler based on subcommand
    switch (subcommand) {
      case 'status':
        // /attunly status - Show user's active locks
        return handleStatusCommand({ teamId, userId, channelId });

      case 'whosnow':
        // /attunly whosnow - Show who's online right now
        return handleWhosNowCommand({ teamId, userId, channelId });

      case 'handoff': {
        // /attunly handoff @user - EOD handoff summary
        const handoffTarget = parseUserMention(text);
        if (!handoffTarget) {
          return NextResponse.json({
            response_type: 'ephemeral',
            text: 'Usage: `/attunly handoff @username`',
          });
        }
        return handleHandoffCommand({ teamId, userId, targetUserId: handoffTarget, channelId });
      }

      case 'overlap': {
        // /attunly overlap @user - Find working hour overlap
        const overlapTarget = parseUserMention(text);
        if (!overlapTarget) {
          return NextResponse.json({
            response_type: 'ephemeral',
            text: 'Usage: `/attunly overlap @username`',
          });
        }
        return handleOverlapCommand({ teamId, userId, targetUserId: overlapTarget, channelId });
      }

      case 'standup':
        // /attunly standup - Auto-generate standup from locks
        return handleStandupCommand({ teamId, userId, channelId });

      case 'digest':
        // /attunly digest - Weekly activity summary
        return handleDigestCommand({ teamId, userId, channelId });

      case 'help':
        // /attunly help - Show available commands
        return NextResponse.json({
          response_type: 'ephemeral',
          text: '*Attunly Commands*\n\n' +
            '*Creating & Tracking:*\n' +
            '*-* `/attunly` - Create a momentum lock\n' +
            '*-* `/attunly status` - See your active locks\n\n' +
            '*Coordination:*\n' +
            '*-* `/attunly whosnow` - Who is online right now?\n' +
            '*-* `/attunly overlap @user` - Find working hour overlap\n' +
            '*-* `/attunly handoff @user` - EOD handoff summary\n\n' +
            '*Reporting:*\n' +
            '*-* `/attunly standup` - Auto-generate standup from locks\n' +
            '*-* `/attunly digest` - Weekly activity summary',
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
