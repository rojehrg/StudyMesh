import { NextResponse } from "next/server";
import { client } from "@/lib/db";

export async function POST() {
  try {
    // Create organizations table
    await client`
      CREATE TABLE IF NOT EXISTS "organizations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name" text NOT NULL,
        "invite_code" text UNIQUE,
        "owner_id" uuid,
        "slack_team_id" text UNIQUE,
        "slack_team_name" text,
        "slack_team_icon" text,
        "slack_bot_token" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )
    `;

    // Add invite_code and owner_id if table already exists
    await client`ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "invite_code" text UNIQUE`;
    await client`ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "owner_id" uuid`;
    await client`ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "slack_bot_token" text`;
    await client`ALTER TABLE "organizations" ALTER COLUMN "slack_team_id" DROP NOT NULL`;
    await client`CREATE INDEX IF NOT EXISTS "organizations_invite_code_idx" ON "organizations" ("invite_code")`;

    // Add organization columns to profiles
    await client`ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "organization_id" uuid REFERENCES "organizations"("id") ON DELETE CASCADE`;
    await client`ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "first_name" text`;
    await client`ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "last_name" text`;
    await client`ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "avatar_url" text`;
    await client`ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "slack_handle" text`;

    // Add organization_id to pods
    await client`ALTER TABLE "pods" ADD COLUMN IF NOT EXISTS "organization_id" uuid REFERENCES "organizations"("id") ON DELETE CASCADE`;

    // Create indexes for organization lookups
    await client`CREATE INDEX IF NOT EXISTS "profiles_organization_id_idx" ON "profiles" ("organization_id")`;
    await client`CREATE INDEX IF NOT EXISTS "profiles_slack_user_id_idx" ON "profiles" ("slack_user_id")`;
    await client`CREATE INDEX IF NOT EXISTS "pods_organization_id_idx" ON "pods" ("organization_id")`;

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
      tables: ["organizations", "availability_schedules", "scheduled_meetings", "meeting_participants"],
      profileUpdates: ["organization_id", "first_name", "last_name", "avatar_url", "slack_handle", "timezone", "email", "email_notifications", "slack_user_id", "slack_access_token", "slack_team_id", "slack_connected"],
      podUpdates: ["organization_id"]
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
