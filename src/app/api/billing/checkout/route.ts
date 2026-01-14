import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import DodoPayments from 'dodopayments';
import { createLogger } from '@/lib/logger';
import { getUserOrgContext, hasPermission, Permission } from '@/lib/rbac';

const log = createLogger({ service: 'billing', action: 'checkout' });

// Initialize Dodo Payments client lazily to avoid build-time errors
function getDodoClient() {
  if (!process.env.DODO_PAYMENTS_API_KEY) {
    throw new Error('DODO_PAYMENTS_API_KEY is not configured');
  }
  return new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: process.env.NODE_ENV === 'production' ? 'live_mode' : 'test_mode',
  });
}

// Plan to Dodo Product ID mapping
const DODO_PRODUCT_IDS: Record<string, string | undefined> = {
  starter: process.env.DODO_PRODUCT_STARTER,
  pro: process.env.DODO_PRODUCT_PRO,
  enterprise: process.env.DODO_PRODUCT_ENTERPRISE,
};

type PlanName = 'starter' | 'pro' | 'enterprise';

/**
 * POST /api/billing/checkout
 *
 * Creates a Dodo Payments subscription with payment link.
 */
export async function POST(request: Request) {
  try {
    // Check if user has permission to manage billing (owner or admin)
    const context = await getUserOrgContext();
    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(context.role, Permission.BILLING_MANAGE)) {
      return NextResponse.json({ error: 'Permission denied: billing management requires owner or admin role' }, { status: 403 });
    }

    const body = await request.json();
    const { plan } = body as {
      plan: PlanName;
    };

    if (!plan || !['starter', 'pro', 'enterprise'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get user's email for Dodo customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('user_id', context.userId)
      .single();

    // Get organization details
    const { data: org } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('id', context.organizationId)
      .single();

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 });
    }

    // Get user's auth email as fallback
    const { data: { user } } = await supabase.auth.getUser();

    const userEmail = profile?.email || user?.email;
    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // Build user name from profile or fallback
    const userName = profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : org.name;

    // Get the appropriate Dodo product ID
    const productId = DODO_PRODUCT_IDS[plan];

    if (!productId) {
      log.error('Dodo Product ID not configured', { plan });
      return NextResponse.json({ error: 'Product not configured' }, { status: 500 });
    }

    // Create subscription with payment link
    const client = getDodoClient();
    const subscription = await client.subscriptions.create({
      billing: {
        country: 'US', // Default country, Dodo will collect full address during checkout
      },
      customer: {
        email: userEmail,
        name: userName,
      },
      product_id: productId,
      quantity: 1,
      payment_link: true,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      metadata: {
        organization_id: org.id,
        user_id: context.userId,
      },
    });

    log.info('Created Dodo subscription with payment link', {
      organizationId: org.id,
      plan,
      subscriptionId: subscription.subscription_id,
    });

    return NextResponse.json({
      success: true,
      url: subscription.payment_link,
    });
  } catch (error: any) {
    log.error('Checkout error', { error: error.message });
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}
