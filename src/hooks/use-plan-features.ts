"use client";

import { useState, useEffect, useCallback } from 'react';

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
}

export interface Subscription {
  plan: PlanName;
  status: string;
  seats: number;
  periodEnd: string | null;
  hasStripeCustomer: boolean;
  hasActiveSubscription: boolean;
  isOwner: boolean;
  // Trial info
  isOnTrial?: boolean;
  trialPlan?: PlanName | null;
  trialEndsAt?: string | null;
  trialDaysRemaining?: number;
}

// Plan features definition (client-side copy)
const PLANS: Record<PlanName, PlanFeatures> = {
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
  },
};

/**
 * Hook to access plan features and subscription status
 */
export function usePlanFeatures() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSubscription = useCallback(async () => {
    try {
      const response = await fetch('/api/billing/portal');
      const data = await response.json();

      if (data.success) {
        setSubscription(data.subscription);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to load subscription');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  // Get current plan features
  const plan = subscription?.plan || 'free';
  const features = PLANS[plan];

  // Helper functions
  const hasFeature = useCallback(
    (feature: keyof PlanFeatures['features']): boolean => {
      return features.features[feature];
    },
    [features]
  );

  const canAddSeats = useCallback(
    (additionalSeats: number): boolean => {
      if (!subscription) return false;
      const maxSeats = features.maxSeats;
      if (maxSeats === -1) return true; // Unlimited
      return subscription.seats + additionalSeats <= maxSeats;
    },
    [subscription, features]
  );

  const canAddPods = useCallback(
    (currentPods: number): boolean => {
      const maxPods = features.maxPods;
      if (maxPods === -1) return true; // Unlimited
      return currentPods < maxPods;
    },
    [features]
  );

  const isActive = subscription?.status === 'active' || plan === 'free';
  const isPastDue = subscription?.status === 'past_due';
  const isCanceled = subscription?.status === 'canceled';

  return {
    // Subscription data
    subscription,
    plan,
    features,
    loading,
    error,

    // Status helpers
    isActive,
    isPastDue,
    isCanceled,
    isOwner: subscription?.isOwner || false,

    // Feature checks
    hasFeature,
    canAddSeats,
    canAddPods,

    // Plan info
    maxSeats: features.maxSeats,
    maxPods: features.maxPods,
    currentSeats: subscription?.seats || 1,

    // Refresh function
    refresh: loadSubscription,
  };
}

/**
 * Get plan display name
 */
export function getPlanDisplayName(plan: PlanName): string {
  const names: Record<PlanName, string> = {
    free: 'Free',
    starter: 'Starter',
    pro: 'Pro',
    enterprise: 'Enterprise',
  };
  return names[plan];
}

/**
 * Get plan pricing info for display
 */
export function getPlanPricing(plan: PlanName): { monthly: number; yearly: number } {
  const pricing: Record<PlanName, { monthly: number; yearly: number }> = {
    free: { monthly: 0, yearly: 0 },
    starter: { monthly: 8, yearly: 77 }, // $77/year = ~$6.40/month
    pro: { monthly: 15, yearly: 144 }, // $144/year = $12/month
    enterprise: { monthly: 25, yearly: 240 },
  };
  return pricing[plan];
}
