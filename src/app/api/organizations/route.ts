import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Generate a random invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// POST - Create organization
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, action } = body;

    if (action === 'join') {
      // Join existing organization
      const { inviteCode } = body;

      if (!inviteCode?.trim()) {
        return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
      }

      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('invite_code', inviteCode.trim().toUpperCase())
        .single();

      if (orgError || !org) {
        return NextResponse.json({ error: "Invalid invite code" }, { status: 400 });
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ organization_id: org.id })
        .eq('user_id', user.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        return NextResponse.json({ error: "Failed to join organization" }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        organization: org,
        message: `Joined ${org.name}!`
      });
    }

    // Create new organization
    if (!name?.trim()) {
      return NextResponse.json({ error: "Organization name is required" }, { status: 400 });
    }

    const inviteCode = generateInviteCode();

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: name.trim(),
        invite_code: inviteCode,
        owner_id: user.id,
      })
      .select()
      .single();

    if (orgError) {
      console.error("Error creating organization:", orgError);
      return NextResponse.json({
        error: "Failed to create organization",
        details: orgError.message
      }, { status: 500 });
    }

    // Update user's profile with org
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ organization_id: org.id })
      .eq('user_id', user.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      // Don't fail - org was created successfully
    }

    return NextResponse.json({
      success: true,
      organization: org,
      inviteCode,
      message: "Organization created!"
    });
  } catch (error) {
    console.error("Organization API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
