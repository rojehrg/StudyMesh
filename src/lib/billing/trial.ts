/**
 * Trial System Utilities
 *
 * Functions for managing 14-day free trials.
 * No credit card required - user is prompted to pay after trial expires.
 */

import { createClient } from '@/lib/supabase/server';
import { PlanName } from './index';
import { createLogger } from '@/lib/logger';

const log = createLogger({ service: 'billing' });

export interface TrialStatus {
  isOnTrial: boolean;
  trialPlan: PlanName | null;
  trialStartedAt: Date | null;
  trialEndsAt: Date | null;
  daysRemaining: number;
  isExpired: boolean;
}

/**
 * Get trial status for an organization
 */
export async function getTrialStatus(organizationId: string): Promise<TrialStatus> {
  const supabase = await createClient();

  const { data: org, error } = await supabase
    .from('organizations')
    .select('trial_plan, trial_started_at, trial_ends_at, subscription_status')
    .eq('id', organizationId)
    .single();

  if (error || !org) {
    log.error('Failed to get trial status', { organizationId, error: error?.message });
    return {
      isOnTrial: false,
      trialPlan: null,
      trialStartedAt: null,
      trialEndsAt: null,
      daysRemaining: 0,
      isExpired: false,
    };
  }

  const trialPlan = org.trial_plan as PlanName | null;
  const trialStartedAt = org.trial_started_at ? new Date(org.trial_started_at) : null;
  const trialEndsAt = org.trial_ends_at ? new Date(org.trial_ends_at) : null;

  // No trial if no trial_plan or trial_ends_at
  if (!trialPlan || !trialEndsAt) {
    return {
      isOnTrial: false,
      trialPlan: null,
      trialStartedAt: null,
      trialEndsAt: null,
      daysRemaining: 0,
      isExpired: false,
    };
  }

  const now = new Date();
  const isExpired = now > trialEndsAt;
  const msRemaining = Math.max(0, trialEndsAt.getTime() - now.getTime());
  const daysRemaining = Math.ceil(msRemaining / (24 * 60 * 60 * 1000));

  // Active trial if subscription_status is 'trialing' and not expired
  const isOnTrial = org.subscription_status === 'trialing' && !isExpired;

  return {
    isOnTrial,
    trialPlan,
    trialStartedAt,
    trialEndsAt,
    daysRemaining,
    isExpired,
  };
}

/**
 * Check if trial is active (not expired)
 */
export function isTrialActive(trialStatus: TrialStatus): boolean {
  return trialStatus.isOnTrial && !trialStatus.isExpired;
}

/**
 * Handle trial expiration - revert to free plan
 * Called by cron job or on-demand when checking limits
 */
export async function handleTrialExpiration(organizationId: string): Promise<boolean> {
  const supabase = await createClient();

  const trialStatus = await getTrialStatus(organizationId);

  if (!trialStatus.isExpired || !trialStatus.trialPlan) {
    return false; // Not expired or not on trial
  }

  // Check if org now has an active paid subscription (they converted during trial)
  const { data: org } = await supabase
    .from('organizations')
    .select('stripe_subscription_id, subscription_status')
    .eq('id', organizationId)
    .single();

  // If they have an active Stripe subscription, don't revert
  if (org?.stripe_subscription_id && org?.subscription_status === 'active') {
    log.info('Trial expired but user converted to paid', { organizationId });
    return false;
  }

  // Revert to free plan
  const { error } = await supabase
    .from('organizations')
    .update({
      subscription_plan: 'free',
      subscription_status: 'inactive',
      updated_at: new Date().toISOString(),
    })
    .eq('id', organizationId);

  if (error) {
    log.error('Failed to revert trial to free', { organizationId, error: error.message });
    return false;
  }

  log.info('Trial expired - reverted to free plan', {
    organizationId,
    previousPlan: trialStatus.trialPlan,
  });

  return true;
}

/**
 * Get the effective plan for an organization
 * Takes into account trial status and expiration
 */
export async function getEffectivePlan(organizationId: string): Promise<PlanName> {
  const supabase = await createClient();

  const { data: org, error } = await supabase
    .from('organizations')
    .select('subscription_plan, subscription_status, trial_plan, trial_ends_at')
    .eq('id', organizationId)
    .single();

  if (error || !org) {
    return 'free';
  }

  // If they have an active subscription, use that plan
  if (org.subscription_status === 'active' && org.subscription_plan) {
    return org.subscription_plan as PlanName;
  }

  // If they're trialing, check if trial is still valid
  if (org.subscription_status === 'trialing' && org.trial_ends_at) {
    const trialEnds = new Date(org.trial_ends_at);
    if (new Date() <= trialEnds) {
      return (org.trial_plan || org.subscription_plan || 'free') as PlanName;
    }

    // Trial expired - trigger reversion (fire and forget)
    handleTrialExpiration(organizationId).catch(() => {});
  }

  return 'free';
}
