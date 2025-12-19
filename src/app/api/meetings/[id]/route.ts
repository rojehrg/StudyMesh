import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get meeting with participants
    const { data: meeting, error } = await supabase
      .from('scheduled_meetings')
      .select(`
        *,
        meeting_participants (
          user_id,
          rsvp_status,
          notified_via,
          created_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Check if user is organizer or participant
    const isOrganizer = meeting.organizer_id === user.id;
    const isParticipant = meeting.meeting_participants?.some(
      (p: any) => p.user_id === user.id
    );

    if (!isOrganizer && !isParticipant) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get profiles for all participants and organizer
    const userIds = [
      meeting.organizer_id,
      ...(meeting.meeting_participants?.map((p: any) => p.user_id) || [])
    ];

    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name, department')
      .in('user_id', userIds);

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    // Get pod name if applicable
    let podName: string | undefined;
    if (meeting.pod_id) {
      const { data: pod } = await supabase
        .from('pods')
        .select('pod_name')
        .eq('id', meeting.pod_id)
        .single();
      podName = pod?.pod_name;
    }

    return NextResponse.json({
      success: true,
      meeting: {
        ...meeting,
        organizer: profileMap.get(meeting.organizer_id),
        podName,
        participants: meeting.meeting_participants?.map((p: any) => ({
          ...p,
          profile: profileMap.get(p.user_id)
        })),
        isOrganizer,
        isParticipant
      }
    });
  } catch (error) {
    console.error("Error fetching meeting:", error);
    return NextResponse.json(
      { error: "Failed to fetch meeting" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status, title, description, scheduledTime, durationMinutes, meetingLink } = body;

    // Check if user is organizer
    const { data: meeting } = await supabase
      .from('scheduled_meetings')
      .select('organizer_id')
      .eq('id', id)
      .single();

    if (!meeting || meeting.organizer_id !== user.id) {
      return NextResponse.json({ error: "Only organizer can update meeting" }, { status: 403 });
    }

    const updates: any = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (scheduledTime) updates.scheduled_time = scheduledTime;
    if (durationMinutes) updates.duration_minutes = durationMinutes;
    if (meetingLink !== undefined) updates.meeting_link = meetingLink;

    const { data: updated, error } = await supabase
      .from('scheduled_meetings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      meeting: updated
    });
  } catch (error) {
    console.error("Error updating meeting:", error);
    return NextResponse.json(
      { error: "Failed to update meeting" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is organizer
    const { data: meeting } = await supabase
      .from('scheduled_meetings')
      .select('organizer_id')
      .eq('id', id)
      .single();

    if (!meeting || meeting.organizer_id !== user.id) {
      return NextResponse.json({ error: "Only organizer can delete meeting" }, { status: 403 });
    }

    const { error } = await supabase
      .from('scheduled_meetings')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting meeting:", error);
    return NextResponse.json(
      { error: "Failed to delete meeting" },
      { status: 500 }
    );
  }
}
