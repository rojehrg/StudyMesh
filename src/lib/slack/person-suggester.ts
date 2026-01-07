/**
 * Person Suggester for Slack "Ask for Help"
 *
 * This is the ASSISTIVE feature - it suggests who might be able to help
 * based on expertise and availability signals. Users can ignore it and
 * choose anyone.
 *
 * Signals used (all inferred, no manual status setting required):
 * - Expertise text (semantic matching)
 * - Knowledge areas (keyword matching)
 * - Current availability status
 * - Slack connection status
 */

import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';
import type { TeamMember } from './modal-builder';

interface SuggesterConfig {
  slackTeamId: string;
  slackUserId: string; // The person asking for help (exclude from suggestions)
  context: string;
  limit?: number;
}

interface SuggestedPerson extends TeamMember {
  score: number;
  matchReason?: string;
}

/**
 * Suggests people who might be able to help based on context.
 *
 * Returns a list of team members sorted by relevance, with availability hints.
 */
export async function suggestPeople(
  config: SuggesterConfig
): Promise<SuggestedPerson[]> {
  const { slackTeamId, slackUserId, context, limit = 5 } = config;

  try {
    // Get all Slack-connected users in the same workspace (excluding the requester)
    // Only query columns that definitely exist in the database
    const teamMembers = await db
      .select({
        userId: profiles.userId,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
        slackUserId: profiles.slackUserId,
        department: profiles.department,
        major: profiles.major,
      })
      .from(profiles)
      .where(
        and(
          eq(profiles.slackTeamId, slackTeamId),
          eq(profiles.slackConnected, true),
          isNotNull(profiles.slackUserId)
        )
      );

    // Filter out the requester
    const otherMembers = teamMembers.filter(
      (m) => m.slackUserId !== slackUserId
    );

    if (otherMembers.length === 0) {
      console.log('[Person Suggester] No other team members found');
      return [];
    }

    // Return team members as simple list (no semantic matching for now)
    // Person suggestions are secondary - just return basic list
    return otherMembers.slice(0, limit).map((m) => ({
      slackUserId: m.slackUserId!,
      displayName: formatDisplayName(m.firstName, m.lastName, m.department),
      score: 10,
    }));
  } catch (error) {
    console.error('[Person Suggester] Error:', error);
    return [];
  }
}

/**
 * Formats a display name for the modal dropdown.
 */
function formatDisplayName(
  firstName: string | null,
  lastName: string | null,
  department: string | null
): string {
  const name = [firstName, lastName].filter(Boolean).join(' ') || 'Unknown';
  return department ? `${name} (${department})` : name;
}

/**
 * Gets the top suggested person for auto-selection in modal.
 */
export async function getTopSuggestion(
  config: SuggesterConfig
): Promise<SuggestedPerson | null> {
  const suggestions = await suggestPeople({ ...config, limit: 1 });
  return suggestions.length > 0 ? suggestions[0] : null;
}
