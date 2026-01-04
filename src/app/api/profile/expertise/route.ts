import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/profile/expertise
 *
 * Update user's expertise text and embedding.
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
    const { expertiseText, embedding } = body;

    if (typeof expertiseText !== 'string') {
      return NextResponse.json(
        { error: "expertiseText must be a string" },
        { status: 400 }
      );
    }

    // Update expertise_text using standard Supabase client
    const { error: textError } = await supabase
      .from('profiles')
      .update({
        expertise_text: expertiseText || null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (textError) {
      console.error('Error updating expertise text:', textError);
      return NextResponse.json(
        { error: "Failed to update expertise text" },
        { status: 500 }
      );
    }

    // Update embedding using raw SQL (Supabase client doesn't handle vector type directly)
    if (embedding && Array.isArray(embedding) && embedding.length === 384) {
      const embeddingStr = `[${embedding.join(',')}]`;

      const { error: embeddingError } = await supabase.rpc('update_expertise_embedding', {
        p_user_id: user.id,
        p_embedding: embeddingStr,
      });

      if (embeddingError) {
        console.error('Error updating embedding:', embeddingError);
        // Don't fail the whole request if embedding update fails
        // The text is already saved
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating expertise:", error);
    return NextResponse.json(
      { error: "Failed to update expertise" },
      { status: 500 }
    );
  }
}
