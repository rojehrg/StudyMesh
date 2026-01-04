import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { serverAnalytics } from "@/lib/analytics";
import { semanticMatch } from "@/lib/ai/semantic-search";

/**
 * POST /api/find-help
 *
 * Find people with matching expertise using AI-powered semantic search.
 * Uses Groq (free) for intelligent matching.
 * Falls back to text search if AI is not configured.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { queryText, limit = 10 } = body;

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json(
        { error: "User must belong to an organization" },
        { status: 400 }
      );
    }

    // Fetch all profiles with expertise in the org (excluding current user)
    const { data: allProfiles, error: fetchError } = await supabase
      .from('profiles')
      .select(`
        user_id,
        first_name,
        last_name,
        expertise_text,
        major,
        department,
        timezone,
        availability,
        slack_user_id
      `)
      .eq('organization_id', profile.organization_id)
      .neq('user_id', user.id)
      .not('expertise_text', 'is', null);

    if (fetchError) {
      console.error('Failed to fetch profiles:', fetchError);
      return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }

    if (!allProfiles || allProfiles.length === 0) {
      return NextResponse.json({
        success: true,
        matches: [],
        searchType: 'none',
        message: 'No teammates with expertise found',
      });
    }

    // Try AI-powered semantic search first (Groq - free)
    if (queryText && queryText.trim() && process.env.GROQ_API_KEY) {
      const aiMatches = await semanticMatch(queryText, allProfiles.map(p => ({
        user_id: p.user_id,
        first_name: p.first_name || '',
        last_name: p.last_name || '',
        expertise_text: p.expertise_text || '',
        department: p.department || undefined,
        major: p.major || undefined,
      })));

      // Check for rate limit marker
      const rateLimited = aiMatches.find(m => m.user_id === '__RATE_LIMITED__');
      if (rateLimited) {
        // Fall through to text search, but we'll add a warning
        console.warn('AI rate limited, using text search fallback');
      } else if (aiMatches.length > 0) {
        // Map AI results back to full profiles
        const profileMap = new Map(allProfiles.map(p => [p.user_id, p]));
        const matches = aiMatches.slice(0, limit).map(match => {
          const p = profileMap.get(match.user_id)!;
          return {
            user_id: p.user_id,
            first_name: p.first_name,
            last_name: p.last_name,
            expertise_text: p.expertise_text,
            similarity: match.score / 100,
            match_reason: match.reason,
            currently_available: p.availability?.currentlyAvailable || false,
            major: p.major,
            department: p.department,
            timezone: p.timezone,
            availability_slots: p.availability?.slots || [],
            slack_connected: !!p.slack_user_id,
          };
        });

        serverAnalytics.findHelpSearched(user.id, queryText, matches.length);
        return NextResponse.json({
          success: true,
          matches,
          searchType: 'ai',
        });
      }
    }

    // Fallback: Text search using ILIKE on expertise_text
    if (queryText && queryText.trim()) {
      // Common stop words to filter out
      const stopWords = new Set([
        'i', 'me', 'my', 'we', 'our', 'you', 'your', 'the', 'a', 'an',
        'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
        'can', 'may', 'might', 'must', 'shall',
        'need', 'want', 'looking', 'find', 'help', 'with', 'for', 'about',
        'someone', 'anybody', 'anyone', 'something', 'some', 'any',
        'who', 'what', 'where', 'when', 'why', 'how',
        'and', 'or', 'but', 'if', 'then', 'than', 'that', 'this', 'these', 'those',
        'of', 'in', 'on', 'at', 'to', 'from', 'by', 'as', 'into', 'like',
        'know', 'knows', 'good', 'well', 'get', 'got', 'make', 'made',
      ]);

      const searchTerms = queryText
        .toLowerCase()
        .split(/\s+/)
        .filter((t: string) => t.length > 1 && !stopWords.has(t));

      if (searchTerms.length > 0) {
        // Build OR conditions - match ANY of the search terms
        const orConditions = searchTerms
          .map((term: string) => `expertise_text.ilike.%${term}%`)
          .join(',');

        const { data: textMatches, error: textError } = await supabase
          .from('profiles')
          .select(`
            user_id,
            first_name,
            last_name,
            expertise_text,
            major,
            department,
            timezone,
            availability,
            slack_user_id
          `)
          .eq('organization_id', profile.organization_id)
          .neq('user_id', user.id)
          .not('expertise_text', 'is', null)
          .or(orConditions)
          .limit(limit * 2); // Fetch more to allow for scoring

        if (textError) {
          console.error('Text search error:', textError);
          return NextResponse.json(
            { error: "Search failed" },
            { status: 500 }
          );
        }

        // Score and sort results by number of matching terms
        const scoredMatches = (textMatches || []).map((p: any) => {
          const expertiseLower = (p.expertise_text || '').toLowerCase();
          const matchCount = searchTerms.filter((term: string) => expertiseLower.includes(term)).length;
          const similarity = Math.min(0.5 + (matchCount / searchTerms.length) * 0.5, 1);

          return {
            user_id: p.user_id,
            first_name: p.first_name,
            last_name: p.last_name,
            expertise_text: p.expertise_text,
            similarity,
            matchCount,
            currently_available: p.availability?.currentlyAvailable || false,
            major: p.major,
            department: p.department,
            timezone: p.timezone,
            availability_slots: p.availability?.slots || [],
            slack_connected: !!p.slack_user_id,
          };
        });

        // Sort by match count (most relevant first), then limit
        scoredMatches.sort((a, b) => b.matchCount - a.matchCount);
        const matches = scoredMatches.slice(0, limit).map(({ matchCount, ...rest }) => rest);

        // Track text search
        serverAnalytics.findHelpSearched(user.id, queryText, matches.length);
        return NextResponse.json({
          success: true,
          matches,
          searchType: 'text',
        });
      }
    }

    // No valid search query
    return NextResponse.json({
      success: true,
      matches: [],
      searchType: queryEmbedding ? 'ai' : 'text',
    });

  } catch (error) {
    console.error("Find help error:", error);
    return NextResponse.json(
      { error: "Failed to find help" },
      { status: 500 }
    );
  }
}
