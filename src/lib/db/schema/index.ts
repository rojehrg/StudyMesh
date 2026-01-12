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

// Organization member roles for RBAC
export const OrganizationRole = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

export type OrganizationRoleType = typeof OrganizationRole[keyof typeof OrganizationRole];

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

  // Theme customization (Pro+ feature)
  themeSettings: jsonb("theme_settings").default({}),
  // Structure: { preset: 'violet', primary: '262 60% 50%', ... }

  // Trial system - 14-day free trial without credit card
  trialPlan: text("trial_plan"), // 'starter' or 'pro' - the plan they're trialing
  trialStartedAt: timestamp("trial_started_at", { withTimezone: true }),
  trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Organization members - tracks membership and roles
export const organizationMembers = pgTable("organization_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").notNull().unique(), // One org per user
  role: text("role").default("member").notNull(), // 'owner', 'admin', 'member'
  invitedBy: uuid("invited_by"), // Who invited this user (null for owner)
  invitedAt: timestamp("invited_at", { withTimezone: true }),
  joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
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
  avatarUrl: text("avatar_url"), // Profile picture URL from Supabase Storage

  // Knowledge areas - lightweight tags (NOT skills with proficiency)
  // Examples: "Rippling tax recon", "SQL debugging", "Salesforce setup"
  knowledgeAreas: text("knowledge_areas").array(),

  // Legacy: kept for backward compatibility during migration
  expertiseSkills: text("expertise_skills").array(),

  // AI-powered expertise matching (free-text + embeddings)
  // User describes what they can help with in natural language
  expertiseText: text("expertise_text"),
  // Note: expertise_embedding vector(384) column exists in DB but not in Drizzle
  // (Drizzle doesn't have native vector type - handled via raw SQL)

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

