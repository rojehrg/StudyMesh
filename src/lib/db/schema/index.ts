import { pgTable, text, timestamp, boolean, uuid, jsonb, integer } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique(), // References Supabase Auth User ID
  studyStyle: text("study_style"),
  studyTimePreference: text("study_time_preference"),
  strengths: text("strengths").array(), // Array of strings
  expertiseSkills: text("expertise_skills").array(), // Skills I can teach
  growthSkills: text("growth_skills").array(), // Skills I want to learn
  academicGoal: text("academic_goal"),
  reliability: integer("reliability").default(0),
  locationPreference: text("location_preference"),
  collaborationPreference: text("collaboration_preference").default("hybrid"),
  department: text("department"),
  preferredGroupSize: integer("preferred_group_size").default(3),
  availability: jsonb("availability").default({}), // Store availability grid as JSON
  major: text("major"), // Used for "Current Teams / Projects"
  bio: text("bio"),
  currentProjects: text("current_projects").array(),
  lookingToHelp: boolean("looking_to_help").default(false), // Status: actively offering help
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

