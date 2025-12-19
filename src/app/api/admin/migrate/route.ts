import { NextResponse } from "next/server";
import { client } from "@/lib/db";

export async function POST() {
  try {
    // Add new columns to profiles table
    await client`ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "timezone" text DEFAULT 'America/New_York'`;
    await client`ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "email" text`;
    await client`ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "email_notifications" boolean DEFAULT true`;

    // Add Slack OAuth columns
    await client`ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "slack_user_id" text`;
    await client`ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "slack_access_token" text`;
    await client`ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "slack_team_id" text`;
    await client`ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "slack_connected" boolean DEFAULT false`;

    // Remove looking_to_help column
    await client`ALTER TABLE "profiles" DROP COLUMN IF EXISTS "looking_to_help"`;

    // Create availability_schedules table
    await client`
      CREATE TABLE IF NOT EXISTS "availability_schedules" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid NOT NULL,
        "day_of_week" integer NOT NULL,
        "start_time" time NOT NULL,
        "end_time" time NOT NULL,
        "label" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )
    `;

    // Create indexes for availability_schedules
    await client`CREATE INDEX IF NOT EXISTS "idx_availability_schedules_user_id" ON "availability_schedules" ("user_id")`;
    await client`CREATE INDEX IF NOT EXISTS "idx_availability_schedules_day" ON "availability_schedules" ("user_id", "day_of_week")`;

    // Create scheduled_meetings table
    await client`
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
      )
    `;

    // Create indexes for scheduled_meetings
    await client`CREATE INDEX IF NOT EXISTS "idx_scheduled_meetings_organizer" ON "scheduled_meetings" ("organizer_id")`;
    await client`CREATE INDEX IF NOT EXISTS "idx_scheduled_meetings_time" ON "scheduled_meetings" ("scheduled_time")`;
    await client`CREATE INDEX IF NOT EXISTS "idx_scheduled_meetings_status" ON "scheduled_meetings" ("status")`;

    // Create meeting_participants table
    await client`
      CREATE TABLE IF NOT EXISTS "meeting_participants" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "meeting_id" uuid NOT NULL REFERENCES "scheduled_meetings"("id") ON DELETE CASCADE,
        "user_id" uuid NOT NULL,
        "rsvp_status" text DEFAULT 'pending' NOT NULL,
        "notified_via" text[] DEFAULT '{}',
        "created_at" timestamp DEFAULT now() NOT NULL
      )
    `;

    // Create indexes for meeting_participants
    await client`CREATE INDEX IF NOT EXISTS "idx_meeting_participants_meeting" ON "meeting_participants" ("meeting_id")`;
    await client`CREATE INDEX IF NOT EXISTS "idx_meeting_participants_user" ON "meeting_participants" ("user_id")`;

    return NextResponse.json({
      success: true,
      message: "Migration completed successfully",
      tables: ["availability_schedules", "scheduled_meetings", "meeting_participants"],
      profileUpdates: ["timezone", "email", "email_notifications", "slack_user_id", "slack_access_token", "slack_team_id", "slack_connected", "removed looking_to_help"]
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
