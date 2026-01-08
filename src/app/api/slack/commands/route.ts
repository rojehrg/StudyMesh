import { NextResponse } from 'next/server';
import { verifySlackRequest } from '@/lib/slack/verify-signature';
import { buildAskForHelpModal, openModal, type TeamMember, type RecentContact, type LingoTranslation } from '@/lib/slack/modal-builder';
import { generateHelpMessage } from '@/lib/slack/message-generator';
import { suggestPeople, getRequesterDepartment, getSuggestedPersonDepartment } from '@/lib/slack/person-suggester';
import { translateToLingo } from '@/lib/ai/lingo-translator';
import { db } from '@/lib/db';
import { commandEvents } from '@/lib/db/schema';

/**
 * Track command events for send rate measurement
 * North star metric: send_rate = sent / modal_opened
 */
async function trackEvent(
  eventType: 'invoked' | 'modal_opened' | 'sent' | 'abandoned',
  slackUserId: string,
  slackTeamId: string,
  context?: string,
  metadata?: Record<string, any>
) {
  try {
    await db.insert(commandEvents).values({
      slackUserId,
      slackTeamId,
      eventType,
      context: context?.slice(0, 500), // Truncate for storage
      metadata: metadata || {},
    });
  } catch (error) {
    // Don't fail the main flow if tracking fails
    console.error('[Slack Command] Failed to track event:', error);
  }
}

/**
 * Fetch user's recent DM conversations for quick-select
 * Returns top 3 most recent DM contacts
 */
async function fetchRecentContacts(botToken: string, userId: string): Promise<RecentContact[]> {
  try {
    // Get user's DM conversations
    const conversationsResponse = await fetch(
      'https://slack.com/api/conversations.list?types=im&limit=10',
      {
        headers: {
          Authorization: `Bearer ${botToken}`,
        },
      }
    );

    const conversationsResult = await conversationsResponse.json();

    if (!conversationsResult.ok) {
      console.error('[Slack Command] Failed to fetch conversations:', conversationsResult.error);
      return [];
    }

    // Filter out self-DM and get user IDs
    const dmChannels = conversationsResult.channels
      ?.filter((ch: any) => ch.user && ch.user !== userId)
      ?.slice(0, 5) || [];

    if (dmChannels.length === 0) return [];

    // Fetch user info for each DM contact
    const contacts: RecentContact[] = [];
    for (const channel of dmChannels.slice(0, 3)) {
      try {
        const userResponse = await fetch(
          `https://slack.com/api/users.info?user=${channel.user}`,
          {
            headers: {
              Authorization: `Bearer ${botToken}`,
            },
          }
        );

        const userResult = await userResponse.json();

        if (userResult.ok && userResult.user) {
          const user = userResult.user;
          contacts.push({
            slackUserId: user.id,
            displayName: user.real_name || user.name || 'Unknown',
            avatarUrl: user.profile?.image_72,
          });
        }
      } catch (e) {
        // Skip this user on error
      }
    }

    return contacts;
  } catch (error) {
    console.error('[Slack Command] Failed to fetch recent contacts:', error);
    return [];
  }
}

