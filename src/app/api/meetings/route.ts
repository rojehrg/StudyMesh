import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyParticipant } from "@/lib/notifications";
import { decryptToken } from "@/lib/encryption";
import { createZoomMeeting, MeetingProvider } from "@/lib/meeting-providers";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get meetings where user is organizer or participant
    const { data: organizedMeetings, error: error1 } = await supabase
      .from('scheduled_meetings')
      .select(`
        *,
        meeting_participants (
          user_id,
          rsvp_status,
          notified_via
        )
      `)
      .eq('organizer_id', user.id)
      .order('scheduled_time', { ascending: true });

    const { data: participatingMeetings, error: error2 } = await supabase
      .from('meeting_participants')
      .select(`
        meeting_id,
        rsvp_status,
        notified_via,
        scheduled_meetings (
          *
        )
      `)
      .eq('user_id', user.id);

    if (error1 || error2) {
      throw error1 || error2;
    }

    // Get all unique user IDs for profiles
    const userIds = new Set<string>();
    userIds.add(user.id);

    organizedMeetings?.forEach(m => {
      m.meeting_participants?.forEach((p: any) => userIds.add(p.user_id));
    });

    participatingMeetings?.forEach(p => {
      const meeting = p.scheduled_meetings as any;
      if (meeting) userIds.add(meeting.organizer_id);
    });

    // Get profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name')
      .in('user_id', Array.from(userIds));

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    // Format meetings
    const organized = organizedMeetings?.map(m => ({
      ...m,
      role: 'organizer',
      participants: m.meeting_participants?.map((p: any) => ({
        ...p,
        profile: profileMap.get(p.user_id)
      }))
    })) || [];

    const participating = participatingMeetings
      ?.filter(p => p.scheduled_meetings)
      .map(p => {
        const meeting = p.scheduled_meetings as any;
        return {
          ...meeting,
          role: 'participant',
          myRsvp: p.rsvp_status,
          organizer: profileMap.get(meeting.organizer_id)
        };
      }) || [];

    // Combine and sort by scheduled time
    const allMeetings = [...organized, ...participating].sort((a, b) => {
      return new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime();
    });

    // Separate into upcoming and past
    const now = new Date();
    const upcoming = allMeetings.filter(m => new Date(m.scheduled_time) >= now);
    const past = allMeetings.filter(m => new Date(m.scheduled_time) < now);

    return NextResponse.json({
      success: true,
      upcoming,
      past,
      total: allMeetings.length
    });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      scheduledTime,
      durationMinutes = 30,
      meetingLink,
      participantIds,
      podId,
      provider = 'custom' as MeetingProvider, // 'zoom', 'google', or 'custom'
    } = body;

    if (!title || !scheduledTime || !participantIds || participantIds.length === 0) {
      return NextResponse.json(
        { error: "title, scheduledTime, and participantIds are required" },
        { status: 400 }
      );
    }

    // Check scheduling permissions for each participant
    // This ensures only nudge receivers (not senders) can schedule meetings
    const permissionIds: string[] = [];
    for (const participantId of participantIds) {
      const { data: permission, error: permError } = await supabase
        .from('scheduling_permissions')
        .select('id, used, expires_at')
        .eq('authorized_user_id', user.id) // Current user must be authorized
        .eq('with_user_id', participantId) // To schedule with this participant
        .eq('used', false) // Not already used
        .gte('expires_at', new Date().toISOString()) // Not expired
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!permission) {
        // Check if user was the nudge SENDER (not receiver) - they shouldn't be able to schedule
        const { data: reversePermission } = await supabase
          .from('scheduling_permissions')
          .select('id')
          .eq('authorized_user_id', participantId) // Other person was authorized
          .eq('with_user_id', user.id) // To schedule with current user
          .eq('used', false)
          .gte('expires_at', new Date().toISOString())
          .limit(1)
          .maybeSingle();

        if (reversePermission) {
          // User was the nudge sender - they need to wait for the recipient to schedule
          return NextResponse.json(
            { error: "Waiting for the other person to schedule. Only the nudge recipient can create the meeting." },
            { status: 403 }
          );
        }

        // No permission exists at all - this is allowed (direct meeting creation without nudge)
        // This maintains backward compatibility for meetings without nudge context
      } else {
        permissionIds.push(permission.id);
      }
    }

    // Create meeting via provider if specified
    let finalMeetingLink = meetingLink;
    let providerMeetingId: string | null = null;
    let providerHostUrl: string | null = null;
    let actualProvider: MeetingProvider = provider;

    if (provider === 'zoom') {
      const zoomMeeting = await createZoomMeeting(user.id, {
        title,
        description,
        startTime: new Date(scheduledTime),
        durationMinutes,
      });

      if (zoomMeeting) {
        finalMeetingLink = zoomMeeting.meetingLink;
        providerMeetingId = zoomMeeting.providerMeetingId;
        providerHostUrl = zoomMeeting.hostUrl || null;
      } else {
        // Zoom creation failed - fall back to custom or return error
        if (!meetingLink) {
          return NextResponse.json(
            { error: "Failed to create Zoom meeting. Please connect Zoom in Settings or provide a custom link." },
            { status: 400 }
          );
        }
        actualProvider = 'custom';
      }
    }

    // Create the meeting
    const { data: meeting, error: meetingError } = await supabase
      .from('scheduled_meetings')
      .insert({
        organizer_id: user.id,
        pod_id: podId || null,
        title,
        description: description || null,
        scheduled_time: scheduledTime,
        duration_minutes: durationMinutes,
        meeting_link: finalMeetingLink || null,
        meeting_provider: actualProvider,
        provider_meeting_id: providerMeetingId,
        provider_host_url: providerHostUrl,
        status: 'scheduled'
      })
      .select()
      .single();

    if (meetingError) {
      throw meetingError;
    }

    // Mark scheduling permissions as used
    if (permissionIds.length > 0) {
      await supabase
        .from('scheduling_permissions')
        .update({ used: true })
        .in('id', permissionIds);
    }

    // Get organizer profile
    const { data: organizerProfile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', user.id)
      .single();

    const organizerName = organizerProfile
      ? `${organizerProfile.first_name || ''} ${organizerProfile.last_name || ''}`.trim() || 'A teammate'
      : 'A teammate';

    // Get pod name if applicable
    let podName: string | undefined;
    if (podId) {
      const { data: pod } = await supabase
        .from('pods')
        .select('pod_name')
        .eq('id', podId)
        .single();
      podName = pod?.pod_name;
    }

    // Get participant profiles (including Slack OAuth fields)
    const { data: participantProfiles } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name, email, slack_handle, slack_user_id, slack_access_token, slack_connected, email_notifications')
      .in('user_id', participantIds);

    // Create meeting participants and send notifications
    const participantRecords = [];
    const notificationResults = [];

    for (const pid of participantIds) {
      const profile = participantProfiles?.find(p => p.user_id === pid);

      // Notify participant (decrypt token for Slack API calls)
      const notifiedVia = await notifyParticipant(
        {
          userId: pid,
          email: profile?.email,
          slackHandle: profile?.slack_handle,
          slackUserId: profile?.slack_user_id,
          slackAccessToken: decryptToken(profile?.slack_access_token) ?? undefined,
          slackConnected: profile?.slack_connected,
          firstName: profile?.first_name,
          lastName: profile?.last_name,
          emailNotifications: profile?.email_notifications
        },
        {
          meetingId: meeting.id,
          title,
          description,
          scheduledTime: new Date(scheduledTime),
          durationMinutes,
          meetingLink: finalMeetingLink,
          organizerName,
          podName
        }
      );

      participantRecords.push({
        meeting_id: meeting.id,
        user_id: pid,
        rsvp_status: 'pending',
        notified_via: notifiedVia
      });

      notificationResults.push({
        userId: pid,
        notifiedVia
      });
    }

    // Insert participants
    const { error: participantsError } = await supabase
      .from('meeting_participants')
      .insert(participantRecords);

    if (participantsError) {
      console.error("Error creating participants:", participantsError);
    }

    // Create in-app notifications
    const notifications = participantIds.map((pid: string) => ({
      recipient_id: pid,
      sender_id: user.id,
      type: 'meeting_invite',
      content: `${organizerName} invited you to a meeting: ${title}`,
      metadata: {
        meeting_id: meeting.id,
        scheduled_time: scheduledTime,
        duration_minutes: durationMinutes
      },
      read: false
    }));

    await supabase.from('notifications').insert(notifications);

    return NextResponse.json({
      success: true,
      meeting,
      notifications: notificationResults
    });
  } catch (error) {
    console.error("Error creating meeting:", error);
    return NextResponse.json(
      { error: "Failed to create meeting" },
      { status: 500 }
    );
  }
}
