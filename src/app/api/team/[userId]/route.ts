/**
 * Individual Team Member Management API
 *
 * GET - Get member details
 * PATCH - Update member role
 * DELETE - Remove member from organization
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  requirePermission,
  Permission,
  getUserOrgContext,
  canManageUser,
  canAssignRoleToUser,
  OrganizationRole,
  OrganizationRoleType,
} from '@/lib/rbac';
import { audit } from '@/lib/audit';

interface RouteParams {
  params: Promise<{ userId: string }>;
}

// GET /api/team/[userId] - Get member details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await params;
    const context = await getUserOrgContext();

    if (!context) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: member } = await supabase
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
          expertise_text
        )
      `)
      .eq('user_id', userId)
      .eq('organization_id', context.organizationId)
      .maybeSingle();

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      member,
      canManage: await canManageUser(userId),
    });
  } catch (error) {
    console.error('Error fetching member:', error);
    return NextResponse.json({ error: 'Failed to fetch member' }, { status: 500 });
  }
}

// PATCH /api/team/[userId] - Update member role
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await params;
    const context = await requirePermission(Permission.TEAM_CHANGE_ROLE);

    const body = await request.json();
    const { role } = body;

    // Validate role
    if (!role || !Object.values(OrganizationRole).includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be: owner, admin, or member' },
        { status: 400 }
      );
    }

    // Can't change your own role
    if (userId === context.userId) {
      return NextResponse.json(
        { error: 'You cannot change your own role' },
        { status: 400 }
      );
    }

    // Check if user can manage this member
    const canManage = await canManageUser(userId);
    if (!canManage) {
      return NextResponse.json(
        { error: 'You do not have permission to manage this user' },
        { status: 403 }
      );
    }

    // Check if user can assign this role
    const canAssign = await canAssignRoleToUser(role as OrganizationRoleType);
    if (!canAssign) {
      return NextResponse.json(
        { error: `You cannot assign the ${role} role` },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    // Get current member info for audit logging
    const { data: memberData } = await supabase
      .from('organization_members')
      .select(`
        role,
        profiles (first_name, last_name, email)
      `)
      .eq('user_id', userId)
      .eq('organization_id', context.organizationId)
      .maybeSingle();

    const oldRole = memberData?.role || 'unknown';
    const profile = memberData?.profiles as any;
    const memberName = profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : profile?.email || 'Unknown';

    // Update the role
    const { error } = await supabase
      .from('organization_members')
      .update({ role })
      .eq('user_id', userId)
      .eq('organization_id', context.organizationId);

    if (error) throw error;

    // Log audit event
    await audit.memberRoleChanged(
      context.organizationId,
      context.userId,
      userId,
      memberName,
      oldRole,
      role
    );

    return NextResponse.json({
      success: true,
      message: `Role updated to ${role}`,
    });
  } catch (error: any) {
    console.error('Error updating role:', error);

    if (error.message?.includes('Permission denied')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}

// DELETE /api/team/[userId] - Remove member from organization
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await params;
    const context = await requirePermission(Permission.TEAM_REMOVE);

    // Can't remove yourself
    if (userId === context.userId) {
      return NextResponse.json(
        { error: 'You cannot remove yourself from the organization' },
        { status: 400 }
      );
    }

    // Check if user can manage this member
    const canManage = await canManageUser(userId);
    if (!canManage) {
      return NextResponse.json(
        { error: 'You do not have permission to remove this user' },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    // Get target member info for validation and audit logging
    const { data: targetMember } = await supabase
      .from('organization_members')
      .select(`
        role,
        profiles (first_name, last_name, email)
      `)
      .eq('user_id', userId)
      .eq('organization_id', context.organizationId)
      .maybeSingle();

    if (targetMember?.role === OrganizationRole.OWNER) {
      return NextResponse.json(
        { error: 'Cannot remove the organization owner' },
        { status: 400 }
      );
    }

    const profile = targetMember?.profiles as any;
    const memberName = profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : profile?.email || 'Unknown';

    // Remove from organization_members
    const { error: removeError } = await supabase
      .from('organization_members')
      .delete()
      .eq('user_id', userId)
      .eq('organization_id', context.organizationId);

    if (removeError) throw removeError;

    // Clear organization_id from profile
    await supabase
      .from('profiles')
      .update({ organization_id: null })
      .eq('user_id', userId);

    // Log audit event
    await audit.memberRemoved(context.organizationId, context.userId, userId, memberName);

    return NextResponse.json({
      success: true,
      message: 'Member removed from organization',
    });
  } catch (error: any) {
    console.error('Error removing member:', error);

    if (error.message?.includes('Permission denied')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
  }
}
