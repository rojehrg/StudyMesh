import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/find-help
 *
 * Find people with matching expertise using vector similarity search.
 * Embedding is generated client-side and passed in the request.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { queryEmbedding, limit = 10 } = body;

    if (!queryEmbedding || !Array.isArray(queryEmbedding)) {
      return NextResponse.json(
        { error: "queryEmbedding is required and must be an array" },
        { status: 400 }
      );
    }

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

    // Call the RPC function for vector similarity search
    const { data: matches, error } = await supabase.rpc('find_similar_expertise', {
      query_embedding: `[${queryEmbedding.join(',')}]`,
      org_id: profile.organization_id,
      current_user_id: user.id,
      match_count: limit,
    });

    if (error) {
      console.error('Find help error:', error);
      return NextResponse.json(
        { error: "Failed to search for matches" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      matches: matches || [],
    });
  } catch (error) {
    console.error("Find help error:", error);
    return NextResponse.json(
      { error: "Failed to find help" },
      { status: 500 }
    );
  }
}
