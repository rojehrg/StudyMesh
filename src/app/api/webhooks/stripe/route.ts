import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { stripe, updateSubscriptionFromStripe, logBillingEvent } from '@/lib/billing';
import { createLogger } from '@/lib/logger';

const log = createLogger({ service: 'stripe-webhook' });

/**
 * Create a Supabase client with service role for webhook processing.
 * Webhooks don't have user context, so we need admin privileges.
 */
function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase service role credentials');
  }

  return createSupabaseClient(url, serviceRoleKey);
}

/**
 * Check if an event has already been processed (idempotency check).
 * Returns true if the event should be skipped.
 */
async function isEventAlreadyProcessed(eventId: string): Promise<boolean> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('billing_events')
    .select('id')
    .eq('stripe_event_id', eventId)
    .maybeSingle();

  if (error) {
    // If there's an error checking, we should proceed cautiously
    log.warn('Error checking event idempotency', { eventId, error: error.message });
    return false;
  }

  return data !== null;
}

/**
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events for subscription management.
 *
 * Events handled:
 * - checkout.session.completed: New subscription created via checkout
 * - customer.subscription.created/updated: Plan changes, renewals
 * - customer.subscription.deleted: Cancellation
 * - invoice.paid: Successful payment
 * - invoice.payment_failed: Failed payment (for dunning)
 */
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  // Verify webhook signature is present
  if (!signature) {
    log.warn('Missing Stripe signature');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  // Verify webhook secret is configured
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    log.error('STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  // Verify webhook signature
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Webhook signature verification failed', { error: errorMessage });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  log.info('Received Stripe event', { type: event.type, id: event.id });

  // Idempotency check - skip if already processed
  const alreadyProcessed = await isEventAlreadyProcessed(event.id);
  if (alreadyProcessed) {
    log.info('Event already processed, skipping', { eventId: event.id });
    return NextResponse.json({ received: true, skipped: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session, event.id);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription, event.id, event.type);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription, event.id);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice, event.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice, event.id);
        break;
      }

      default:
        log.info('Unhandled event type', { type: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Error processing webhook', { type: event.type, error: errorMessage });
    // Return 500 so Stripe will retry the webhook
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

/**
 * Handle checkout.session.completed - New subscription created via checkout
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session, eventId: string) {
  const organizationId = session.metadata?.organizationId;
  if (!organizationId) {
    log.warn('Missing organizationId in checkout session', { sessionId: session.id });
    return;
  }

  const supabase = createServiceRoleClient();

  // Update customer ID if not already set
  if (session.customer && typeof session.customer === 'string') {
    const { error } = await supabase
      .from('organizations')
      .update({
        stripe_customer_id: session.customer,
        updated_at: new Date().toISOString(),
      })
      .eq('id', organizationId);

    if (error) {
      log.error('Failed to update customer ID', { organizationId, error: error.message });
    }
  }

  // Log the checkout event for audit trail
  await logBillingEvent(organizationId, eventId, 'checkout.session.completed', {
    sessionId: session.id,
    customerId: session.customer,
    subscriptionId: session.subscription,
    amountTotal: session.amount_total,
    currency: session.currency,
  });

  // Note: The actual subscription creation is handled by subscription.created event
  log.info('Checkout completed', { organizationId, sessionId: session.id });
}

/**
 * Handle subscription created/updated events
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  eventId: string,
  eventType: string
) {
  const supabase = createServiceRoleClient();

  // Extract customer ID from subscription
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer.id;

  // Find organization by customer ID
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, subscription_plan')
    .eq('stripe_customer_id', customerId)
    .single();

  if (orgError || !org) {
    log.warn('Organization not found for customer', { customerId, error: orgError?.message });
    return;
  }

  const oldPlan = org.subscription_plan || 'free';

  // Update subscription details using the billing helper
  await updateSubscriptionFromStripe(subscription, org.id);

  // Determine the new plan for audit logging
  const priceId = subscription.items.data[0]?.price.id;
  let newPlan = 'free';
  if (priceId === process.env.STRIPE_PRICE_STARTER_MONTHLY || priceId === process.env.STRIPE_PRICE_STARTER_YEARLY) {
    newPlan = 'starter';
  } else if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY || priceId === process.env.STRIPE_PRICE_PRO_YEARLY) {
    newPlan = 'pro';
  } else if (priceId === process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || priceId === process.env.STRIPE_PRICE_ENTERPRISE_YEARLY) {
    newPlan = 'enterprise';
  }

  // Log billing event for audit trail
  await logBillingEvent(org.id, eventId, eventType, {
    subscriptionId: subscription.id,
    status: subscription.status,
    plan: newPlan,
    seats: subscription.items.data[0]?.quantity || 1,
    currentPeriodEnd: (subscription as unknown as { current_period_end: number }).current_period_end,
    cancelAtPeriodEnd: (subscription as unknown as { cancel_at_period_end: boolean }).cancel_at_period_end,
  });

  if (eventType === 'customer.subscription.created') {
    log.info('Subscription created', { organizationId: org.id, plan: newPlan });
  } else if (oldPlan !== newPlan) {
    log.info('Subscription updated', { organizationId: org.id, oldPlan, newPlan });
  }
}

/**
 * Handle subscription canceled
 */
async function handleSubscriptionCanceled(subscription: Stripe.Subscription, eventId: string) {
  const supabase = createServiceRoleClient();

  // Extract customer ID from subscription
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer.id;

  // Find organization by customer ID
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, subscription_plan')
    .eq('stripe_customer_id', customerId)
    .single();

  if (orgError || !org) {
    log.warn('Organization not found for canceled subscription', { customerId, error: orgError?.message });
    return;
  }

  const previousPlan = org.subscription_plan || 'unknown';

  // Reset to free plan
  const { error: updateError } = await supabase
    .from('organizations')
    .update({
      subscription_status: 'canceled',
      subscription_plan: 'free',
      subscription_seats: 1,
      stripe_subscription_id: null,
      subscription_period_end: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', org.id);

  if (updateError) {
    log.error('Failed to update organization after cancellation', { organizationId: org.id, error: updateError.message });
    throw updateError;
  }

  // Log billing event for audit trail
  await logBillingEvent(org.id, eventId, 'customer.subscription.deleted', {
    subscriptionId: subscription.id,
    previousPlan,
    canceledAt: (subscription as unknown as { canceled_at: number | null }).canceled_at,
  });

  log.info('Subscription canceled, reverted to free', { organizationId: org.id, previousPlan });
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaid(invoice: Stripe.Invoice, eventId: string) {
  // Type assertion for Stripe invoice properties
  const inv = invoice as Stripe.Invoice & {
    subscription?: string | null;
    amount_paid?: number;
  };

  // Skip if not related to a subscription
  if (!inv.subscription) {
    log.info('Invoice not related to subscription, skipping', { invoiceId: inv.id });
    return;
  }

  const supabase = createServiceRoleClient();

  // Extract customer ID from invoice
  const customerId = typeof inv.customer === 'string'
    ? inv.customer
    : (inv.customer as Stripe.Customer | null)?.id;

  if (!customerId) {
    log.warn('Missing customer ID in invoice', { invoiceId: inv.id });
    return;
  }

  // Find organization by customer ID
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, subscription_status')
    .eq('stripe_customer_id', customerId)
    .single();

  if (orgError || !org) {
    log.warn('Organization not found for invoice', { customerId, error: orgError?.message });
    return;
  }

  // Ensure subscription is marked as active (payment successful clears past_due status)
  const { error: updateError } = await supabase
    .from('organizations')
    .update({
      subscription_status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', org.id);

  if (updateError) {
    log.error('Failed to update subscription status after payment', { organizationId: org.id, error: updateError.message });
  }

  // Log billing event for audit trail
  await logBillingEvent(org.id, eventId, 'invoice.paid', {
    invoiceId: inv.id,
    subscriptionId: inv.subscription,
    amountPaid: inv.amount_paid,
    currency: inv.currency,
    previousStatus: org.subscription_status,
  });

  log.info('Invoice paid', {
    organizationId: org.id,
    invoiceId: inv.id,
    amount: inv.amount_paid,
  });
}

/**
 * Handle failed invoice payment (dunning)
 *
 * When payment fails, we mark the subscription as past_due.
 * Stripe will automatically retry payment according to your retry settings.
 * After all retries fail, Stripe sends customer.subscription.deleted.
 */
async function handlePaymentFailed(invoice: Stripe.Invoice, eventId: string) {
  // Type assertion for Stripe invoice properties
  const inv = invoice as Stripe.Invoice & {
    subscription?: string | null;
    attempt_count?: number;
    next_payment_attempt?: number | null;
  };

  // Skip if not related to a subscription
  if (!inv.subscription) {
    log.info('Failed invoice not related to subscription, skipping', { invoiceId: inv.id });
    return;
  }

  const supabase = createServiceRoleClient();

  // Extract customer ID from invoice
  const customerId = typeof inv.customer === 'string'
    ? inv.customer
    : (inv.customer as Stripe.Customer | null)?.id;

  if (!customerId) {
    log.warn('Missing customer ID in failed invoice', { invoiceId: inv.id });
    return;
  }

  // Find organization by customer ID
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, subscription_status')
    .eq('stripe_customer_id', customerId)
    .single();

  if (orgError || !org) {
    log.warn('Organization not found for failed invoice', { customerId, error: orgError?.message });
    return;
  }

  // Mark subscription as past_due (triggers dunning flow in app)
  const { error: updateError } = await supabase
    .from('organizations')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('id', org.id);

  if (updateError) {
    log.error('Failed to update subscription status after payment failure', { organizationId: org.id, error: updateError.message });
  }

  // Log billing event for audit trail
  await logBillingEvent(org.id, eventId, 'invoice.payment_failed', {
    invoiceId: inv.id,
    subscriptionId: inv.subscription,
    attemptCount: inv.attempt_count,
    nextPaymentAttempt: inv.next_payment_attempt
      ? new Date(inv.next_payment_attempt * 1000).toISOString()
      : null,
    previousStatus: org.subscription_status,
  });

  log.warn('Payment failed', {
    organizationId: org.id,
    invoiceId: inv.id,
    attemptCount: inv.attempt_count,
    nextRetry: inv.next_payment_attempt
      ? new Date(inv.next_payment_attempt * 1000).toISOString()
      : 'none',
  });
}
