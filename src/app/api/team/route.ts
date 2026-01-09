/**
 * Team Management API
 *
 * GET - List organization members
 * POST - Invite new member
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  requirePermission,
  Permission,
  getUserOrgContext,
  getOrganizationMembers,
} from '@/lib/rbac';

// GET /api/team - List organization members
export async function GET() {
  try {
    const context = await getUserOrgContext();
    if (!context) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const members = await getOrganizationMembers();

    return NextResponse.json({
      success: true,
      members,
      organizationId: context.organizationId,
      organizationName: context.organizationName,
      currentUserRole: context.role,
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

// POST /api/team - Invite new member
export async function POST(request: NextRequest) {
  try {
    // Require invite permission
    const context = await requirePermission(Permission.TEAM_INVITE);

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if user already exists with this email
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existingProfile) {
      // Check if already in this org
      const { data: existingMember } = await supabase
        .from('organization_members')
        .select('id')
        .eq('user_id', existingProfile.user_id)
        .eq('organization_id', context.organizationId)
        .maybeSingle();

      if (existingMember) {
        return NextResponse.json(
          { error: 'User is already a member of this organization' },
          { status: 400 }
        );
      }

      // Check if user is in another org
      const { data: otherOrgMember } = await supabase
        .from('organization_members')
        .select('id')
        .eq('user_id', existingProfile.user_id)
        .maybeSingle();

      if (otherOrgMember) {
        return NextResponse.json(
          { error: 'User is already a member of another organization' },
          { status: 400 }
        );
      }

      // Add existing user to org
      const { error: addError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: context.organizationId,
          user_id: existingProfile.user_id,
          role: 'member',
          invited_by: context.userId,
          invited_at: new Date().toISOString(),
        });

      if (addError) throw addError;

      // Update profile's organization_id
      await supabase
        .from('profiles')
        .update({ organization_id: context.organizationId })
        .eq('user_id', existingProfile.user_id);

      return NextResponse.json({
        success: true,
        message: 'User added to organization',
        invited: false,
      });
    }

    // User doesn't exist - for now, just return the invite code
    // In the future, we could send an email invitation
    const { data: org } = await supabase
      .from('organizations')
      .select('invite_code')
      .eq('id', context.organizationId)
      .single();

    return NextResponse.json({
      success: true,
      message: 'Share this invite code with the user',
      inviteCode: org?.invite_code,
      invited: true,
    });

  } catch (error: any) {
    console.error('Error inviting member:', error);

    if (error.message?.includes('Permission denied')) {
      return NextResponse.json(
        { error: 'You do not have permission to invite members' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to invite member' },
      { status: 500 }
    );
  }
}
