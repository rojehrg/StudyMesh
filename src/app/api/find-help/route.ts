import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/find-help
 *
 * Find people with matching expertise using vector similarity search.
 * Falls back to text search if embedding is not provided.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { queryEmbedding, queryText, limit = 10 } = body;

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

    // Try vector search if embedding is provided
    if (queryEmbedding && Array.isArray(queryEmbedding)) {
      const { data: matches, error } = await supabase.rpc('find_similar_expertise', {
        query_embedding: `[${queryEmbedding.join(',')}]`,
        org_id: profile.organization_id,
        current_user_id: user.id,
        match_count: limit,
      });

      if (!error && matches && matches.length > 0) {
        return NextResponse.json({
          success: true,
          matches: matches,
          searchType: 'ai',
        });
      }

      // If vector search returns no results or fails, fall through to text search
      if (error) {
        console.error('Vector search error, falling back to text:', error.message);
      }
    }

    // Fallback: Text search using ILIKE on expertise_text
    if (queryText && queryText.trim()) {
      const searchTerms = queryText.toLowerCase().split(/\s+/).filter((t: string) => t.length > 2);

      if (searchTerms.length > 0) {
        // Build search pattern for ILIKE
        const searchPattern = `%${searchTerms.join('%')}%`;

        const { data: textMatches, error: textError } = await supabase
          .from('profiles')
          .select(`
            user_id,
            first_name,
            last_name,
            expertise_text,
            currently_available,
            major,
            department,
            timezone,
            availability,
            slack_user_id
          `)
          .eq('organization_id', profile.organization_id)
          .neq('user_id', user.id)
          .not('expertise_text', 'is', null)
          .ilike('expertise_text', searchPattern)
          .limit(limit);

        if (textError) {
          console.error('Text search error:', textError);
          return NextResponse.json(
            { error: "Search failed" },
            { status: 500 }
          );
        }

        // Transform results to match the expected format
        const matches = (textMatches || []).map((p) => ({
          user_id: p.user_id,
          first_name: p.first_name,
          last_name: p.last_name,
          expertise_text: p.expertise_text,
          similarity: 0.5, // Default similarity for text matches
          currently_available: p.currently_available,
          major: p.major,
          department: p.department,
          timezone: p.timezone,
          availability_slots: p.availability?.slots || [],
          slack_connected: !!p.slack_user_id,
        }));

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
