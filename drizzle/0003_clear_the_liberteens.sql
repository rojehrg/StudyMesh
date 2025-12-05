CREATE TABLE "open_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"skill" text NOT NULL,
	"status" text DEFAULT 'open',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "expertise_levels" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "growth_levels" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "slack_handle" text;