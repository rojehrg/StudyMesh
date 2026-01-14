/**
 * Team Validation Schemas
 *
 * Validation schemas for team and organization operations.
 */

import { z } from "zod";
import { uuidSchema, nonEmptyString, emailSchema, paginationSchema } from "./common";
import { OrganizationRole } from "@/lib/db/schema";

// ============================================
// ORGANIZATION ROLES
// ============================================

export const organizationRoleSchema = z.enum([
  OrganizationRole.OWNER,
  OrganizationRole.ADMIN,
  OrganizationRole.MEMBER,
]);

export type OrganizationRoleInput = z.infer<typeof organizationRoleSchema>;

// ============================================
// INVITE MEMBER
// ============================================

/**
 * Invite team member request
 */
export const inviteMemberSchema = z.object({
  email: emailSchema,
  role: organizationRoleSchema.default(OrganizationRole.MEMBER),
  message: z.string().max(500).optional(),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

/**
 * Bulk invite members
 */
export const bulkInviteSchema = z.object({
  emails: z
    .array(emailSchema)
    .min(1, "At least one email required")
    .max(50, "Maximum 50 invites at once"),
  role: organizationRoleSchema.default(OrganizationRole.MEMBER),
});

export type BulkInviteInput = z.infer<typeof bulkInviteSchema>;

// ============================================
// UPDATE MEMBER ROLE
// ============================================

/**
 * Update member role request
 */
export const updateMemberRoleSchema = z.object({
  userId: uuidSchema,
  role: organizationRoleSchema,
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;

// ============================================
// REMOVE MEMBER
// ============================================

/**
 * Remove member request
 */
export const removeMemberSchema = z.object({
  userId: uuidSchema,
  reason: z.string().max(500).optional(),
});

export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;

// ============================================
// QUERY TEAM
// ============================================

/**
 * Query team members parameters
 */
export const queryTeamSchema = paginationSchema.extend({
  search: z.string().max(200).optional(),
  role: organizationRoleSchema.optional(),
  department: z.string().max(100).optional(),
  sortBy: z.enum(["name", "role", "joinedAt", "department"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type QueryTeamParams = z.infer<typeof queryTeamSchema>;

// ============================================
// ORGANIZATION SETTINGS
// ============================================

/**
 * Update organization settings
 */
export const updateOrgSettingsSchema = z.object({
  name: nonEmptyString(100).optional(),
  themeSettings: z
    .object({
      preset: z.string().max(50).optional(),
      primary: z.string().max(50).optional(),
    })
    .optional(),
});

export type UpdateOrgSettingsInput = z.infer<typeof updateOrgSettingsSchema>;
