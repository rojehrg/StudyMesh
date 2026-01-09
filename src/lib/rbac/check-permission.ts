/**
 * Permission Checker Utility
 *
 * Server-side utilities to check user permissions within an organization.
 */

import { createClient } from '@/lib/supabase/server';
import { OrganizationRole, OrganizationRoleType } from '@/lib/db/schema';
import { hasPermission, PermissionType, canManageRole, canAssignRole } from './permissions';

export interface UserOrgContext {
  userId: string;
  organizationId: string;
  role: OrganizationRoleType;
  organizationName: string;
}

/**
 * Get the current user's organization context
 * Returns null if user is not authenticated or not in an organization
 */
export async function getUserOrgContext(): Promise<UserOrgContext | null> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get organization_id from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('user_id', user.id)
    .single();

  if (!profile?.organization_id) return null;

  // Get organization details
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, owner_id')
    .eq('id', profile.organization_id)
    .single();

  if (!org) return null;

  // Determine role based on ownership
  const role: OrganizationRoleType = org.owner_id === user.id ? 'owner' : 'member';

  return {
    userId: user.id,
    organizationId: org.id,
    role,
    organizationName: org.name,
  };
}

/**
 * Check if the current user has a specific permission
 */
export async function checkPermission(permission: PermissionType): Promise<boolean> {
  const context = await getUserOrgContext();
  if (!context) return false;

  return hasPermission(context.role, permission);
}

/**
 * Check if user has permission and throw if not
 */
export async function requirePermission(permission: PermissionType): Promise<UserOrgContext> {
  const context = await getUserOrgContext();

  if (!context) {
    throw new Error('Not authenticated or not in an organization');
  }

  if (!hasPermission(context.role, permission)) {
    throw new Error(`Permission denied: ${permission}`);
  }

  return context;
}

/**
 * Get user's role in their organization
 */
export async function getUserRole(): Promise<OrganizationRoleType | null> {
  const context = await getUserOrgContext();
  return context?.role ?? null;
}

/**
 * Check if user is owner of their organization
 */
export async function isOwner(): Promise<boolean> {
  const role = await getUserRole();
  return role === OrganizationRole.OWNER;
}

/**
 * Check if user is admin or owner of their organization
 */
export async function isAdminOrOwner(): Promise<boolean> {
  const role = await getUserRole();
  return role === OrganizationRole.OWNER || role === OrganizationRole.ADMIN;
}

/**
 * Check if user can manage another user (for role changes, removal, etc.)
 */
export async function canManageUser(targetUserId: string): Promise<boolean> {
  const context = await getUserOrgContext();
  if (!context) return false;

  // Can't manage yourself
  if (context.userId === targetUserId) return false;

  const supabase = await createClient();

  // Get target user's role
  const { data: targetMembership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('user_id', targetUserId)
    .eq('organization_id', context.organizationId)
    .maybeSingle();

  if (!targetMembership) return false;

  return canManageRole(context.role, targetMembership.role as OrganizationRoleType);
}

/**
 * Check if user can assign a specific role to another user
 */
export async function canAssignRoleToUser(roleToAssign: OrganizationRoleType): Promise<boolean> {
  const context = await getUserOrgContext();
  if (!context) return false;

  return canAssignRole(context.role, roleToAssign);
}

/**
 * Get all members of the current user's organization with their roles
 */
export async function getOrganizationMembers() {
  const context = await getUserOrgContext();
  if (!context) return [];

  const supabase = await createClient();

  const { data: members } = await supabase
    .from('organization_members')
    .select(`
      id,
      user_id,
      role,
      joined_at,
      invited_by,
      profiles (
        first_name,
        last_name,
        email,
        department,
        major,
        slack_connected,
        slack_handle,
        avatar_url
      )
    `)
    .eq('organization_id', context.organizationId)
    .order('joined_at', { ascending: true });

  return members ?? [];
}
