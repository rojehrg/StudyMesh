import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe, getOrCreateStripeCustomer, PLANS, PlanName } from '@/lib/billing';
import { createLogger } from '@/lib/logger';

const log = createLogger({ service: 'billing', action: 'checkout' });

/**
 * POST /api/billing/checkout
 *
 * Creates a Stripe checkout session for subscription.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plan, billingPeriod = 'monthly', seats = 1 } = body as {
      plan: PlanName;
      billingPeriod: 'monthly' | 'yearly';
      seats: number;
    };

    if (!plan || !['starter', 'pro', 'enterprise'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    if (seats < 1 || seats > 1000) {
      return NextResponse.json({ error: 'Invalid seat count' }, { status: 400 });
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, email')
      .eq('user_id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'Organization required' }, { status: 400 });
    }

    // Get organization details separately
    const { data: org } = await supabase
      .from('organizations')
      .select('id, name, owner_id')
      .eq('id', profile.organization_id)
      .single();

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 });
    }

    // Only org owner can manage billing
    if (org.owner_id !== user.id) {
      return NextResponse.json({ error: 'Only organization owner can manage billing' }, { status: 403 });
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(
      org.id,
      profile.email || user.email!,
      org.name
    );

    if (!customerId) {
      return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
    }

    // Get the appropriate price ID
    const priceId = billingPeriod === 'yearly'
      ? process.env[`STRIPE_PRICE_${plan.toUpperCase()}_YEARLY`]
      : process.env[`STRIPE_PRICE_${plan.toUpperCase()}_MONTHLY`];

    if (!priceId) {
      log.error('Price ID not configured', { plan, billingPeriod });
      return NextResponse.json({ error: 'Price not configured' }, { status: 500 });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: seats,
        },
      ],
      subscription_data: {
        metadata: {
          organizationId: org.id,
          plan,
        },
      },
      metadata: {
        organizationId: org.id,
        plan,
        seats: String(seats),
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=subscription_active`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?canceled=true`,
      allow_promotion_codes: true,
    });

    log.info('Created checkout session', {
      organizationId: org.id,
      plan,
      seats,
      sessionId: session.id,
    });

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error: any) {
    log.error('Checkout error', { error: error.message });
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}
