/**
 * Tier Enforcement
 *
 * Server-side enforcement of subscription limits.
 * These functions should be called in API routes to gate features.
 */

import { createClient } from '@/lib/supabase/server';
import { getOrganizationSubscription, canAddPods, canAddSeats, hasFeature, PLANS, type PlanName, type PlanFeatures } from './index';
import { createLogger } from '@/lib/logger';

const log = createLogger({ service: 'billing-enforcement' });

export interface EnforcementResult {
  allowed: boolean;
  current: number;
  limit: number;
  plan: PlanName;
  message?: string;
}

/**
 * Check if organization can create another pod
 */
export async function enforcePodLimit(organizationId: string): Promise<EnforcementResult> {
  const supabase = await createClient();

  // Get organization's subscription
  const subscription = await getOrganizationSubscription(organizationId);
  const plan = subscription?.plan || 'free';
  const planFeatures = PLANS[plan];

  // Count pods created by users in this organization
  // First, try counting by organization_id on pods (if column exists)
  let { count, error } = await supabase
    .from('pods')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId);

  // If organization_id column doesn't exist, count through creators
  if (error && error.message.includes('organization_id')) {
    // Get all user IDs in this organization
    const { data: orgMembers } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('organization_id', organizationId);

    const memberIds = orgMembers?.map(m => m.user_id) || [];

    if (memberIds.length > 0) {
      const { count: creatorCount, error: creatorError } = await supabase
        .from('pods')
        .select('*', { count: 'exact', head: true })
        .in('created_by', memberIds);

      if (!creatorError) {
        count = creatorCount;
        error = null;
      }
    } else {
      count = 0;
      error = null;
    }
  }

  if (error) {
    log.error('Failed to count pods', { organizationId, error: error.message });
    // Fail open for now, but log the error
    return { allowed: true, current: 0, limit: planFeatures.maxPods, plan };
  }

  const currentPods = count || 0;
  const allowed = canAddPods(plan, currentPods);

  if (!allowed) {
    log.info('Pod limit reached', { organizationId, plan, currentPods, limit: planFeatures.maxPods });
  }

  return {
    allowed,
    current: currentPods,
    limit: planFeatures.maxPods,
    plan,
    message: allowed ? undefined : `You've reached your pod limit (${currentPods}/${planFeatures.maxPods}). Upgrade to create more pods.`,
  };
}

/**
 * Check if organization can add more members
 */
export async function enforceSeatLimit(
  organizationId: string,
  additionalSeats: number = 1
): Promise<EnforcementResult> {
  const supabase = await createClient();

  // Get organization's subscription
  const subscription = await getOrganizationSubscription(organizationId);
  const plan = subscription?.plan || 'free';
  const planFeatures = PLANS[plan];

  // Count current members in this organization
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId);

  if (error) {
    log.error('Failed to count members', { organizationId, error: error.message });
    // Fail open for now, but log the error
    return { allowed: true, current: 0, limit: planFeatures.maxSeats, plan };
  }

  const currentSeats = count || 0;
  const allowed = canAddSeats(plan, currentSeats, additionalSeats);

  if (!allowed) {
    log.info('Seat limit reached', { organizationId, plan, currentSeats, limit: planFeatures.maxSeats });
  }

  return {
    allowed,
    current: currentSeats,
    limit: planFeatures.maxSeats,
    plan,
    message: allowed ? undefined : `Your team is at capacity (${currentSeats}/${planFeatures.maxSeats} members). Upgrade to add more members.`,
  };
}

/**
 * Check if organization has access to a specific feature
 */
export async function enforceFeature(
  organizationId: string,
  feature: keyof PlanFeatures['features']
): Promise<{ allowed: boolean; plan: PlanName; message?: string }> {
  const subscription = await getOrganizationSubscription(organizationId);
  const plan = subscription?.plan || 'free';
  const allowed = hasFeature(plan, feature);

  const featureNames: Record<keyof PlanFeatures['features'], string> = {
    customBranding: 'Custom Branding',
    advancedAnalytics: 'Advanced Analytics',
    prioritySupport: 'Priority Support',
    ssoIntegration: 'SSO Integration',
    apiAccess: 'API Access',
    customIntegrations: 'Custom Integrations',
  };

  if (!allowed) {
    log.info('Feature not available', { organizationId, plan, feature });
  }

  return {
    allowed,
    plan,
    message: allowed ? undefined : `${featureNames[feature]} is not available on your current plan. Upgrade to access this feature.`,
  };
}

/**
 * Get organization's current usage stats
 */
export async function getUsageStats(organizationId: string): Promise<{
  pods: { current: number; limit: number };
  seats: { current: number; limit: number };
  plan: PlanName;
}> {
  const supabase = await createClient();

  // Get subscription
  const subscription = await getOrganizationSubscription(organizationId);
  const plan = subscription?.plan || 'free';
  const planFeatures = PLANS[plan];

  // Count pods
  const { count: podCount } = await supabase
    .from('pods')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId);

  // Count members
  const { count: memberCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId);

  return {
    pods: { current: podCount || 0, limit: planFeatures.maxPods },
    seats: { current: memberCount || 0, limit: planFeatures.maxSeats },
    plan,
  };
}
