import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe, updateSubscriptionFromStripe, logBillingEvent } from '@/lib/billing';
import { createClient } from '@/lib/supabase/server';
import { createLogger } from '@/lib/logger';

const log = createLogger({ service: 'stripe-webhook' });

/**
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events for subscription management.
 */
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    log.warn('Missing Stripe signature');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    log.error('Webhook signature verification failed', { error: error.message });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  log.info('Received Stripe event', { type: event.type, id: event.id });

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
  } catch (error: any) {
    log.error('Error processing webhook', { type: event.type, error: error.message });
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

  const supabase = await createClient();

  // Update customer ID if not already set
  if (session.customer && typeof session.customer === 'string') {
    await supabase
      .from('organizations')
      .update({
        stripe_customer_id: session.customer,
        updated_at: new Date().toISOString(),
      })
      .eq('id', organizationId);
  }

  // If there's a subscription, it will be handled by subscription.created/updated events
  // Log the checkout event
  await logBillingEvent(organizationId, eventId, 'checkout.session.completed', {
    sessionId: session.id,
    customerId: session.customer,
    subscriptionId: session.subscription,
    amountTotal: session.amount_total,
    currency: session.currency,
  });

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
  // Find organization by customer ID
  const supabase = await createClient();
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer.id;

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!org) {
    log.warn('Organization not found for customer', { customerId });
    return;
  }

  // Update subscription details
  await updateSubscriptionFromStripe(subscription, org.id);

  // Log event
  await logBillingEvent(org.id, eventId, eventType, {
    subscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodEnd: (subscription as any).current_period_end,
    cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
  });
}

/**
 * Handle subscription canceled
 */
async function handleSubscriptionCanceled(subscription: Stripe.Subscription, eventId: string) {
  const supabase = await createClient();
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer.id;

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!org) {
    log.warn('Organization not found for canceled subscription', { customerId });
    return;
  }

  // Reset to free plan
  await supabase
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

  // Log event
  await logBillingEvent(org.id, eventId, 'customer.subscription.deleted', {
    subscriptionId: subscription.id,
    canceledAt: (subscription as any).canceled_at,
  });

  log.info('Subscription canceled, reverted to free', { organizationId: org.id });
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaid(invoice: Stripe.Invoice, eventId: string) {
  const inv = invoice as any;
  if (!inv.subscription) return;

  const supabase = await createClient();
  const customerId = typeof inv.customer === 'string'
    ? inv.customer
    : inv.customer?.id;

  if (!customerId) return;

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!org) return;

  // Ensure subscription is marked as active
  await supabase
    .from('organizations')
    .update({
      subscription_status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', org.id);

  await logBillingEvent(org.id, eventId, 'invoice.paid', {
    invoiceId: inv.id,
    amountPaid: inv.amount_paid,
    currency: inv.currency,
  });

  log.info('Invoice paid', { organizationId: org.id, amount: inv.amount_paid });
}

/**
 * Handle failed invoice payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice, eventId: string) {
  const inv = invoice as any;
  if (!inv.subscription) return;

  const supabase = await createClient();
  const customerId = typeof inv.customer === 'string'
    ? inv.customer
    : inv.customer?.id;

  if (!customerId) return;

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!org) return;

  // Mark as past due
  await supabase
    .from('organizations')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('id', org.id);

  await logBillingEvent(org.id, eventId, 'invoice.payment_failed', {
    invoiceId: inv.id,
    attemptCount: inv.attempt_count,
  });

  log.warn('Payment failed', { organizationId: org.id, invoiceId: inv.id });
}
