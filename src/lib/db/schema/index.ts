import { pgTable, text, timestamp, boolean, uuid, jsonb, integer, time } from "drizzle-orm/pg-core";

/**
 * ATTUNLY DATABASE SCHEMA
 *
 * Availability-First Coordination Platform
 *
 * Core concepts:
 * - Knowledge areas (not skills) - lightweight "I know X" tags
 * - Availability grid with timezone awareness
 * - Manager-controlled pods
 * - Contextual nudges with meeting suggestions
 */

// Organizations - team workspaces
export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  inviteCode: text("invite_code").notNull().unique(),
  ownerId: uuid("owner_id").notNull(), // References the user who created the org

  // Slack workspace integration
  slackTeamId: text("slack_team_id"),
  slackTeamName: text("slack_team_name"),
  slackAccessToken: text("slack_access_token"), // Bot token for the workspace
  slackWebhookUrl: text("slack_webhook_url"), // Optional: legacy webhook URL

  // Stripe billing integration
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status").default("inactive"), // inactive, active, past_due, canceled
  subscriptionPlan: text("subscription_plan").default("free"), // free, starter, pro, enterprise
  subscriptionSeats: integer("subscription_seats").default(1),
  subscriptionPeriodEnd: timestamp("subscription_period_end", { withTimezone: true }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique(), // References Supabase Auth User ID
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "set null" }),

  // Basic info
  firstName: text("first_name"),
  lastName: text("last_name"),
  department: text("department"),
  major: text("major"), // Job title
  bio: text("bio"),

  // Knowledge areas - lightweight tags (NOT skills with proficiency)
  // Examples: "Rippling tax recon", "SQL debugging", "Salesforce setup"
  knowledgeAreas: text("knowledge_areas").array(),

  // Legacy: kept for backward compatibility during migration
  expertiseSkills: text("expertise_skills").array(),

  // Availability
  timezone: text("timezone").default("America/New_York"),
  availability: jsonb("availability").default({}), // Legacy JSONB format
  currentlyAvailable: boolean("currently_available").default(false), // Live status indicator

  // Collaboration preferences
  preferredGroupSize: integer("preferred_group_size").default(3),
  lookingToHelp: boolean("looking_to_help").default(true),

  // Slack integration
  slackHandle: text("slack_handle"),
  slackUserId: text("slack_user_id"),
  slackAccessToken: text("slack_access_token"),
  slackTeamId: text("slack_team_id"),
  slackConnected: boolean("slack_connected").default(false),

  // Email notifications
  email: text("email"),
  emailNotifications: boolean("email_notifications").default(true),

  // Onboarding
  onboardingCompleted: boolean("onboarding_completed").default(false),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Granular availability schedules - enhanced time slot management
