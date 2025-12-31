-- Create organizations table (represents Slack workspaces)
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slack_team_id" text NOT NULL,
	"name" text NOT NULL,
	"slack_team_name" text,
	"slack_team_icon" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slack_team_id_unique" UNIQUE("slack_team_id")
);

--> statement-breakpoint
-- Add organization_id to profiles
ALTER TABLE "profiles" ADD COLUMN "organization_id" uuid;
ALTER TABLE "profiles" ADD COLUMN "slack_user_id" text;
ALTER TABLE "profiles" ADD COLUMN "slack_access_token" text;
ALTER TABLE "profiles" ADD COLUMN "slack_team_id" text;
ALTER TABLE "profiles" ADD COLUMN "slack_connected" boolean DEFAULT false;
ALTER TABLE "profiles" ADD COLUMN "slack_handle" text;
ALTER TABLE "profiles" ADD COLUMN "first_name" text;
ALTER TABLE "profiles" ADD COLUMN "last_name" text;
ALTER TABLE "profiles" ADD COLUMN "email" text;
ALTER TABLE "profiles" ADD COLUMN "avatar_url" text;
ALTER TABLE "profiles" ADD COLUMN "timezone" text DEFAULT 'America/New_York';

--> statement-breakpoint
-- Add organization_id to pods
ALTER TABLE "pods" ADD COLUMN "organization_id" uuid;

--> statement-breakpoint
-- Add foreign key constraints
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pods" ADD CONSTRAINT "pods_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
-- Create index for faster lookups
CREATE INDEX "profiles_organization_id_idx" ON "profiles" ("organization_id");
CREATE INDEX "profiles_slack_user_id_idx" ON "profiles" ("slack_user_id");
CREATE INDEX "pods_organization_id_idx" ON "pods" ("organization_id");