/**
 * Slack Slash Command Handler
 *
 * Handles POST requests when users type /attunly in Slack.
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

    console.log('[Slack Command] Received:', {
      command,
      text,
      userId,
      userName,
      teamId,
    });

    // Track invocation event
    if (userId && teamId) {
      trackEvent('invoked', userId, teamId, text);
    }

    // Check if we have a trigger_id (required to open modal)
    if (!triggerId) {
      console.error('[Slack Command] No trigger_id provided');
      return NextResponse.json({
        response_type: 'ephemeral',
        text: 'Something went wrong. Please try again.',
      });
    }

    const botToken = process.env.SLACK_BOT_TOKEN;
    if (!botToken) {
      console.error('[Slack Command] No bot token configured');
      return NextResponse.json({
        response_type: 'ephemeral',
        text: 'Attunly is not configured correctly. Please contact your admin.',
      });
    }

    // Run AI message generation, person suggestions, and recent contacts in parallel
    let suggestedMessage: string | undefined;
    let teamMembers: TeamMember[] = [];
    let recentContacts: RecentContact[] = [];
    let lingoTranslation: LingoTranslation | undefined;

    // Start all async operations in parallel
    const messagePromise = text.trim()
      ? generateHelpMessage({
          context: text,
          senderName: userName || undefined,
        }).catch((error) => {
          console.error('[Slack Command] Failed to generate message:', error);
          return null;
        })
      : Promise.resolve(null);

    const suggestionsPromise = teamId && userId
      ? suggestPeople({
          slackTeamId: teamId,
          slackUserId: userId,
          context: text,
          limit: 5,
        }).catch((error) => {
          console.error('[Slack Command] Failed to suggest people:', error);
          return [];
        })
      : Promise.resolve([]);

    // Fetch recent DM contacts for quick-select
    const recentContactsPromise = userId
      ? fetchRecentContacts(botToken, userId).catch((error) => {
          console.error('[Slack Command] Failed to fetch recent contacts:', error);
          return [];
        })
      : Promise.resolve([]);

    // Get requester's department for lingo translation
    const requesterInfoPromise = teamId && userId
      ? getRequesterDepartment(teamId, userId).catch((error) => {
          console.error('[Slack Command] Failed to get requester department:', error);
          return { department: null, organizationId: null };
        })
      : Promise.resolve({ department: null, organizationId: null });

    // Wait for all to complete
    const [messageResult, suggestions, contacts, requesterInfo] = await Promise.all([
      messagePromise,
      suggestionsPromise,
      recentContactsPromise,
      requesterInfoPromise,
    ]);

    if (messageResult) {
      suggestedMessage = messageResult.message;
      console.log('[Slack Command] AI message generated:', {
        fallback: messageResult.fallback,
        length: suggestedMessage.length,
      });
    }

    if (suggestions.length > 0) {
      teamMembers = suggestions;
      console.log('[Slack Command] People suggested:', {
        count: suggestions.length,
        topScore: suggestions[0].score,
      });
    }

    if (contacts.length > 0) {
      recentContacts = contacts;
      console.log('[Slack Command] Recent contacts found:', contacts.length);
    }

    // Cross-department lingo translation
    // If requester has a department and we have suggestions, translate for the top suggestion's department
    if (
      text.trim() &&
      requesterInfo.department &&
      requesterInfo.organizationId &&
      teamId &&
      suggestions.length > 0
    ) {
      const topSuggestion = suggestions[0];
      const targetDepartment = await getSuggestedPersonDepartment(teamId, topSuggestion.slackUserId);

      if (targetDepartment && targetDepartment !== requesterInfo.department) {
        console.log('[Slack Command] Attempting lingo translation:', {
          source: requesterInfo.department,
          target: targetDepartment,
        });

        try {
          const translation = await translateToLingo(
            text,
            requesterInfo.department,
            targetDepartment,
            requesterInfo.organizationId
          );

          if (translation.wasTranslated) {
            lingoTranslation = translation;
            console.log('[Slack Command] Lingo translation successful:', {
              sourceDepartment: translation.sourceDepartment,
              targetDepartment: translation.targetDepartment,
            });
          }
        } catch (error) {
          console.error('[Slack Command] Lingo translation failed:', error);
        }
      }
    }

    // Build and open the modal
    const modal = buildAskForHelpModal({
      initialContext: text,
      teamMembers,
      suggestedMessage,
      recentContacts,
      lingoTranslation,
    });

    try {
      await openModal(triggerId, modal);

      // Track modal opened event
      if (userId && teamId) {
        trackEvent('modal_opened', userId, teamId, text, {
          hasAiMessage: !!suggestedMessage,
          suggestionsCount: teamMembers.length,
          recentContactsCount: recentContacts.length,
          hasLingoTranslation: !!lingoTranslation?.wasTranslated,
          lingoSourceDept: lingoTranslation?.sourceDepartment,
          lingoTargetDept: lingoTranslation?.targetDepartment,
        });
      }

      // Return empty 200 to acknowledge the command
      return new NextResponse(null, { status: 200 });
    } catch (error) {
      console.error('[Slack Command] Failed to open modal:', error);
      return NextResponse.json({
        response_type: 'ephemeral',
        text: 'Failed to open the help form. Please try again.',
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

// Export trackEvent for use in interactions handler
export { trackEvent };

// Slack only sends POST for slash commands
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. This endpoint only accepts POST requests from Slack.' },
    { status: 405 }
  );
}
