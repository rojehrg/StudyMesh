import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ podCode: string }> }
) {
  try {
    const supabase = await createClient();
    const { podCode } = await params;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get pod and check ownership
    const { data: pod, error: podError } = await supabase
      .from("pods")
      .select("id, manager_id, created_by")
      .eq("pod_code", podCode.toUpperCase())
      .single();

    if (podError || !pod) {
      return NextResponse.json({ error: "Pod not found" }, { status: 404 });
    }

    // Check if user is manager or creator
    if (pod.manager_id !== user.id && pod.created_by !== user.id) {
      return NextResponse.json({ error: "Not authorized to modify this pod" }, { status: 403 });
    }

    // Get settings from request body
    const body = await request.json();
    const { allow_cross_pod_help } = body;

    // Update pod settings
    const { error: updateError } = await supabase
      .from("pods")
      .update({ allow_cross_pod_help })
      .eq("id", pod.id);

    if (updateError) {
      console.error("Error updating pod settings:", updateError);
      return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }

    return NextResponse.json({ success: true, allow_cross_pod_help });
  } catch (error) {
    console.error("Error in pod settings API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
