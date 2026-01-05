import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enforceSeatLimit } from "@/lib/billing/enforcement";
import { createLogger } from "@/lib/logger";

const log = createLogger({ service: 'organizations-api' });

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

      // Enforce seat limit before allowing join
      const enforcement = await enforceSeatLimit(org.id, 1);
      if (!enforcement.allowed) {
        log.info('Join blocked - seat limit reached', {
          userId: user.id,
          organizationId: org.id,
          current: enforcement.current,
          limit: enforcement.limit,
          plan: enforcement.plan,
        });

        return NextResponse.json(
          {
            error: enforcement.message,
            code: 'SEAT_LIMIT_REACHED',
            current: enforcement.current,
            limit: enforcement.limit,
            plan: enforcement.plan,
          },
          { status: 402 } // Payment Required
        );
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ organization_id: org.id })
        .eq('user_id', user.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        return NextResponse.json({ error: "Failed to join organization" }, { status: 500 });
      }

      log.info('User joined organization', {
        userId: user.id,
        organizationId: org.id,
        seatCount: enforcement.current + 1,
      });

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
    const { trialPlan } = body;

    // Build organization insert data
    const orgData: any = {
      name: name.trim(),
      invite_code: inviteCode,
      owner_id: user.id,
    };

    // If a trial plan is specified, set up the 14-day trial
    if (trialPlan && (trialPlan === 'starter' || trialPlan === 'pro')) {
      const now = new Date();
      const trialEnds = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days

      orgData.trial_plan = trialPlan;
      orgData.trial_started_at = now.toISOString();
      orgData.trial_ends_at = trialEnds.toISOString();
      // Set subscription plan to trial plan so enforcement uses trial limits
      orgData.subscription_plan = trialPlan;
      orgData.subscription_status = 'trialing';

      log.info('Creating organization with trial', {
        userId: user.id,
        trialPlan,
        trialEndsAt: trialEnds.toISOString(),
      });
    }

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert(orgData)
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
