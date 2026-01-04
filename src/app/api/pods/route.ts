import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enforcePodLimit } from "@/lib/billing/enforcement";
import { createLogger } from "@/lib/logger";
import { serverAnalytics } from "@/lib/analytics";

const log = createLogger({ service: 'pods-api' });

// Generate a random pod code
function generatePodCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// POST - Create pod with tier enforcement
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organization
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile?.organization_id) {
      return NextResponse.json(
        { error: "You must be part of an organization to create pods" },
        { status: 400 }
      );
    }

    const organizationId = profile.organization_id;

    // Enforce pod limit
    const enforcement = await enforcePodLimit(organizationId);
    if (!enforcement.allowed) {
      log.info('Pod creation blocked - limit reached', {
        userId: user.id,
        organizationId,
        current: enforcement.current,
        limit: enforcement.limit,
        plan: enforcement.plan,
      });

      return NextResponse.json(
        {
          error: enforcement.message,
          code: 'POD_LIMIT_REACHED',
          current: enforcement.current,
          limit: enforcement.limit,
          plan: enforcement.plan,
          upgradeUrl: '/settings?tab=billing',
        },
        { status: 402 } // Payment Required
      );
    }

    // Parse request body
    const body = await request.json();
    const { podName, businessUnit, initiativeOwner, term, allowCrossPodHelp } = body;

    if (!podName?.trim()) {
      return NextResponse.json({ error: "Pod name is required" }, { status: 400 });
    }

    const podCode = generatePodCode();

    // Create pod with organization_id
    const { data: pod, error: podError } = await supabase
      .from('pods')
      .insert({
        pod_code: podCode,
        pod_name: podName.trim(),
        business_unit: businessUnit || null,
        initiative_owner: initiativeOwner || null,
        term: term || null,
        created_by: user.id,
        manager_id: user.id,
        allow_cross_pod_help: allowCrossPodHelp ?? true,
        organization_id: organizationId, // Link to org for enforcement
      })
      .select()
      .single();

    if (podError) {
      log.error('Failed to create pod', { error: podError.message, userId: user.id });

      // Check if it's a column doesn't exist error (organization_id not in table)
      if (podError.message.includes('organization_id')) {
        // Fallback: create without organization_id if column doesn't exist yet
        const { data: podFallback, error: fallbackError } = await supabase
          .from('pods')
          .insert({
            pod_code: podCode,
            pod_name: podName.trim(),
            business_unit: businessUnit || null,
            initiative_owner: initiativeOwner || null,
            term: term || null,
            created_by: user.id,
            manager_id: user.id,
            allow_cross_pod_help: allowCrossPodHelp ?? true,
          })
          .select()
          .single();

        if (fallbackError) {
          return NextResponse.json(
            { error: "Failed to create pod", details: fallbackError.message },
            { status: 500 }
          );
        }

        // Add creator as member
        await supabase.from('pod_members').insert({
          pod_id: podFallback.id,
          user_id: user.id,
        });

        log.info('Pod created (fallback mode)', { podCode, userId: user.id });

        return NextResponse.json({
          success: true,
          pod: podFallback,
          podCode,
        });
      }

      return NextResponse.json(
        { error: "Failed to create pod", details: podError.message },
        { status: 500 }
      );
    }

    // Add creator as first member
    const { error: memberError } = await supabase
      .from('pod_members')
      .insert({
        pod_id: pod.id,
        user_id: user.id,
      });

    if (memberError) {
      log.error('Failed to add creator as member', { error: memberError.message, podId: pod.id });
      // Don't fail - pod was created
    }

    log.info('Pod created', {
      podCode,
      podId: pod.id,
      userId: user.id,
      organizationId,
      podCount: enforcement.current + 1,
    });

    // Track pod creation
    serverAnalytics.podCreated(user.id, pod.id, podName.trim());

    return NextResponse.json({
      success: true,
      pod,
      podCode,
      usage: {
        current: enforcement.current + 1,
        limit: enforcement.limit,
      },
    });
  } catch (error: any) {
    log.error('Pod creation error', { error: error.message });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - List pods for user
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get pods user is a member of
    const { data: memberPods, error } = await supabase
      .from('pod_members')
      .select(`
        pod:pods (
          id,
          pod_code,
          pod_name,
          business_unit,
          initiative_owner,
          term,
          manager_id,
          allow_cross_pod_help,
          created_at
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: "Failed to fetch pods" }, { status: 500 });
    }

    const pods = memberPods?.map(m => m.pod).filter(Boolean) || [];

    return NextResponse.json({ pods });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
