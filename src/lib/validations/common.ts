/**
 * Common Validation Schemas
 *
 * Reusable validation patterns across the application.
 */

import { z } from "zod";

// ============================================
// PRIMITIVE VALIDATORS
// ============================================

/**
 * UUID validator
 */
export const uuidSchema = z.string().uuid("Invalid ID format");

/**
 * Non-empty string with max length
 */
export const nonEmptyString = (maxLength = 500) =>
  z
    .string()
    .min(1, "This field is required")
    .max(maxLength, `Maximum ${maxLength} characters allowed`);

/**
 * Optional string with max length
 */
export const optionalString = (maxLength = 500) =>
  z
    .string()
    .max(maxLength, `Maximum ${maxLength} characters allowed`)
    .optional()
    .nullable();

/**
 * Email validator
 */
export const emailSchema = z.string().email("Invalid email address");

/**
 * Positive integer validator
 */
export const positiveInt = z.number().int().positive();

/**
 * Non-negative integer validator
 */
export const nonNegativeInt = z.number().int().nonnegative();

// ============================================
// DATE/TIME VALIDATORS
// ============================================

/**
 * ISO date string validator
 */
export const isoDateString = z.string().datetime("Invalid date format");

/**
 * Future date validator
 */
export const futureDateString = z
  .string()
  .datetime("Invalid date format")
  .refine(
    (val) => new Date(val) > new Date(),
    "Date must be in the future"
  );

/**
 * Timezone validator (IANA format)
 */
export const timezoneSchema = z.string().refine(
  (tz) => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  },
  { message: "Invalid timezone" }
);

// ============================================
// PAGINATION VALIDATORS
// ============================================

/**
 * Standard pagination parameters
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

/**
 * Cursor-based pagination
 */
export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CursorPaginationParams = z.infer<typeof cursorPaginationSchema>;

// ============================================
// SEARCH/FILTER VALIDATORS
// ============================================

/**
 * Search query parameter
 */
export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200).optional(),
});

/**
 * Sort order
 */
export const sortOrderSchema = z.enum(["asc", "desc"]).default("desc");

// ============================================
// SLACK VALIDATORS
// ============================================

/**
 * Slack user ID (format: U followed by alphanumeric)
 */
export const slackUserIdSchema = z
  .string()
  .regex(/^U[A-Z0-9]+$/, "Invalid Slack user ID");

/**
 * Slack team ID
 */
export const slackTeamIdSchema = z
  .string()
  .regex(/^T[A-Z0-9]+$/, "Invalid Slack team ID");

/**
 * Slack channel ID
 */
export const slackChannelIdSchema = z
  .string()
  .regex(/^[CDG][A-Z0-9]+$/, "Invalid Slack channel ID");

/**
 * Slack timestamp (message ID)
 */
export const slackTimestampSchema = z
  .string()
  .regex(/^\d+\.\d+$/, "Invalid Slack timestamp");
