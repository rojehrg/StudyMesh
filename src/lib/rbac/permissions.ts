/**
 * RBAC Permission System
 *
 * Defines permissions for each role in the organization.
 *
 * Role hierarchy:
 * - owner: Full control including billing and org deletion
 * - admin: User management, settings (no billing)
 * - member: Standard user access
 */

import { OrganizationRole, OrganizationRoleType } from '@/lib/db/schema';

// Permission definitions
export const Permission = {
  // Organization management
  ORG_VIEW: 'org:view',
  ORG_EDIT: 'org:edit',
  ORG_DELETE: 'org:delete',

  // Team/member management
  TEAM_VIEW: 'team:view',
  TEAM_INVITE: 'team:invite',
  TEAM_REMOVE: 'team:remove',
  TEAM_CHANGE_ROLE: 'team:change_role',

  // Billing
  BILLING_VIEW: 'billing:view',
  BILLING_MANAGE: 'billing:manage',

  // Settings
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',

  // Integrations (Slack, SSO)
  INTEGRATIONS_VIEW: 'integrations:view',
  INTEGRATIONS_MANAGE: 'integrations:manage',

  // Analytics
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',

  // Audit logs
  AUDIT_VIEW: 'audit:view',

  // SSO configuration
  SSO_VIEW: 'sso:view',
  SSO_MANAGE: 'sso:manage',
} as const;

export type PermissionType = typeof Permission[keyof typeof Permission];

// Role-to-permission mapping
const rolePermissions: Record<OrganizationRoleType, PermissionType[]> = {
  [OrganizationRole.OWNER]: [
    // Owner has ALL permissions
    Permission.ORG_VIEW,
    Permission.ORG_EDIT,
    Permission.ORG_DELETE,
    Permission.TEAM_VIEW,
    Permission.TEAM_INVITE,
    Permission.TEAM_REMOVE,
    Permission.TEAM_CHANGE_ROLE,
    Permission.BILLING_VIEW,
    Permission.BILLING_MANAGE,
    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_EDIT,
    Permission.INTEGRATIONS_VIEW,
    Permission.INTEGRATIONS_MANAGE,
    Permission.ANALYTICS_VIEW,
    Permission.ANALYTICS_EXPORT,
    Permission.AUDIT_VIEW,
    Permission.SSO_VIEW,
    Permission.SSO_MANAGE,
  ],

  [OrganizationRole.ADMIN]: [
    // Admin can manage team, settings, and billing, but NOT org deletion
    Permission.ORG_VIEW,
    Permission.ORG_EDIT,
    // No ORG_DELETE
    Permission.TEAM_VIEW,
    Permission.TEAM_INVITE,
    Permission.TEAM_REMOVE,
    Permission.TEAM_CHANGE_ROLE,
    Permission.BILLING_VIEW,
    Permission.BILLING_MANAGE, // Admins can manage billing for enterprise needs
    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_EDIT,
    Permission.INTEGRATIONS_VIEW,
    Permission.INTEGRATIONS_MANAGE,
    Permission.ANALYTICS_VIEW,
    Permission.ANALYTICS_EXPORT,
    Permission.AUDIT_VIEW,
    Permission.SSO_VIEW,
    // No SSO_MANAGE (owner only)
  ],

  [OrganizationRole.MEMBER]: [
    // Member has basic view access
    Permission.ORG_VIEW,
    Permission.TEAM_VIEW,
    Permission.SETTINGS_VIEW,
    Permission.INTEGRATIONS_VIEW,
    // Members can't edit org settings, manage team, or access billing/analytics
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: OrganizationRoleType, permission: PermissionType): boolean {
  const permissions = rolePermissions[role];
  return permissions?.includes(permission) ?? false;
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: OrganizationRoleType): PermissionType[] {
  return rolePermissions[role] ?? [];
}

/**
 * Check if a role can manage another role (for role changes)
 * - Owner can manage anyone
 * - Admin can manage members only
 * - Members can't manage anyone
 */
export function canManageRole(actorRole: OrganizationRoleType, targetRole: OrganizationRoleType): boolean {
  if (actorRole === OrganizationRole.OWNER) {
    return true; // Owner can manage anyone
  }

  if (actorRole === OrganizationRole.ADMIN) {
    // Admin can only manage members, not other admins or owner
    return targetRole === OrganizationRole.MEMBER;
  }

  return false; // Members can't manage anyone
}

/**
 * Check if a role can assign another role
 * - Owner can assign any role except owner (only one owner per org)
 * - Admin can only assign member role
 * - Members can't assign roles
 */
export function canAssignRole(actorRole: OrganizationRoleType, roleToAssign: OrganizationRoleType): boolean {
  if (actorRole === OrganizationRole.OWNER) {
    // Owner can assign admin or member, but not another owner
    return roleToAssign !== OrganizationRole.OWNER;
  }

  if (actorRole === OrganizationRole.ADMIN) {
    // Admin can only assign member role
    return roleToAssign === OrganizationRole.MEMBER;
  }

  return false; // Members can't assign roles
}

/**
 * Get display name for a role
 */
export function getRoleDisplayName(role: OrganizationRoleType): string {
  switch (role) {
    case OrganizationRole.OWNER:
      return 'Owner';
    case OrganizationRole.ADMIN:
      return 'Admin';
    case OrganizationRole.MEMBER:
      return 'Member';
    default:
      return 'Unknown';
  }
}

/**
 * Get description for a role
 */
export function getRoleDescription(role: OrganizationRoleType): string {
  switch (role) {
    case OrganizationRole.OWNER:
      return 'Full control including billing and organization deletion';
    case OrganizationRole.ADMIN:
      return 'Can manage team members, settings, and integrations';
    case OrganizationRole.MEMBER:
      return 'Standard access to use Attunly features';
    default:
      return '';
  }
}
