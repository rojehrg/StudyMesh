import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/billing';
import { createLogger } from '@/lib/logger';

const log = createLogger({ service: 'billing', action: 'portal' });

/**
 * POST /api/billing/portal
 *
 * Creates a Stripe billing portal session for subscription management.
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'Organization required' }, { status: 400 });
    }

    // Get organization details separately
    const { data: org } = await supabase
      .from('organizations')
      .select('id, owner_id, stripe_customer_id')
      .eq('id', profile.organization_id)
      .single();

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 });
    }

    // Only org owner can access billing portal
    if (org.owner_id !== user.id) {
      return NextResponse.json({ error: 'Only organization owner can manage billing' }, { status: 403 });
    }

    if (!org.stripe_customer_id) {
      return NextResponse.json({ error: 'No billing account found' }, { status: 400 });
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: org.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    });

    log.info('Created billing portal session', { organizationId: org.id });

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error: any) {
    log.error('Billing portal error', { error: error.message });
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 });
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

    // Get organization subscription details
    const { data: org } = await supabase
      .from('organizations')
      .select('id, owner_id, stripe_customer_id, stripe_subscription_id, subscription_status, subscription_plan, subscription_seats, subscription_period_end')
      .eq('id', profile.organization_id)
      .single();

    if (!org) {
      return NextResponse.json({
        success: true,
        subscription: null,
      });
    }

    return NextResponse.json({
      success: true,
      subscription: {
        plan: org.subscription_plan || 'free',
        status: org.subscription_status || 'inactive',
        seats: org.subscription_seats || 1,
        periodEnd: org.subscription_period_end,
        hasStripeCustomer: !!org.stripe_customer_id,
        hasActiveSubscription: !!org.stripe_subscription_id,
        isOwner: org.owner_id === user.id,
      },
    });
  } catch (error: any) {
    log.error('Get subscription error', { error: error.message });
    return NextResponse.json({ error: 'Failed to get subscription' }, { status: 500 });
  }
}
