-- Migration: 0006_scheduling_availability
-- Description: Add granular availability schedules, scheduled meetings, and meeting participants

-- Add new columns to profiles table
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "timezone" text DEFAULT 'America/New_York';
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "email" text;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "email_notifications" boolean DEFAULT true;

-- Remove the looking_to_help column (Open to Help feature removal)
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "looking_to_help";

-- Create availability_schedules table for granular time slot management
CREATE TABLE IF NOT EXISTS "availability_schedules" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "day_of_week" integer NOT NULL,
  "start_time" time NOT NULL,
  "end_time" time NOT NULL,
  "label" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create index for faster lookups by user
CREATE INDEX IF NOT EXISTS "idx_availability_schedules_user_id" ON "availability_schedules" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_availability_schedules_day" ON "availability_schedules" ("user_id", "day_of_week");

-- Create scheduled_meetings table
CREATE TABLE IF NOT EXISTS "scheduled_meetings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organizer_id" uuid NOT NULL,
  "pod_id" uuid REFERENCES "pods"("id") ON DELETE SET NULL,
  "title" text NOT NULL,
  "description" text,
  "scheduled_time" timestamptz NOT NULL,
  "duration_minutes" integer DEFAULT 30 NOT NULL,
  "meeting_link" text,
  "status" text DEFAULT 'scheduled' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for meetings
CREATE INDEX IF NOT EXISTS "idx_scheduled_meetings_organizer" ON "scheduled_meetings" ("organizer_id");
CREATE INDEX IF NOT EXISTS "idx_scheduled_meetings_time" ON "scheduled_meetings" ("scheduled_time");
CREATE INDEX IF NOT EXISTS "idx_scheduled_meetings_status" ON "scheduled_meetings" ("status");

-- Create meeting_participants table
CREATE TABLE IF NOT EXISTS "meeting_participants" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "meeting_id" uuid NOT NULL REFERENCES "scheduled_meetings"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL,
  "rsvp_status" text DEFAULT 'pending' NOT NULL,
  "notified_via" text[] DEFAULT '{}',
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for meeting participants
CREATE INDEX IF NOT EXISTS "idx_meeting_participants_meeting" ON "meeting_participants" ("meeting_id");
CREATE INDEX IF NOT EXISTS "idx_meeting_participants_user" ON "meeting_participants" ("user_id");

-- Enable Row Level Security on new tables
ALTER TABLE "availability_schedules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "scheduled_meetings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "meeting_participants" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for availability_schedules
CREATE POLICY "Users can view all availability schedules" ON "availability_schedules"
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own availability" ON "availability_schedules"
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for scheduled_meetings
CREATE POLICY "Users can view meetings they organize or participate in" ON "scheduled_meetings"
  FOR SELECT USING (
    organizer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM meeting_participants
      WHERE meeting_participants.meeting_id = scheduled_meetings.id
      AND meeting_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create meetings" ON "scheduled_meetings"
  FOR INSERT WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "Organizers can update own meetings" ON "scheduled_meetings"
  FOR UPDATE USING (organizer_id = auth.uid());

CREATE POLICY "Organizers can delete own meetings" ON "scheduled_meetings"
  FOR DELETE USING (organizer_id = auth.uid());

-- RLS Policies for meeting_participants
CREATE POLICY "Users can view participants of meetings they're in" ON "meeting_participants"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM scheduled_meetings
      WHERE scheduled_meetings.id = meeting_participants.meeting_id
      AND (
        scheduled_meetings.organizer_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM meeting_participants mp2
          WHERE mp2.meeting_id = meeting_participants.meeting_id
          AND mp2.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Organizers can manage participants" ON "meeting_participants"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM scheduled_meetings
      WHERE scheduled_meetings.id = meeting_participants.meeting_id
      AND scheduled_meetings.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Participants can update own RSVP" ON "meeting_participants"
  FOR UPDATE USING (user_id = auth.uid());