export const availabilitySchedules = pgTable("availability_schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  startTime: time("start_time").notNull(), // e.g., "09:00"
  endTime: time("end_time").notNull(), // e.g., "17:00"
  label: text("label"), // Optional: "Deep work", "Meetings", etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Pods - team containers with manager controls
export const pods = pgTable("pods", {
  id: uuid("id").primaryKey().defaultRandom(),
  podCode: text("pod_code").notNull().unique(),
  podName: text("pod_name").notNull(),
  businessUnit: text("business_unit"),
  initiativeOwner: text("initiative_owner"),
  term: text("term"),

  // Manager controls
  createdBy: uuid("created_by").notNull(),
  managerId: uuid("manager_id"), // User who controls the pod (defaults to creator)
  allowCrossPodHelp: boolean("allow_cross_pod_help").default(false), // Opt-in for cross-pod requests

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Pod members - who belongs to which pod
export const podMembers = pgTable("pod_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  podId: uuid("pod_id").references(() => pods.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Scheduled meetings between users
export const scheduledMeetings = pgTable("scheduled_meetings", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizerId: uuid("organizer_id").notNull(),
  podId: uuid("pod_id").references(() => pods.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description"),
  scheduledTime: timestamp("scheduled_time", { withTimezone: true }).notNull(),
  durationMinutes: integer("duration_minutes").default(30).notNull(),
  meetingLink: text("meeting_link"), // Zoom, Google Meet, or custom link
  status: text("status").default("scheduled").notNull(), // scheduled, completed, cancelled

  // Meeting provider integration
  meetingProvider: text("meeting_provider").default("custom"), // 'zoom', 'google', 'custom'
  providerMeetingId: text("provider_meeting_id"), // ID from Zoom/Google
  providerHostUrl: text("provider_host_url"), // Host-specific join URL (for Zoom host controls)

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Meeting participants with RSVP tracking
export const meetingParticipants = pgTable("meeting_participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  meetingId: uuid("meeting_id").references(() => scheduledMeetings.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").notNull(),
  rsvpStatus: text("rsvp_status").default("pending").notNull(), // pending, accepted, declined
  notifiedVia: text("notified_via").array().default([]), // ['slack', 'email', 'in_app']
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notifications - enhanced with meeting context
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  recipientId: uuid("recipient_id").notNull(),
  senderId: uuid("sender_id").notNull(),
  type: text("type").notNull(), // 'nudge', 'new_match', 'system'
  content: text("content").notNull(),
  metadata: jsonb("metadata").default({}),
  // Enhanced metadata structure:
  // {
  //   topic?: string,           // What is this about?
  //   meetingLength?: string,   // "15min", "30min", "1hr", "async"
  //   suggestedTimes?: string[], // Based on availability overlap
  //   podId?: string,
  //   podCode?: string,
  //   nudgeType?: string        // 'ask' or 'offer'
  // }
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Scheduling permissions - controls who can create meetings after nudge acceptance
// Only the nudge RECEIVER gets permission to schedule with the SENDER
export const schedulingPermissions = pgTable("scheduling_permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  nudgeId: uuid("nudge_id").references(() => notifications.id, { onDelete: "cascade" }),
  authorizedUserId: uuid("authorized_user_id").notNull(), // Nudge RECEIVER - can schedule
  withUserId: uuid("with_user_id").notNull(), // Nudge SENDER - other party
  podId: uuid("pod_id").references(() => pods.id, { onDelete: "set null" }),
  used: boolean("used").default(false).notNull(), // Marked true after meeting created
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(), // 7 day expiry
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User provider credentials - OAuth tokens for Zoom/Google Meet
export const userProviderCredentials = pgTable("user_provider_credentials", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  provider: text("provider").notNull(), // 'zoom', 'google'
  accessToken: text("access_token"), // Encrypted
  refreshToken: text("refresh_token"), // Encrypted
  tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
  providerUserId: text("provider_user_id"), // User's ID in the provider system
  providerEmail: text("provider_email"), // User's email in the provider
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Billing events - audit log for subscription changes
export const billingEvents = pgTable("billing_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  stripeEventId: text("stripe_event_id").unique(), // Stripe event ID for deduplication
  eventType: text("event_type").notNull(), // checkout.session.completed, invoice.paid, customer.subscription.updated, etc.
  eventData: jsonb("event_data").default({}), // Full Stripe event data
  processedAt: timestamp("processed_at", { withTimezone: true }).defaultNow().notNull(),
});

// Type exports for TypeScript
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Pod = typeof pods.$inferSelect;
export type NewPod = typeof pods.$inferInsert;
export type PodMember = typeof podMembers.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type AvailabilitySchedule = typeof availabilitySchedules.$inferSelect;
export type ScheduledMeeting = typeof scheduledMeetings.$inferSelect;
export type MeetingParticipant = typeof meetingParticipants.$inferSelect;
export type SchedulingPermission = typeof schedulingPermissions.$inferSelect;
export type UserProviderCredential = typeof userProviderCredentials.$inferSelect;
export type BillingEvent = typeof billingEvents.$inferSelect;
