CREATE TABLE "open_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"skill" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "open_requests_user_id_idx" ON "open_requests" ("user_id");
--> statement-breakpoint
CREATE INDEX "open_requests_status_idx" ON "open_requests" ("status");
