/**
 * Audit Logging Utility
 *
 * Provides functions to log sensitive actions for compliance and debugging.
 * All audit logs are tied to an organization for multi-tenant isolation.
 */

import { createClient } from '@/lib/supabase/server';
import { AuditAction, AuditActionType } from '@/lib/db/schema';
import { headers } from 'next/headers';

export interface AuditLogParams {
  organizationId: string;
  actorId?: string | null;
  action: AuditActionType;
  resourceType?: string;
  resourceId?: string;
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * Log an audit event
 */
export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    const supabase = await createClient();

    // Get request context
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0]?.trim()
      || headersList.get('x-real-ip')
      || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    await supabase.from('audit_logs').insert({
      organization_id: params.organizationId,
      actor_id: params.actorId || null,
      action: params.action,
      resource_type: params.resourceType || null,
      resource_id: params.resourceId || null,
      description: params.description || null,
      metadata: params.metadata || {},
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  } catch (error) {
    // Don't throw - audit logging should not break the main flow
    console.error('[Audit] Failed to log event:', error, params);
  }
}

/**
 * Convenience function to get actor info from current session
 */
export async function getAuditActor(): Promise<{ userId: string; organizationId: string } | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!membership) return null;

    return {
      userId: user.id,
      organizationId: membership.organization_id,
    };
  } catch {
    return null;
  }
}

/**
 * Log with automatic actor detection
 */
export async function logAuditWithActor(
  action: AuditActionType,
  options: Omit<AuditLogParams, 'organizationId' | 'actorId' | 'action'> = {}
): Promise<void> {
  const actor = await getAuditActor();
  if (!actor) {
    console.warn('[Audit] Could not determine actor for audit log');
    return;
  }

  await logAudit({
    organizationId: actor.organizationId,
    actorId: actor.userId,
    action,
    ...options,
  });
}

// ============================================
// Convenience logging functions
// ============================================

export const audit = {
  // Team management
  memberInvited: (orgId: string, actorId: string, invitedEmail: string) =>
    logAudit({
      organizationId: orgId,
      actorId,
      action: AuditAction.MEMBER_INVITED,
      resourceType: 'user',
      description: `Invited ${invitedEmail} to the organization`,
      metadata: { invitedEmail },
    }),

  memberJoined: (orgId: string, userId: string, userName: string) =>
    logAudit({
      organizationId: orgId,
      actorId: userId,
      action: AuditAction.MEMBER_JOINED,
      resourceType: 'user',
      resourceId: userId,
      description: `${userName} joined the organization`,
    }),

  memberRemoved: (orgId: string, actorId: string, removedUserId: string, removedName: string) =>
    logAudit({
      organizationId: orgId,
      actorId,
      action: AuditAction.MEMBER_REMOVED,
      resourceType: 'user',
      resourceId: removedUserId,
      description: `Removed ${removedName} from the organization`,
      metadata: { removedUserId, removedName },
    }),

  memberRoleChanged: (orgId: string, actorId: string, userId: string, userName: string, oldRole: string, newRole: string) =>
    logAudit({
      organizationId: orgId,
      actorId,
      action: AuditAction.MEMBER_ROLE_CHANGED,
      resourceType: 'user',
      resourceId: userId,
      description: `Changed ${userName}'s role from ${oldRole} to ${newRole}`,
      metadata: { userId, userName, oldRole, newRole },
    }),

  // Authentication
  userLogin: (orgId: string, userId: string) =>
    logAudit({
      organizationId: orgId,
      actorId: userId,
      action: AuditAction.USER_LOGIN,
      resourceType: 'user',
      resourceId: userId,
      description: 'User logged in',
    }),

  userLogout: (orgId: string, userId: string) =>
    logAudit({
      organizationId: orgId,
      actorId: userId,
      action: AuditAction.USER_LOGOUT,
      resourceType: 'user',
      resourceId: userId,
      description: 'User logged out',
    }),

  // Integrations
  slackConnected: (orgId: string, userId: string) =>
    logAudit({
      organizationId: orgId,
      actorId: userId,
      action: AuditAction.SLACK_CONNECTED,
      resourceType: 'integration',
      description: 'Connected Slack account',
    }),

  slackDisconnected: (orgId: string, userId: string) =>
    logAudit({
      organizationId: orgId,
      actorId: userId,
      action: AuditAction.SLACK_DISCONNECTED,
      resourceType: 'integration',
      description: 'Disconnected Slack account',
    }),

  calendarConnected: (orgId: string, userId: string, provider: string) =>
    logAudit({
      organizationId: orgId,
      actorId: userId,
      action: AuditAction.CALENDAR_CONNECTED,
      resourceType: 'integration',
      description: `Connected ${provider} calendar`,
      metadata: { provider },
    }),

  calendarDisconnected: (orgId: string, userId: string, provider: string) =>
    logAudit({
      organizationId: orgId,
      actorId: userId,
      action: AuditAction.CALENDAR_DISCONNECTED,
      resourceType: 'integration',
      description: `Disconnected ${provider} calendar`,
      metadata: { provider },
    }),

  // Data
  dataExported: (orgId: string, userId: string) =>
    logAudit({
      organizationId: orgId,
      actorId: userId,
      action: AuditAction.DATA_EXPORTED,
      resourceType: 'user',
      resourceId: userId,
      description: 'Exported personal data',
    }),

  accountDeleted: (orgId: string, userId: string) =>
    logAudit({
      organizationId: orgId,
      actorId: userId,
      action: AuditAction.ACCOUNT_DELETED,
      resourceType: 'user',
      resourceId: userId,
      description: 'Account deleted',
    }),

  // Organization settings
  orgSettingsUpdated: (orgId: string, actorId: string, changes: Record<string, any>) =>
    logAudit({
      organizationId: orgId,
      actorId,
      action: AuditAction.ORG_SETTINGS_UPDATED,
      resourceType: 'organization',
      resourceId: orgId,
      description: 'Updated organization settings',
      metadata: { changes },
    }),

  // Billing
  subscriptionCreated: (orgId: string, actorId: string | null, plan: string) =>
    logAudit({
      organizationId: orgId,
      actorId,
      action: AuditAction.SUBSCRIPTION_CREATED,
      resourceType: 'billing',
      description: `Created ${plan} subscription`,
      metadata: { plan },
    }),

  subscriptionUpdated: (orgId: string, actorId: string | null, oldPlan: string, newPlan: string) =>
    logAudit({
      organizationId: orgId,
      actorId,
      action: AuditAction.SUBSCRIPTION_UPDATED,
      resourceType: 'billing',
      description: `Updated subscription from ${oldPlan} to ${newPlan}`,
      metadata: { oldPlan, newPlan },
    }),

  subscriptionCancelled: (orgId: string, actorId: string | null) =>
    logAudit({
      organizationId: orgId,
      actorId,
      action: AuditAction.SUBSCRIPTION_CANCELLED,
      resourceType: 'billing',
      description: 'Cancelled subscription',
    }),

  trialStarted: (orgId: string, actorId: string, plan: string) =>
    logAudit({
      organizationId: orgId,
      actorId,
      action: AuditAction.TRIAL_STARTED,
      resourceType: 'billing',
      description: `Started ${plan} trial`,
      metadata: { plan },
    }),
};

export { AuditAction } from '@/lib/db/schema';
