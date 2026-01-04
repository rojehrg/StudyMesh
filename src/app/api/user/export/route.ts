import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createLogger } from "@/lib/logger";

const log = createLogger({ service: 'api', action: 'data-export' });

/**
 * GET /api/user/export
 *
 * GDPR-compliant data export endpoint.
 * Returns all user data in JSON format.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    log.info('Data export requested', { userId: user.id });

    // Fetch all user data in parallel
    const [
      { data: profile },
      { data: notifications },
      { data: podMemberships },
      { data: meetings },
      { data: meetingParticipation },
      { data: schedulingPermissions },
      { data: providerCredentials },
    ] = await Promise.all([
      // Profile data
      supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single(),

      // Notifications (sent and received)
      supabase
        .from('notifications')
        .select('*')
        .or(`recipient_id.eq.${user.id},sender_id.eq.${user.id}`)
        .order('created_at', { ascending: false }),

      // Pod memberships
      supabase
        .from('pod_members')
        .select(`
          *,
          pod:pods (
            pod_code,
            pod_name,
            business_unit,
            created_at
          )
        `)
        .eq('user_id', user.id),

      // Meetings organized
      supabase
        .from('scheduled_meetings')
        .select('*')
        .eq('organizer_id', user.id)
        .order('scheduled_time', { ascending: false }),

      // Meeting participation
      supabase
        .from('meeting_participants')
        .select(`
          *,
          meeting:scheduled_meetings (
            title,
            scheduled_time,
            duration_minutes,
            status
          )
        `)
        .eq('user_id', user.id),

      // Scheduling permissions
      supabase
        .from('scheduling_permissions')
        .select('*')
        .or(`authorized_user_id.eq.${user.id},with_user_id.eq.${user.id}`),

      // Connected providers (without tokens)
      supabase
        .from('user_provider_credentials')
        .select('provider, provider_email, created_at, updated_at')
        .eq('user_id', user.id),
    ]);

    // Compile export data
    const exportData = {
      exported_at: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        app_metadata: user.app_metadata,
        user_metadata: user.user_metadata,
      },
      profile: profile ? {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        department: profile.department,
        major: profile.major,
        bio: profile.bio,
        timezone: profile.timezone,
        knowledge_areas: profile.knowledge_areas,
        expertise_skills: profile.expertise_skills,
        expertise_text: profile.expertise_text,
        availability: profile.availability,
        currently_available: profile.currently_available,
        preferred_group_size: profile.preferred_group_size,
        looking_to_help: profile.looking_to_help,
        slack_connected: profile.slack_connected,
        slack_handle: profile.slack_handle,
        email_notifications: profile.email_notifications,
        onboarding_completed: profile.onboarding_completed,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      } : null,
      notifications: notifications?.map(n => ({
        id: n.id,
        type: n.type,
        content: n.content,
        metadata: n.metadata,
        read: n.read,
        created_at: n.created_at,
        direction: n.sender_id === user.id ? 'sent' : 'received',
      })) || [],
      pod_memberships: podMemberships?.map(pm => ({
        pod_code: pm.pod?.pod_code,
        pod_name: pm.pod?.pod_name,
        business_unit: pm.pod?.business_unit,
        joined_at: pm.joined_at,
      })) || [],
      meetings_organized: meetings?.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        scheduled_time: m.scheduled_time,
        duration_minutes: m.duration_minutes,
        status: m.status,
        meeting_provider: m.meeting_provider,
        created_at: m.created_at,
      })) || [],
      meeting_participation: meetingParticipation?.map(mp => ({
        meeting_title: mp.meeting?.title,
        scheduled_time: mp.meeting?.scheduled_time,
        rsvp_status: mp.rsvp_status,
        notified_via: mp.notified_via,
      })) || [],
      scheduling_permissions: schedulingPermissions?.map(sp => ({
        role: sp.authorized_user_id === user.id ? 'scheduler' : 'schedulee',
        used: sp.used,
        expires_at: sp.expires_at,
        created_at: sp.created_at,
      })) || [],
      connected_providers: providerCredentials?.map(pc => ({
        provider: pc.provider,
        email: pc.provider_email,
        connected_at: pc.created_at,
      })) || [],
    };

    log.info('Data export completed', { userId: user.id });

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="attunly-data-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error: any) {
    log.error('Data export failed', { error: error.message });
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
