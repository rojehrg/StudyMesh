import { pgTable, text, timestamp, boolean, uuid, jsonb, integer, time } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique(), // References Supabase Auth User ID
  firstName: text("first_name"),
  lastName: text("last_name"),
  studyStyle: text("study_style"),
  studyTimePreference: text("study_time_preference"),
  strengths: text("strengths").array(), // Array of strings
  expertiseSkills: text("expertise_skills").array(), // Skills I can teach
  expertiseLevels: jsonb("expertise_levels").default({}), // Skill -> proficiency (0-100)
  growthSkills: text("growth_skills").array(), // Skills I want to learn
  growthLevels: jsonb("growth_levels").default({}), // Skill -> proficiency (0-100)
  academicGoal: text("academic_goal"),
  reliability: integer("reliability").default(0),
  locationPreference: text("location_preference"),
  collaborationPreference: text("collaboration_preference").default("hybrid"),
  department: text("department"),
  preferredGroupSize: integer("preferred_group_size").default(3),
  availability: jsonb("availability").default({}), // Legacy - kept for backward compatibility
  timezone: text("timezone").default("America/New_York"), // User's timezone
  major: text("major"), // Used for "Current Teams / Projects"
  bio: text("bio"),
  currentProjects: text("current_projects").array(),
  slackHandle: text("slack_handle"), // Slack user handle or ID (legacy)
  slackUserId: text("slack_user_id"), // Slack user ID from OAuth
  slackAccessToken: text("slack_access_token"), // OAuth access token for DMs
  slackTeamId: text("slack_team_id"), // Slack workspace ID
  slackConnected: boolean("slack_connected").default(false), // Is Slack connected via OAuth
  email: text("email"), // User's email for notifications
  emailNotifications: boolean("email_notifications").default(true), // Opt-in for email notifications
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Granular availability schedules - replaces the old availability JSONB
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

// Scheduled meetings between users
export const scheduledMeetings = pgTable("scheduled_meetings", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizerId: uuid("organizer_id").notNull(),
  podId: uuid("pod_id").references(() => pods.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description"),
  scheduledTime: timestamp("scheduled_time", { withTimezone: true }).notNull(),
  durationMinutes: integer("duration_minutes").default(30).notNull(),
  meetingLink: text("meeting_link"), // Zoom, Google Meet, etc.
  status: text("status").default("scheduled").notNull(), // scheduled, completed, cancelled
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

export const pods = pgTable("pods", {
  id: uuid("id").primaryKey().defaultRandom(),
  podCode: text("pod_code").notNull().unique(),
  podName: text("pod_name").notNull(),
  businessUnit: text("business_unit"), // Formerly 'school'
  initiativeOwner: text("initiative_owner"), // Formerly 'professor'
  term: text("term"),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const podMembers = pgTable("pod_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  podId: uuid("pod_id").references(() => pods.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const compatibilityScores = pgTable("compatibility_scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  podId: uuid("pod_id").references(() => pods.id, { onDelete: "cascade" }).notNull(),
  userAId: uuid("user_a_id").notNull(),
  userBId: uuid("user_b_id").notNull(),
  score: integer("score").notNull(),
  scoreBreakdown: jsonb("score_breakdown").notNull(), // Stores the detailed match reasons/scores
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  recipientId: uuid("recipient_id").notNull(),
  senderId: uuid("sender_id").notNull(),
  type: text("type").notNull(), // 'nudge', 'system', etc.
  content: text("content").notNull(),
  metadata: jsonb("metadata").default({}), // Additional context (topic, pod_id, etc.)
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const openRequests = pgTable("open_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  skill: text("skill").notNull(),
  status: text("status").default("open"), // open, notified, closed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

