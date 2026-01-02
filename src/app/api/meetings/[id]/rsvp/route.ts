import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmailMeetingRsvpNotification } from "@/lib/notifications";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: meetingId } = await params;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body; // 'accepted' | 'declined'

    if (!['accepted', 'declined', 'pending'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid RSVP status. Must be 'accepted', 'declined', or 'pending'" },
        { status: 400 }
      );
    }

    // Update participant's RSVP status
    const { data: updated, error } = await supabase
      .from('meeting_participants')
      .update({ rsvp_status: status })
      .eq('meeting_id', meetingId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      // Check if participant exists
      const { data: existing } = await supabase
        .from('meeting_participants')
        .select('id')
        .eq('meeting_id', meetingId)
        .eq('user_id', user.id)
        .single();

      if (!existing) {
        return NextResponse.json(
          { error: "You are not a participant of this meeting" },
          { status: 403 }
        );
      }
      throw error;
    }

    // Get meeting details for notification
    const { data: meeting } = await supabase
      .from('scheduled_meetings')
      .select('title, organizer_id, scheduled_time, meeting_link')
      .eq('id', meetingId)
      .single();

    // Get user profile for notification
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', user.id)
      .single();

    const userName = profile
      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'A participant'
      : 'A participant';

    // Notify organizer of RSVP
    if (meeting && meeting.organizer_id !== user.id) {
      // In-app notification
      await supabase.from('notifications').insert({
        recipient_id: meeting.organizer_id,
        sender_id: user.id,
        type: 'meeting_rsvp',
        content: `${userName} ${status} your meeting invite: ${meeting.title}`,
        metadata: {
          meeting_id: meetingId,
          rsvp_status: status
        },
        read: false
      });

      // Email notification
      const { data: organizerProfile } = await supabase
        .from('profiles')
        .select('email, first_name, email_notifications')
        .eq('user_id', meeting.organizer_id)
        .single();

      if (organizerProfile?.email && organizerProfile.email_notifications !== false) {
        await sendEmailMeetingRsvpNotification({
          organizerEmail: organizerProfile.email,
          organizerName: organizerProfile.first_name || undefined,
          responderName: userName,
          meetingTitle: meeting.title,
          scheduledTime: new Date(meeting.scheduled_time),
          status: status as 'accepted' | 'declined',
          meetingLink: meeting.meeting_link || undefined
        });
      }
    }

    return NextResponse.json({
      success: true,
      rsvp: updated
    });
  } catch (error) {
    console.error("Error updating RSVP:", error);
    return NextResponse.json(
      { error: "Failed to update RSVP" },
      { status: 500 }
    );
  }
}