// Slash command events - tracking for send rate measurement
// North star metric: send_rate = sent / modal_opened
export const commandEvents = pgTable("command_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  slackUserId: text("slack_user_id").notNull(),
  slackTeamId: text("slack_team_id").notNull(),
  eventType: text("event_type").notNull(), // 'invoked', 'modal_opened', 'sent', 'abandoned'
  context: text("context"), // What they typed after /attunly (for debugging, not analytics)
  recipientSlackId: text("recipient_slack_id"), // Who they sent to (only for 'sent' events)
  metadata: jsonb("metadata").default({}), // Additional context
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================
// AUDIT LOGGING SYSTEM
// Tracks all admin/sensitive actions for compliance
// ============================================

// Audit action types
export const AuditAction = {
  // Authentication
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_PASSWORD_CHANGE: 'user.password_change',

  // Team management
  MEMBER_INVITED: 'member.invited',
  MEMBER_JOINED: 'member.joined',
  MEMBER_REMOVED: 'member.removed',
  MEMBER_ROLE_CHANGED: 'member.role_changed',

  // Organization
  ORG_SETTINGS_UPDATED: 'org.settings_updated',
  ORG_NAME_CHANGED: 'org.name_changed',

  // Integrations
  SLACK_CONNECTED: 'integration.slack_connected',
  SLACK_DISCONNECTED: 'integration.slack_disconnected',
  CALENDAR_CONNECTED: 'integration.calendar_connected',
  CALENDAR_DISCONNECTED: 'integration.calendar_disconnected',
  ZOOM_CONNECTED: 'integration.zoom_connected',
  ZOOM_DISCONNECTED: 'integration.zoom_disconnected',

  // Billing
  SUBSCRIPTION_CREATED: 'billing.subscription_created',
  SUBSCRIPTION_UPDATED: 'billing.subscription_updated',
  SUBSCRIPTION_CANCELLED: 'billing.subscription_cancelled',
  TRIAL_STARTED: 'billing.trial_started',

  // Data
  DATA_EXPORTED: 'data.exported',
  ACCOUNT_DELETED: 'account.deleted',

  // SSO (for future)
  SSO_CONFIGURED: 'sso.configured',
  SSO_ENABLED: 'sso.enabled',
  SSO_DISABLED: 'sso.disabled',
} as const;

export type AuditActionType = typeof AuditAction[keyof typeof AuditAction];

// Audit logs table - tracks all sensitive actions
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  actorId: uuid("actor_id"), // User who performed the action (null for system actions)
  action: text("action").notNull(), // Action type from AuditAction
  resourceType: text("resource_type"), // 'user', 'organization', 'integration', 'billing'
  resourceId: text("resource_id"), // ID of the affected resource
  description: text("description"), // Human-readable description
  metadata: jsonb("metadata").default({}), // Additional context (old/new values, etc.)
  ipAddress: text("ip_address"), // Client IP address
  userAgent: text("user_agent"), // Browser/client info
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================
// LINGO TRANSLATION SYSTEM
// Cross-team communication translation
// ============================================

// Department lingo profiles - stores terminology and communication patterns per department
export const departmentLingoProfiles = pgTable("department_lingo_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  department: text("department").notNull(),
  // Terms array: [{"term": "MRR", "meaning": "Monthly Recurring Revenue", "context": "sales metric"}]
  terms: jsonb("terms").default([]),
  // Communication style description: "Direct, metric-focused, uses acronyms"
  communicationStyle: text("communication_style"),
  // Common phrases used by the department
  commonPhrases: jsonb("common_phrases").default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Term translations - maps terms between departments (learning loop)
export const termTranslations = pgTable("term_translations", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  sourceDepartment: text("source_department").notNull(),
  targetDepartment: text("target_department").notNull(),
  sourceTerm: text("source_term").notNull(),
  targetTerm: text("target_term").notNull(),
  confidence: integer("confidence").default(50), // 0-100 scale
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Translation events - tracks translation usage for learning and analytics
export const translationEvents = pgTable("translation_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "set null" }),
  sourceDepartment: text("source_department").notNull(),
  targetDepartment: text("target_department").notNull(),
  originalText: text("original_text").notNull(),
  translatedText: text("translated_text").notNull(),
  wasHelpful: boolean("was_helpful"), // null = no feedback, true/false = user feedback
  feedback: text("feedback"), // Optional text feedback
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================
// MOMENTUM LOCKS
// Timezone-aware work handoff system
// Prevents work from stalling across sleep cycles
// ============================================

// Lock status enum values
export const MomentumLockStatus = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  STARTED: 'started',
  BLOCKED: 'blocked',
  DONE: 'done',
  CANCELED: 'canceled',
  EXPIRED: 'expired',
} as const;

export type MomentumLockStatusType = typeof MomentumLockStatus[keyof typeof MomentumLockStatus];

// Lock event types
export const MomentumLockEventType = {
  CREATED: 'created',
  CONFIRMED: 'confirmed',
  DELIVERED: 'delivered',
  STARTED: 'started',
  BLOCKED: 'blocked',
  DONE: 'done',
  ESCALATED: 'escalated',
  REASSIGNED: 'reassigned',
  EXPIRED: 'expired',
  CANCELED: 'canceled',
} as const;

export type MomentumLockEventTypeValue = typeof MomentumLockEventType[keyof typeof MomentumLockEventType];

// Momentum Locks - lightweight contracts for timezone-aware handoffs
export const momentumLocks = pgTable("momentum_locks", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: text("workspace_id").notNull(),              // Slack team ID
  channelId: text("channel_id").notNull(),
  threadTs: text("thread_ts").notNull(),
  createdByUserId: text("created_by_user_id").notNull(),    // Slack user who created the lock
  requesterUserId: text("requester_user_id").notNull(),     // Who needs the outcome
  ownerUserId: text("owner_user_id").notNull(),             // Who must deliver
  fallbackUserId: text("fallback_user_id"),                 // Backup person (optional)
  requiredOutcome: text("required_outcome").notNull(),      // One sentence describing what's needed
  acceptableFallback: text("acceptable_fallback"),          // Fallback outcome if blocked
  impactStatement: text("impact_statement"),                // Why it matters
  deadlineAt: timestamp("deadline_at", { withTimezone: true }).notNull(),
  ownerTimezone: text("owner_timezone"),
  requesterTimezone: text("requester_timezone"),
  status: text("status").notNull().default("draft"),        // draft, active, started, blocked, done, canceled, expired
  escalationSentAt: timestamp("escalation_sent_at", { withTimezone: true }),
  wakeUpDeliveredAt: timestamp("wake_up_delivered_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Momentum Lock Events - tracks all state transitions
export const momentumLockEvents = pgTable("momentum_lock_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  lockId: uuid("lock_id").notNull().references(() => momentumLocks.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),                  // created, confirmed, delivered, started, blocked, done, escalated, reassigned, expired, canceled
  actorUserId: text("actor_user_id"),                       // Slack user who triggered the event (null for system events)
  payload: jsonb("payload").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================
// BETA REQUESTS
// Collects beta signup requests from marketing site
// ============================================

export const betaRequests = pgTable("beta_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  companySize: text("company_size").notNull(),
  role: text("role").notNull(),
  blocker: text("blocker"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Type exports for TypeScript
export type BetaRequest = typeof betaRequests.$inferSelect;
export type NewBetaRequest = typeof betaRequests.$inferInsert;
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type NewOrganizationMember = typeof organizationMembers.$inferInsert;
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
export type CommandEvent = typeof commandEvents.$inferSelect;
export type NewCommandEvent = typeof commandEvents.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type DepartmentLingoProfile = typeof departmentLingoProfiles.$inferSelect;
export type NewDepartmentLingoProfile = typeof departmentLingoProfiles.$inferInsert;
export type TermTranslation = typeof termTranslations.$inferSelect;
export type NewTermTranslation = typeof termTranslations.$inferInsert;
export type TranslationEvent = typeof translationEvents.$inferSelect;
export type NewTranslationEvent = typeof translationEvents.$inferInsert;
export type MomentumLock = typeof momentumLocks.$inferSelect;
export type NewMomentumLock = typeof momentumLocks.$inferInsert;
export type MomentumLockEvent = typeof momentumLockEvents.$inferSelect;
export type NewMomentumLockEvent = typeof momentumLockEvents.$inferInsert;
