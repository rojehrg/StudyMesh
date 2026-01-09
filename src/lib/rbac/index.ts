/**
 * RBAC (Role-Based Access Control) Module
 *
 * Exports:
 * - Permission definitions
 * - Role utilities
 * - Permission checker functions
 */

export {
  Permission,
  type PermissionType,
  hasPermission,
  getPermissionsForRole,
  canManageRole,
  canAssignRole,
  getRoleDisplayName,
  getRoleDescription,
} from './permissions';

export {
  type UserOrgContext,
  getUserOrgContext,
  checkPermission,
  requirePermission,
  getUserRole,
  isOwner,
  isAdminOrOwner,
  canManageUser,
  canAssignRoleToUser,
  getOrganizationMembers,
} from './check-permission';

// Re-export role constants from schema
export { OrganizationRole, type OrganizationRoleType } from '@/lib/db/schema';
