import { NextResponse } from 'next/server';
import { Webhook } from 'standardwebhooks';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { audit } from '@/lib/audit';
import { createLogger } from '@/lib/logger';

const log = createLogger({ service: 'billing' });

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
 * Log billing event for audit trail
 */
async function logBillingEvent(
  organizationId: string,
  eventId: string,
  eventType: string,
  eventData: Record<string, unknown>
) {
  const supabase = createServiceRoleClient();

  const { error } = await supabase.from('billing_events').insert({
    organization_id: organizationId,
    stripe_event_id: eventId, // Reusing this field for Dodo event IDs
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
 * Find organization by customer email or metadata user_id
 */
async function findOrganizationByCustomer(
  customerEmail?: string,
  metadataUserId?: string
): Promise<{ id: string; subscription_plan: string | null } | null> {
  const supabase = createServiceRoleClient();

  // First, try to find by metadata user_id (most reliable)
  if (metadataUserId) {
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', metadataUserId)
      .single();

    if (!membershipError && membership) {
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('id, subscription_plan')
        .eq('id', membership.organization_id)
        .single();

      if (!orgError && org) {
        return org;
      }
    }
  }

  // Fallback: find by customer email via profiles
  if (customerEmail) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('email', customerEmail)
      .single();

    if (!profileError && profile?.organization_id) {
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('id, subscription_plan')
        .eq('id', profile.organization_id)
        .single();

      if (!orgError && org) {
        return org;
      }
    }
  }

  return null;
}

/**
 * Determine plan from product/subscription metadata
 */
function determinePlan(metadata?: Record<string, unknown>): string {
  const planMapping: Record<string, string> = {
    starter: 'starter',
    pro: 'pro',
    enterprise: 'enterprise',
  };

  if (metadata?.plan && typeof metadata.plan === 'string') {
    return planMapping[metadata.plan.toLowerCase()] || 'starter';
  }

  return 'starter'; // Default to starter if no plan metadata
}

// Helper type for safely accessing nested properties
interface DodoWebhookData {
  subscription_id?: string;
  customer_id?: string;
  customer?: {
    email?: string;
    customer_id?: string;
  };
  metadata?: Record<string, unknown>;
  current_period_end?: string | number | Date | null;
  payment_id?: string;
  amount?: number;
  currency?: string;
  error_message?: string;
}

interface DodoWebhookPayload {
  type: string;
  data: DodoWebhookData;
}

/**
 * Handle subscription.active - New subscription activated
 */
async function handleSubscriptionActive(
  data: DodoWebhookData,
  eventId: string
) {
  const customerEmail = data.customer?.email;
  const metadataUserId = data.metadata?.user_id as string | undefined;
  const subscriptionId = data.subscription_id;
  const customerId = data.customer_id || data.customer?.customer_id;
  const periodEnd = data.current_period_end;

  const org = await findOrganizationByCustomer(customerEmail, metadataUserId);
  if (!org) {
    log.warn('Organization not found for subscription.active', { customerEmail, metadataUserId });
    return;
  }

  const plan = determinePlan(data.metadata);
  const supabase = createServiceRoleClient();

  let periodEndIso: string | null = null;
  if (periodEnd) {
    if (typeof periodEnd === 'number') {
      periodEndIso = new Date(periodEnd * 1000).toISOString();
    } else if (periodEnd instanceof Date) {
      periodEndIso = periodEnd.toISOString();
    } else if (typeof periodEnd === 'string') {
      periodEndIso = new Date(periodEnd).toISOString();
    }
  }

  const { error } = await supabase
    .from('organizations')
    .update({
      subscription_status: 'active',
      subscription_plan: plan,
      dodo_subscription_id: subscriptionId,
      dodo_customer_id: customerId,
      subscription_period_end: periodEndIso,
      updated_at: new Date().toISOString(),
    })
    .eq('id', org.id);

  if (error) {
    log.error('Failed to update organization for subscription.active', { organizationId: org.id, error: error.message });
    throw error;
  }

  // Log billing event
  await logBillingEvent(org.id, eventId, 'subscription.active', {
    subscriptionId,
    customerId,
    plan,
    periodEnd: periodEndIso,
  });

  // Audit trail
  await audit.subscriptionCreated(org.id, null, plan);

  log.info('Subscription activated', { organizationId: org.id, plan, subscriptionId });
}

/**
 * Handle subscription.renewed - Subscription renewed
 */
async function handleSubscriptionRenewed(
  data: DodoWebhookData,
  eventId: string
) {
  const customerEmail = data.customer?.email;
  const metadataUserId = data.metadata?.user_id as string | undefined;
  const subscriptionId = data.subscription_id;
  const periodEnd = data.current_period_end;

  const org = await findOrganizationByCustomer(customerEmail, metadataUserId);
  if (!org) {
    log.warn('Organization not found for subscription.renewed', { customerEmail, metadataUserId });
    return;
  }

  const supabase = createServiceRoleClient();

  let periodEndIso: string | null = null;
  if (periodEnd) {
    if (typeof periodEnd === 'number') {
      periodEndIso = new Date(periodEnd * 1000).toISOString();
    } else if (periodEnd instanceof Date) {
      periodEndIso = periodEnd.toISOString();
    } else if (typeof periodEnd === 'string') {
      periodEndIso = new Date(periodEnd).toISOString();
    }
  }

  const { error } = await supabase
    .from('organizations')
    .update({
      subscription_status: 'active',
      subscription_period_end: periodEndIso,
      updated_at: new Date().toISOString(),
    })
    .eq('id', org.id);

  if (error) {
    log.error('Failed to update organization for subscription.renewed', { organizationId: org.id, error: error.message });
    throw error;
  }

  // Log billing event
  await logBillingEvent(org.id, eventId, 'subscription.renewed', {
    subscriptionId,
    periodEnd: periodEndIso,
  });

  log.info('Subscription renewed', { organizationId: org.id, subscriptionId, periodEnd: periodEndIso });
}

/**
 * Handle subscription.on_hold - Payment past due
 */
async function handleSubscriptionOnHold(
  data: DodoWebhookData,
  eventId: string
) {
  const customerEmail = data.customer?.email;
  const metadataUserId = data.metadata?.user_id as string | undefined;
  const subscriptionId = data.subscription_id;

  const org = await findOrganizationByCustomer(customerEmail, metadataUserId);
  if (!org) {
    log.warn('Organization not found for subscription.on_hold', { customerEmail, metadataUserId });
    return;
  }

  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from('organizations')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('id', org.id);

  if (error) {
    log.error('Failed to update organization for subscription.on_hold', { organizationId: org.id, error: error.message });
    throw error;
  }

  // Log billing event
  await logBillingEvent(org.id, eventId, 'subscription.on_hold', {
    subscriptionId,
    previousStatus: org.subscription_plan,
  });

  log.warn('Subscription on hold (past due)', { organizationId: org.id, subscriptionId });
}

/**
 * Handle subscription.cancelled - Subscription canceled
 */
async function handleSubscriptionCancelled(
  data: DodoWebhookData,
  eventId: string
) {
  const customerEmail = data.customer?.email;
  const metadataUserId = data.metadata?.user_id as string | undefined;
  const subscriptionId = data.subscription_id;

  const org = await findOrganizationByCustomer(customerEmail, metadataUserId);
  if (!org) {
    log.warn('Organization not found for subscription.cancelled', { customerEmail, metadataUserId });
    return;
  }

  const previousPlan = org.subscription_plan || 'unknown';
  const supabase = createServiceRoleClient();

  // Reset to free plan
  const { error } = await supabase
    .from('organizations')
    .update({
      subscription_status: 'canceled',
      subscription_plan: 'free',
      subscription_seats: 1,
      dodo_subscription_id: null,
      subscription_period_end: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', org.id);

  if (error) {
    log.error('Failed to update organization for subscription.cancelled', { organizationId: org.id, error: error.message });
    throw error;
  }

  // Log billing event
  await logBillingEvent(org.id, eventId, 'subscription.cancelled', {
    subscriptionId,
    previousPlan,
  });

  // Audit trail
  await audit.subscriptionCancelled(org.id, null);

  log.info('Subscription cancelled, reverted to free', { organizationId: org.id, previousPlan });
}

/**
 * Handle payment.succeeded - Successful payment
 */
async function handlePaymentSucceeded(
  data: DodoWebhookData,
  eventId: string
) {
  const customerEmail = data.customer?.email;
  const metadataUserId = data.metadata?.user_id as string | undefined;
  const paymentId = data.payment_id;
  const amount = data.amount;
  const currency = data.currency;

  const org = await findOrganizationByCustomer(customerEmail, metadataUserId);
  if (!org) {
    log.warn('Organization not found for payment.succeeded', { customerEmail, metadataUserId });
    return;
  }

  // Log billing event
  await logBillingEvent(org.id, eventId, 'payment.succeeded', {
    paymentId,
    amount,
    currency,
  });

  log.info('Payment succeeded', {
    organizationId: org.id,
    paymentId,
    amount,
    currency,
  });
}

/**
 * Handle payment.failed - Failed payment
 */
async function handlePaymentFailed(
  data: DodoWebhookData,
  eventId: string
) {
  const customerEmail = data.customer?.email;
  const metadataUserId = data.metadata?.user_id as string | undefined;
  const paymentId = data.payment_id;
  const errorMessage = data.error_message;

  const org = await findOrganizationByCustomer(customerEmail, metadataUserId);
  if (!org) {
    log.warn('Organization not found for payment.failed', { customerEmail, metadataUserId });
    return;
  }

  // Log billing event
  await logBillingEvent(org.id, eventId, 'payment.failed', {
    paymentId,
    errorMessage,
  });

  log.warn('Payment failed', {
    organizationId: org.id,
    paymentId,
    errorMessage,
  });
}

/**
 * POST /api/webhooks/dodo
 *
 * Handles Dodo Payments webhook events for subscription management.
 *
 * Events handled:
 * - subscription.active: New subscription activated
 * - subscription.renewed: Subscription renewed
 * - subscription.on_hold: Payment past due
 * - subscription.cancelled: Subscription canceled
 * - payment.succeeded: Successful payment
 * - payment.failed: Failed payment
 */
export async function POST(request: Request) {
  const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY;

  if (!webhookKey) {
    log.error('DODO_PAYMENTS_WEBHOOK_KEY not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  // Get headers for verification
  const webhookId = request.headers.get('webhook-id') || '';
  const webhookSignature = request.headers.get('webhook-signature') || '';
  const webhookTimestamp = request.headers.get('webhook-timestamp') || '';

  // Get raw body for signature verification
  const rawBody = await request.text();

  // Verify webhook signature
  try {
    const webhook = new Webhook(webhookKey);
    webhook.verify(rawBody, {
      'webhook-id': webhookId,
      'webhook-signature': webhookSignature,
      'webhook-timestamp': webhookTimestamp,
    });
  } catch (error) {
    log.error('Webhook signature verification failed', { error });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Parse payload
  let payload: DodoWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch (error) {
    log.error('Failed to parse webhook payload', { error });
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const eventType = payload.type;
  const data = payload.data;
  const eventId = data.payment_id || data.subscription_id || `dodo_${Date.now()}`;

  log.info('Received Dodo event', { type: eventType, id: eventId });

  try {
    switch (eventType) {
      case 'subscription.active':
        await handleSubscriptionActive(data, eventId);
        break;

      case 'subscription.renewed':
        await handleSubscriptionRenewed(data, eventId);
        break;

      case 'subscription.on_hold':
        await handleSubscriptionOnHold(data, eventId);
        break;

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(data, eventId);
        break;

      case 'payment.succeeded':
        await handlePaymentSucceeded(data, eventId);
        break;

      case 'payment.failed':
        await handlePaymentFailed(data, eventId);
        break;

      default:
        log.info('Unhandled Dodo event type', { type: eventType });
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Error processing Dodo webhook', { type: eventType, error: errorMessage });
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
