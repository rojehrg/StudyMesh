/**
 * Client-side permission hook
 *
 * Fetches user's organization role and provides permission checking.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { OrganizationRole, OrganizationRoleType } from '@/lib/db/schema';
import {
  hasPermission,
  PermissionType,
  canManageRole,
  canAssignRole,
  getRoleDisplayName,
} from '@/lib/rbac/permissions';

interface OrgMembership {
  userId: string;
  organizationId: string;
  organizationName: string;
  role: OrganizationRoleType;
  isOwner: boolean;
  isAdmin: boolean;
}

interface UsePermissionsReturn {
  loading: boolean;
  membership: OrgMembership | null;
  can: (permission: PermissionType) => boolean;
  canManage: (targetRole: OrganizationRoleType) => boolean;
  canAssign: (roleToAssign: OrganizationRoleType) => boolean;
  roleDisplay: string;
  refresh: () => Promise<void>;
}

export function usePermissions(): UsePermissionsReturn {
  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState<OrgMembership | null>(null);
  const supabase = createClient();

  const loadMembership = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMembership(null);
        return;
      }

      const { data: memberData } = await supabase
        .from('organization_members')
        .select(`
          organization_id,
          role,
          organizations (
            id,
            name
          )
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!memberData?.organizations) {
        setMembership(null);
        return;
      }

      // Supabase returns single object for single-row foreign key relations
      const org = memberData.organizations as unknown as { id: string; name: string };
      const role = memberData.role as OrganizationRoleType;

      setMembership({
        userId: user.id,
        organizationId: org.id,
        organizationName: org.name,
        role,
        isOwner: role === OrganizationRole.OWNER,
        isAdmin: role === OrganizationRole.ADMIN || role === OrganizationRole.OWNER,
      });
    } catch (error) {
      console.error('Error loading membership:', error);
      setMembership(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadMembership();
  }, [loadMembership]);

  // Permission check function
  const can = useCallback((permission: PermissionType): boolean => {
    if (!membership) return false;
    return hasPermission(membership.role, permission);
  }, [membership]);

  // Check if user can manage a target role
  const canManage = useCallback((targetRole: OrganizationRoleType): boolean => {
    if (!membership) return false;
    return canManageRole(membership.role, targetRole);
  }, [membership]);

  // Check if user can assign a role
  const canAssign = useCallback((roleToAssign: OrganizationRoleType): boolean => {
    if (!membership) return false;
    return canAssignRole(membership.role, roleToAssign);
  }, [membership]);

  // Get display name for current role
  const roleDisplay = membership ? getRoleDisplayName(membership.role) : '';

  return {
    loading,
    membership,
    can,
    canManage,
    canAssign,
    roleDisplay,
    refresh: loadMembership,
  };
}

/**
 * Simple hook to check if user is admin or owner
 */
export function useIsAdmin(): { isAdmin: boolean; loading: boolean } {
  const { membership, loading } = usePermissions();
  return {
    isAdmin: membership?.isAdmin ?? false,
    loading,
  };
}

/**
 * Simple hook to check if user is owner
 */
export function useIsOwner(): { isOwner: boolean; loading: boolean } {
  const { membership, loading } = usePermissions();
  return {
    isOwner: membership?.isOwner ?? false,
    loading,
  };
}
