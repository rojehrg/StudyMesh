/**
 * Profile Validation Schemas
 *
 * Validation schemas for user profile operations.
 */

import { z } from "zod";
import { nonEmptyString, optionalString, timezoneSchema } from "./common";

// ============================================
// PROFILE SCHEMAS
// ============================================

/**
 * Update profile request
 */
export const updateProfileSchema = z.object({
  firstName: nonEmptyString(100).optional(),
  lastName: nonEmptyString(100).optional(),
  department: optionalString(100),
  major: optionalString(100), // Job title
  bio: optionalString(1000),
  timezone: timezoneSchema.optional(),
  expertiseText: optionalString(2000),
  knowledgeAreas: z.array(z.string().max(100)).max(20).optional(),
  currentlyAvailable: z.boolean().optional(),
  lookingToHelp: z.boolean().optional(),
  preferredGroupSize: z.number().int().min(1).max(10).optional(),
  emailNotifications: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Update expertise request
 */
export const updateExpertiseSchema = z.object({
  expertiseText: z
    .string()
    .min(10, "Please describe your expertise in at least 10 characters")
    .max(2000, "Expertise description is too long"),
  knowledgeAreas: z
    .array(z.string().min(1).max(100))
    .max(20, "Maximum 20 knowledge areas allowed")
    .optional(),
});

export type UpdateExpertiseInput = z.infer<typeof updateExpertiseSchema>;

/**
 * Availability schedule item
 */
export const availabilitySlotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6), // 0 = Sunday, 6 = Saturday
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  label: optionalString(50),
});

export type AvailabilitySlot = z.infer<typeof availabilitySlotSchema>;

/**
 * Update availability request
 */
export const updateAvailabilitySchema = z.object({
  timezone: timezoneSchema,
  currentlyAvailable: z.boolean(),
  slots: z.array(availabilitySlotSchema).max(50).optional(),
});

export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;
