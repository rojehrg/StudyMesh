/**
 * Momentum Lock Validation Schemas
 *
 * Validation schemas for Momentum Lock operations.
 */

import { z } from "zod";
import {
  uuidSchema,
  nonEmptyString,
  optionalString,
  futureDateString,
  slackUserIdSchema,
  slackTeamIdSchema,
  slackChannelIdSchema,
  slackTimestampSchema,
  paginationSchema,
} from "./common";
import { MomentumLockStatus } from "@/lib/db/schema";

// ============================================
// LOCK STATUS
// ============================================

export const lockStatusSchema = z.enum([
  MomentumLockStatus.DRAFT,
  MomentumLockStatus.ACTIVE,
  MomentumLockStatus.STARTED,
  MomentumLockStatus.BLOCKED,
  MomentumLockStatus.DONE,
  MomentumLockStatus.CANCELED,
  MomentumLockStatus.EXPIRED,
]);

export type LockStatus = z.infer<typeof lockStatusSchema>;

// ============================================
// CREATE LOCK
// ============================================

/**
 * Create momentum lock request (from Slack modal)
 */
export const createLockSchema = z.object({
  workspaceId: slackTeamIdSchema,
  channelId: slackChannelIdSchema,
  threadTs: slackTimestampSchema.optional().nullable(),
  requesterUserId: slackUserIdSchema,
  ownerUserId: slackUserIdSchema,
  fallbackUserId: slackUserIdSchema.optional().nullable(),
  requiredOutcome: nonEmptyString(500),
  acceptableFallback: optionalString(500),
  impactStatement: optionalString(300),
  deadlineAt: futureDateString,
  ownerTimezone: z.string().optional(),
  requesterTimezone: z.string().optional(),
});

export type CreateLockInput = z.infer<typeof createLockSchema>;

// ============================================
// UPDATE LOCK STATUS
// ============================================

/**
 * Update lock status request (button clicks from Slack)
 */
export const updateLockStatusSchema = z.object({
  lockId: uuidSchema,
  status: lockStatusSchema,
  actorUserId: slackUserIdSchema,
  note: optionalString(500),
});

export type UpdateLockStatusInput = z.infer<typeof updateLockStatusSchema>;

// ============================================
// QUERY LOCKS
// ============================================

/**
 * Query locks filter parameters
 */
export const queryLocksSchema = paginationSchema.extend({
  status: lockStatusSchema.optional(),
  workspaceId: slackTeamIdSchema.optional(),
  ownerUserId: slackUserIdSchema.optional(),
  requesterUserId: slackUserIdSchema.optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
  sortBy: z.enum(["createdAt", "deadlineAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type QueryLocksParams = z.infer<typeof queryLocksSchema>;

// ============================================
// LOCK EVENTS
// ============================================

/**
 * Lock event types
 */
export const lockEventTypeSchema = z.enum([
  "created",
  "confirmed",
  "delivered",
  "started",
  "blocked",
  "done",
  "escalated",
  "reassigned",
  "expired",
  "canceled",
]);

export type LockEventType = z.infer<typeof lockEventTypeSchema>;

/**
 * Add lock event request
 */
export const addLockEventSchema = z.object({
  lockId: uuidSchema,
  eventType: lockEventTypeSchema,
  actorUserId: slackUserIdSchema.optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export type AddLockEventInput = z.infer<typeof addLockEventSchema>;

// ============================================
// DASHBOARD QUERIES
// ============================================

/**
 * User's locks dashboard query
 */
export const userLocksQuerySchema = paginationSchema.extend({
  filter: z.enum(["all", "owned", "requested", "active", "completed"]).default("all"),
});

export type UserLocksQueryParams = z.infer<typeof userLocksQuerySchema>;

/**
 * Team locks dashboard query
 */
export const teamLocksQuerySchema = paginationSchema.extend({
  status: z.array(lockStatusSchema).optional(),
  includeCompleted: z.boolean().default(false),
});

export type TeamLocksQueryParams = z.infer<typeof teamLocksQuerySchema>;
