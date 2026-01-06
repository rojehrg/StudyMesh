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
import { profiles, podMembers, pods } from '@/lib/db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';
import { semanticMatch } from '@/lib/ai/semantic-search';
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
    const teamMembers = await db
      .select({
        userId: profiles.userId,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
        slackUserId: profiles.slackUserId,
        expertiseText: profiles.expertiseText,
        knowledgeAreas: profiles.knowledgeAreas,
        currentlyAvailable: profiles.currentlyAvailable,
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

    // If no context provided, return all members with availability hints
    if (!context.trim()) {
      return otherMembers.slice(0, limit).map((m) => ({
        slackUserId: m.slackUserId!,
        displayName: formatDisplayName(m.firstName, m.lastName, m.department),
        availabilityHint: getAvailabilityHint(m.currentlyAvailable),
        score: 0,
      }));
    }

    // Try semantic matching first
    const profilesForMatching = otherMembers
      .filter((m) => m.expertiseText || (m.knowledgeAreas && m.knowledgeAreas.length > 0))
      .map((m) => ({
        user_id: m.userId,
        first_name: m.firstName || '',
        last_name: m.lastName || '',
        expertise_text: buildExpertiseText(m.expertiseText, m.knowledgeAreas),
        department: m.department || undefined,
        major: m.major || undefined,
      }));

    let matchResults: { user_id: string; score: number; reason: string }[] = [];

    if (profilesForMatching.length > 0) {
      matchResults = await semanticMatch(context, profilesForMatching);
    }

    // Build scored results
    const scoredResults: SuggestedPerson[] = [];

    for (const member of otherMembers) {
      const match = matchResults.find((r) => r.user_id === member.userId);

      if (match && match.user_id !== '__RATE_LIMITED__') {
        scoredResults.push({
          slackUserId: member.slackUserId!,
          displayName: formatDisplayName(member.firstName, member.lastName, member.department),
          availabilityHint: getAvailabilityHint(member.currentlyAvailable),
          score: match.score,
          matchReason: match.reason,
        });
      }
    }

    // Sort by score and apply limit
    scoredResults.sort((a, b) => b.score - a.score);

    // If we got semantic matches, return those
    if (scoredResults.length > 0) {
      return scoredResults.slice(0, limit);
    }

    // Fallback: return available members first, then others
    const fallbackResults = otherMembers
      .map((m) => ({
        slackUserId: m.slackUserId!,
        displayName: formatDisplayName(m.firstName, m.lastName, m.department),
        availabilityHint: getAvailabilityHint(m.currentlyAvailable),
        score: m.currentlyAvailable ? 50 : 10,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return fallbackResults;
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
 * Generates an availability hint based on status.
 */
function getAvailabilityHint(currentlyAvailable: boolean | null): string | undefined {
  if (currentlyAvailable === true) {
    return 'likely available';
  }
  if (currentlyAvailable === false) {
    return 'may be busy';
  }
  return undefined;
}

/**
 * Builds expertise text from profile data.
 */
function buildExpertiseText(
  expertiseText: string | null,
  knowledgeAreas: string[] | null
): string {
  const parts: string[] = [];

  if (expertiseText) {
    parts.push(expertiseText);
  }

  if (knowledgeAreas && knowledgeAreas.length > 0) {
    parts.push(`Knowledge areas: ${knowledgeAreas.join(', ')}`);
  }

  return parts.join('. ') || 'No expertise listed';
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
