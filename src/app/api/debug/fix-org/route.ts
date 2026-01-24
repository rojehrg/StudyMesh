import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * One-time fix to set organization slack_team_id from user's profile
 * GET /api/debug/fix-org
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get user's profile with slack_team_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("slack_team_id, organization_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: "No organization found" });
    }

    if (!profile?.slack_team_id) {
      return NextResponse.json({ error: "No slack_team_id in profile" });
    }

    // Get current org state
    const { data: orgBefore } = await supabase
      .from("organizations")
      .select("id, name, slack_team_id")
      .eq("id", profile.organization_id)
      .maybeSingle();

    // Update the organization with the slack_team_id
    const { data: updated, error } = await supabase
      .from("organizations")
      .update({ slack_team_id: profile.slack_team_id })
      .eq("id", profile.organization_id)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message });
    }

    return NextResponse.json({
      success: true,
      before: orgBefore,
      after: updated,
      message: "Organization slack_team_id has been set!",
    });
  } catch (error) {
    console.error("Fix org error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
