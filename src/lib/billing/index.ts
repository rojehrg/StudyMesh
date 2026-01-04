/**
 * Billing & Subscription Management
 *
 * Plan definitions and Stripe integration utilities.
 */

import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { createLogger } from '@/lib/logger';

const log = createLogger({ service: 'billing' });

// Lazy-init Stripe to avoid build-time errors when env vars aren't available
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

// For backwards compatibility
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop];
  },
});

// Plan definitions
export type PlanName = 'free' | 'starter' | 'pro' | 'enterprise';

export interface PlanFeatures {
  maxSeats: number;
  maxPods: number;
  features: {
    customBranding: boolean;
    advancedAnalytics: boolean;
    prioritySupport: boolean;
    ssoIntegration: boolean;
    apiAccess: boolean;
    customIntegrations: boolean;
  };
  pricePerSeatMonthly: number; // in cents
  pricePerSeatYearly: number; // in cents (annual total / 12)
}

export const PLANS: Record<PlanName, PlanFeatures> = {
  free: {
    maxSeats: 5,
    maxPods: 2,
    features: {
      customBranding: false,
      advancedAnalytics: false,
      prioritySupport: false,
      ssoIntegration: false,
      apiAccess: false,
      customIntegrations: false,
    },
    pricePerSeatMonthly: 0,
    pricePerSeatYearly: 0,
  },
  starter: {
    maxSeats: 20,
    maxPods: 10,
    features: {
      customBranding: false,
      advancedAnalytics: true,
      prioritySupport: false,
      ssoIntegration: false,
      apiAccess: false,
      customIntegrations: false,
    },
    pricePerSeatMonthly: 800, // $8/seat/month
    pricePerSeatYearly: 640, // ~$6.40/seat/month when billed annually
  },
  pro: {
    maxSeats: 100,
    maxPods: 50,
    features: {
      customBranding: true,
      advancedAnalytics: true,
      prioritySupport: true,
      ssoIntegration: false,
      apiAccess: true,
      customIntegrations: false,
    },
    pricePerSeatMonthly: 1500, // $15/seat/month
    pricePerSeatYearly: 1200, // $12/seat/month when billed annually
  },
  enterprise: {
    maxSeats: -1, // Unlimited
    maxPods: -1, // Unlimited
    features: {
      customBranding: true,
      advancedAnalytics: true,
      prioritySupport: true,
      ssoIntegration: true,
      apiAccess: true,
      customIntegrations: true,
    },
    pricePerSeatMonthly: 2500, // $25/seat/month (custom pricing usually)
    pricePerSeatYearly: 2000, // $20/seat/month when billed annually
  },
};

/**
 * Get organization's subscription details
 */
export async function getOrganizationSubscription(organizationId: string) {
  const supabase = await createClient();

  const { data: org, error } = await supabase
    .from('organizations')
    .select('stripe_customer_id, stripe_subscription_id, subscription_status, subscription_plan, subscription_seats, subscription_period_end')
    .eq('id', organizationId)
    .single();

  if (error || !org) {
    log.error('Failed to get org subscription', { organizationId, error: error?.message });
    return null;
  }

  const plan = (org.subscription_plan as PlanName) || 'free';
  const features = PLANS[plan];

  return {
    stripeCustomerId: org.stripe_customer_id,
    stripeSubscriptionId: org.stripe_subscription_id,
    status: org.subscription_status || 'inactive',
    plan,
    seats: org.subscription_seats || 1,
    periodEnd: org.subscription_period_end ? new Date(org.subscription_period_end) : null,
    features,
  };
}

/**
 * Create or get Stripe customer for organization
 */
export async function getOrCreateStripeCustomer(
  organizationId: string,
  ownerEmail: string,
  organizationName: string
): Promise<string | null> {
  const supabase = await createClient();

  // Check if customer already exists
  const { data: org } = await supabase
    .from('organizations')
    .select('stripe_customer_id')
    .eq('id', organizationId)
    .single();

  if (org?.stripe_customer_id) {
    return org.stripe_customer_id;
  }

  try {
    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: ownerEmail,
      name: organizationName,
      metadata: {
        organizationId,
      },
    });

    // Save customer ID
    await supabase
      .from('organizations')
      .update({
        stripe_customer_id: customer.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', organizationId);

    log.info('Created Stripe customer', { organizationId, customerId: customer.id });
    return customer.id;
  } catch (error: any) {
    log.error('Failed to create Stripe customer', { organizationId, error: error.message });
    return null;
  }
}

/**
 * Update organization subscription from Stripe data
 */
export async function updateSubscriptionFromStripe(
  subscription: Stripe.Subscription,
  organizationId: string
) {
  const supabase = await createClient();

  // Determine plan from price ID
  const priceId = subscription.items.data[0]?.price.id;
  let plan: PlanName = 'free';

  if (priceId === process.env.STRIPE_PRICE_STARTER_MONTHLY || priceId === process.env.STRIPE_PRICE_STARTER_YEARLY) {
    plan = 'starter';
  } else if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY || priceId === process.env.STRIPE_PRICE_PRO_YEARLY) {
    plan = 'pro';
  } else if (priceId === process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || priceId === process.env.STRIPE_PRICE_ENTERPRISE_YEARLY) {
    plan = 'enterprise';
  }

  // Get seat quantity
  const seats = subscription.items.data[0]?.quantity || 1;

  // Type assertion needed as Stripe types may vary with API version
  const currentPeriodEnd = (subscription as any).current_period_end;

  const { error } = await supabase
    .from('organizations')
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_plan: plan,
      subscription_seats: seats,
      subscription_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', organizationId);

  if (error) {
    log.error('Failed to update subscription', { organizationId, error: error.message });
    return false;
  }

  log.info('Updated subscription', { organizationId, plan, seats, status: subscription.status });
  return true;
}

/**
 * Log billing event for audit
 */
export async function logBillingEvent(
  organizationId: string,
  stripeEventId: string,
  eventType: string,
  eventData: any
) {
  const supabase = await createClient();

  const { error } = await supabase.from('billing_events').insert({
    organization_id: organizationId,
    stripe_event_id: stripeEventId,
    event_type: eventType,
    event_data: eventData,
  });

  if (error) {
    // Duplicate event ID is expected (idempotency)
    if (!error.message.includes('duplicate')) {
      log.error('Failed to log billing event', { organizationId, eventType, error: error.message });
    }
    return false;
  }

  return true;
}

/**
 * Check if organization can add more seats
 */
export function canAddSeats(plan: PlanName, currentSeats: number, additionalSeats: number): boolean {
  const maxSeats = PLANS[plan].maxSeats;
  if (maxSeats === -1) return true; // Unlimited
  return currentSeats + additionalSeats <= maxSeats;
}

/**
 * Check if organization can add more pods
 */
export function canAddPods(plan: PlanName, currentPods: number): boolean {
  const maxPods = PLANS[plan].maxPods;
  if (maxPods === -1) return true; // Unlimited
  return currentPods < maxPods;
}

/**
 * Check if organization has a specific feature
 */
export function hasFeature(plan: PlanName, feature: keyof PlanFeatures['features']): boolean {
  return PLANS[plan].features[feature];
}
