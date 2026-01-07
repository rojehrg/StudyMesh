/**
 * Person Suggester for Slack "Ask for Help"
 *
 * This is the ASSISTIVE feature - it suggests who might be able to help
 * based on expertise and availability signals. Users can ignore it and
 * choose anyone.
 *
 * Signals used:
 * - Expertise text (semantic matching via Groq)
 * - Knowledge areas (keyword matching)
 * - Stored availability (from onboarding)
 * - Slack connection status
 */

import { db } from '@/lib/db';
import { profiles, organizations } from '@/lib/db/schema';
import { eq, and, isNotNull, ne } from 'drizzle-orm';
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
    // First, find the organization by Slack team ID
    const org = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slackTeamId, slackTeamId))
      .limit(1);

    if (!org.length) {
      console.log('[Person Suggester] No organization found for Slack team');
      // Fall back to matching by slackTeamId on profiles directly
      return await suggestBySlackTeam(slackTeamId, slackUserId, context, limit);
    }

    const organizationId = org[0].id;

    // Get all profiles in this organization with expertise
    const teamMembers = await db
      .select({
        userId: profiles.userId,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
        slackUserId: profiles.slackUserId,
        department: profiles.department,
        major: profiles.major,
        expertiseText: profiles.expertiseText,
        knowledgeAreas: profiles.knowledgeAreas,
        availability: profiles.availability,
        currentlyAvailable: profiles.currentlyAvailable,
        timezone: profiles.timezone,
      })
      .from(profiles)
      .where(
        and(
          eq(profiles.organizationId, organizationId),
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

    // If we have context, use semantic matching
    if (context.trim() && process.env.GROQ_API_KEY) {
      const membersWithExpertise = otherMembers.filter(m => m.expertiseText);

      if (membersWithExpertise.length > 0) {
        const matchResults = await semanticMatch(
          context,
          membersWithExpertise.map(m => ({
            user_id: m.userId,
            first_name: m.firstName || '',
            last_name: m.lastName || '',
            expertise_text: m.expertiseText || '',
            department: m.department || undefined,
            major: m.major || undefined,
          }))
        );

        // Check for rate limit
        const rateLimited = matchResults.find(m => m.user_id === '__RATE_LIMITED__');
        if (!rateLimited && matchResults.length > 0) {
          // Map match results back to team members with availability hints
          const memberMap = new Map(otherMembers.map(m => [m.userId, m]));

          return matchResults.slice(0, limit).map(match => {
            const member = memberMap.get(match.user_id)!;
            return {
              slackUserId: member.slackUserId!,
              displayName: formatDisplayName(member.firstName, member.lastName, member.department),
              score: match.score,
              matchReason: match.reason,
              availabilityHint: getAvailabilityHint(member.availability, member.currentlyAvailable),
            };
          });
        }
        // Fall through to keyword matching if rate limited or no results
      }
    }

    // Fallback: keyword matching on knowledgeAreas and expertiseText
    if (context.trim()) {
      const contextLower = context.toLowerCase();
      const contextWords = contextLower.split(/\s+/).filter(w => w.length > 2);

      const scored = otherMembers.map(member => {
        let score = 0;

        // Check knowledge areas
        if (member.knowledgeAreas) {
          for (const area of member.knowledgeAreas) {
            if (contextLower.includes(area.toLowerCase())) {
              score += 30;
            } else if (contextWords.some(w => area.toLowerCase().includes(w))) {
              score += 15;
            }
          }
        }

        // Check expertise text
        if (member.expertiseText) {
          const expertiseLower = member.expertiseText.toLowerCase();
          for (const word of contextWords) {
            if (expertiseLower.includes(word)) {
              score += 10;
            }
          }
        }

        // Boost for currently available
        if (member.currentlyAvailable) {
          score += 5;
        }

        return { member, score };
      });

      // Sort by score, filter out zero scores
      const matched = scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      if (matched.length > 0) {
        return matched.map(({ member, score }) => ({
          slackUserId: member.slackUserId!,
          displayName: formatDisplayName(member.firstName, member.lastName, member.department),
          score,
          availabilityHint: getAvailabilityHint(member.availability, member.currentlyAvailable),
        }));
      }
    }

    // No context or no matches - return team members as simple list
    return otherMembers.slice(0, limit).map((m) => ({
      slackUserId: m.slackUserId!,
      displayName: formatDisplayName(m.firstName, m.lastName, m.department),
      score: 10,
      availabilityHint: getAvailabilityHint(m.availability, m.currentlyAvailable),
    }));
  } catch (error) {
    console.error('[Person Suggester] Error:', error);
    return [];
  }
}

/**
 * Fallback: suggest people by Slack team ID when org isn't found
 */
async function suggestBySlackTeam(
  slackTeamId: string,
  slackUserId: string,
  context: string,
  limit: number
): Promise<SuggestedPerson[]> {
  try {
    const teamMembers = await db
      .select({
        userId: profiles.userId,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
        slackUserId: profiles.slackUserId,
        department: profiles.department,
        availability: profiles.availability,
        currentlyAvailable: profiles.currentlyAvailable,
      })
      .from(profiles)
      .where(
        and(
          eq(profiles.slackTeamId, slackTeamId),
          eq(profiles.slackConnected, true),
          isNotNull(profiles.slackUserId),
          ne(profiles.slackUserId, slackUserId)
        )
      )
      .limit(limit);

    if (teamMembers.length === 0) {
      console.log('[Person Suggester] No other team members found in Slack team');
      return [];
    }

    return teamMembers.map((m) => ({
      slackUserId: m.slackUserId!,
      displayName: formatDisplayName(m.firstName, m.lastName, m.department),
      score: 10,
      availabilityHint: getAvailabilityHint(m.availability, m.currentlyAvailable),
    }));
  } catch (error) {
    console.error('[Person Suggester] Slack team fallback error:', error);
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
 * Gets an availability hint based on stored availability data.
 */
function getAvailabilityHint(
  availability: unknown,
  currentlyAvailable: boolean | null
): string | undefined {
  if (currentlyAvailable) {
    return 'Available now';
  }

  // Check if they have availability slots set up
  const avail = availability as { slots?: unknown[] } | null;
  if (avail?.slots && avail.slots.length > 0) {
    return 'Has open hours';
  }

  return undefined;
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
