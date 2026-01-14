import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createLogger } from '@/lib/logger';
import { getUserOrgContext, hasPermission, Permission } from '@/lib/rbac';

const log = createLogger({ service: 'billing', action: 'portal' });

// Support email for subscription management requests
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@attunly.com';

/**
 * POST /api/billing/portal
 *
 * Returns subscription management information.
 * Dodo Payments doesn't have a self-service portal like Stripe,
 * so we provide support contact information instead.
 */
export async function POST() {
  try {
    // Check if user has permission to manage billing (owner or admin)
    const context = await getUserOrgContext();
    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(context.role, Permission.BILLING_MANAGE)) {
      return NextResponse.json({ error: 'Permission denied: billing management requires owner or admin role' }, { status: 403 });
    }

    const supabase = await createClient();

    // Get organization details with Dodo customer info
    const { data: org } = await supabase
      .from('organizations')
      .select('id, dodo_customer_id, dodo_subscription_id, subscription_status, subscription_plan')
      .eq('id', context.organizationId)
      .single();

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 });
    }

    // If no active subscription, redirect to billing page
    if (!org.dodo_subscription_id) {
      return NextResponse.json({
        success: true,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
        message: 'No active subscription found',
      });
    }

    // For now, return support email for subscription management
    // In the future, this could be updated to use Dodo's customer portal if available
    log.info('Billing portal requested', {
      organizationId: org.id,
      subscriptionId: org.dodo_subscription_id
    });

    return NextResponse.json({
      success: true,
      supportEmail: SUPPORT_EMAIL,
      message: 'To manage your subscription, please contact support',
      subscription: {
        status: org.subscription_status,
        plan: org.subscription_plan,
      },
    });
  } catch (error: any) {
    log.error('Billing portal error', { error: error.message });
    return NextResponse.json({ error: 'Failed to get billing information' }, { status: 500 });
  }
}

/**
 * GET /api/billing/portal
 *
 * Returns subscription details for the current organization.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to view billing
    const context = await getUserOrgContext();
    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(context.role, Permission.BILLING_VIEW)) {
      return NextResponse.json({ error: 'Permission denied: billing view requires appropriate role' }, { status: 403 });
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({
        success: true,
        subscription: null,
      });
    }

    // Get organization subscription details including trial info
    const { data: org } = await supabase
      .from('organizations')
      .select('id, owner_id, dodo_customer_id, dodo_subscription_id, subscription_status, subscription_plan, subscription_seats, subscription_period_end, trial_plan, trial_started_at, trial_ends_at')
      .eq('id', profile.organization_id)
      .single();

    if (!org) {
      return NextResponse.json({
        success: true,
        subscription: null,
      });
    }

    // Calculate trial status
    let isOnTrial = false;
    let trialDaysRemaining = 0;
    let effectivePlan = org.subscription_plan || 'free';

    if (org.subscription_status === 'trialing' && org.trial_ends_at) {
      const trialEnds = new Date(org.trial_ends_at);
      const now = new Date();

      if (now <= trialEnds) {
        isOnTrial = true;
        trialDaysRemaining = Math.ceil((trialEnds.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
        effectivePlan = org.trial_plan || org.subscription_plan || 'free';
      }
    }

    return NextResponse.json({
      success: true,
      subscription: {
        plan: effectivePlan,
        status: org.subscription_status || 'inactive',
        seats: org.subscription_seats || 1,
        periodEnd: org.subscription_period_end,
        hasDodoCustomer: !!org.dodo_customer_id,
        hasActiveSubscription: !!org.dodo_subscription_id && org.subscription_status === 'active',
        isOwner: org.owner_id === user.id,
        // Trial info
        isOnTrial,
        trialPlan: org.trial_plan,
        trialEndsAt: org.trial_ends_at,
        trialDaysRemaining,
      },
    });
  } catch (error: any) {
    log.error('Get subscription error', { error: error.message });
    return NextResponse.json({ error: 'Failed to get subscription' }, { status: 500 });
  }
}
