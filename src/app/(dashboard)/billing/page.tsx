"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard01, ArrowRightMd, Users } from "react-coolicons";
import { Lock, LockOpen, AlertTriangle } from "lucide-react";
import { PageLoader, LottieLoader } from "@/components/loading-states";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { usePlanFeatures, getPlanDisplayName } from "@/hooks/use-plan-features";

interface BillingData {
  plan: string;
  status: string;
  seats: number;
  periodEnd: string | null;
  hasDodoCustomer: boolean;
  hasActiveSubscription: boolean;
  isOwner: boolean;
  isOnTrial?: boolean;
  trialPlan?: string | null;
  trialEndsAt?: string | null;
  trialDaysRemaining?: number;
}

interface UsageStats {
  totalMembers: number;
  momentumLocksThisMonth: number;
  activeLocks: number;
  maxSeats: number;
}

function BillingContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro" | null>(null);
  const [selectedSeats, setSelectedSeats] = useState(10);

  const { subscription, plan, loading: planLoading } = usePlanFeatures();
  const supabase = createClient();

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Get user's profile and org
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();

      if (!profile?.organization_id) {
        router.push("/dashboard");
        return;
      }

      // Check if user is owner or admin
      const { data: org } = await supabase
        .from("organizations")
        .select("id, owner_id, subscription_plan, subscription_status, subscription_seats, subscription_period_end, trial_plan, trial_ends_at, dodo_customer_id, dodo_subscription_id")
        .eq("id", profile.organization_id)
        .single();

      if (!org) {
        router.push("/dashboard");
        return;
      }

      // Check if user is owner
      const isOwner = org.owner_id === user.id;

      // Check if user is admin via organization_members
      const { data: memberData } = await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", org.id)
        .eq("user_id", user.id)
        .maybeSingle();

      const isAdminRole = memberData?.role === "admin" || memberData?.role === "owner";
      const hasAccess = isOwner || isAdminRole;

      if (!hasAccess) {
        toast.error("Access denied. Only owners and admins can view billing.");
        router.push("/dashboard");
        return;
      }

      setIsAdmin(hasAccess);

      // Calculate trial status
      let isOnTrial = false;
      let trialDaysRemaining = 0;
      let effectivePlan = org.subscription_plan || "free";

      if (org.subscription_status === "trialing" && org.trial_ends_at) {
        const trialEnds = new Date(org.trial_ends_at);
        const now = new Date();

        if (now <= trialEnds) {
          isOnTrial = true;
          trialDaysRemaining = Math.ceil((trialEnds.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
          effectivePlan = org.trial_plan || org.subscription_plan || "free";
        }
      }

      setBillingData({
        plan: effectivePlan,
        status: org.subscription_status || "inactive",
        seats: org.subscription_seats || 1,
        periodEnd: org.subscription_period_end,
        hasDodoCustomer: !!org.dodo_customer_id,
        hasActiveSubscription: !!org.dodo_subscription_id && org.subscription_status === "active",
        isOwner,
        isOnTrial,
        trialPlan: org.trial_plan,
        trialEndsAt: org.trial_ends_at,
        trialDaysRemaining,
      });

      // Get usage stats
      const { count: memberCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", org.id);

      // Get momentum locks for this month from the org's Slack workspace
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Get the org's slack_team_id
      const { data: orgWithSlack } = await supabase
        .from("organizations")
        .select("slack_team_id")
        .eq("id", org.id)
        .single();

      let locksThisMonth = 0;
      let activeLocks = 0;

      if (orgWithSlack?.slack_team_id) {
        const { count: monthlyLockCount } = await supabase
          .from("momentum_locks")
          .select("*", { count: "exact", head: true })
          .eq("workspace_id", orgWithSlack.slack_team_id)
          .gte("created_at", startOfMonth.toISOString());

        const { count: activeLocksCount } = await supabase
          .from("momentum_locks")
          .select("*", { count: "exact", head: true })
          .eq("workspace_id", orgWithSlack.slack_team_id)
          .in("status", ["active", "started"]);

        locksThisMonth = monthlyLockCount || 0;
        activeLocks = activeLocksCount || 0;
      }

      // Get max seats for the plan
      const planFeatures: Record<string, number> = {
        free: 5,
        starter: 10, // Flat $19/mo up to 10 seats
        pro: 500, // $8/seat/mo, min 10 seats
        enterprise: -1, // Unlimited, custom pricing
      };

      setUsageStats({
        totalMembers: memberCount || 0,
        momentumLocksThisMonth: locksThisMonth,
        activeLocks,
        maxSeats: planFeatures[effectivePlan] || 5,
      });

    } catch (error) {
      console.error("Error loading billing data:", error);
      toast.error("Failed to load billing information");
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!billingData?.isOwner) {
      toast.error("Only the organization owner can manage billing");
      return;
    }

    setPortalLoading(true);
    try {
      const response = await fetch("/api/billing/portal", { method: "POST" });
      const data = await response.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else if (data.supportEmail) {
        // Dodo doesn't have a self-service portal, show contact info
        toast.info(`To manage your subscription, contact support at ${data.supportEmail}`);
      } else {
        toast.error(data.error || "Failed to open billing portal");
      }
    } catch {
      toast.error("Failed to open billing portal");
    } finally {
      setPortalLoading(false);
    }
  };

  const handleUpgrade = async (plan: "starter" | "pro") => {
    if (!billingData?.isOwner) {
      toast.error("Only the organization owner can upgrade the plan");
      return;
    }

    setCheckoutLoading(true);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          seats: plan === "pro" ? selectedSeats : undefined,
        }),
      });
      const data = await response.json();

      if (data.contactSales) {
        toast.info(data.message);
        return;
      }

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to start checkout");
      }
    } catch {
      toast.error("Failed to start checkout");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const getStatusBadge = (status: string, isOnTrial?: boolean) => {
    if (isOnTrial) {
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">Trial</Badge>;
    }

    // Dodo status values: active, on_hold, cancelled, expired
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100">Active</Badge>;
      case "trialing":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">Trial</Badge>;
      case "on_hold":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">On Hold</Badge>;
      case "cancelled":
      case "canceled":
        return <Badge className="bg-coffee-cream text-coffee-mocha border-coffee-foam hover:bg-coffee-cream">Cancelled</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">Expired</Badge>;
      default:
        return <Badge className="bg-coffee-cream text-coffee-mocha border-coffee-foam hover:bg-coffee-cream">Inactive</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading || planLoading) {
    return <PageLoader />;
  }

  if (!billingData || !usageStats) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <p className="text-coffee-cortado">Unable to load billing information.</p>
      </div>
    );
  }

  const planName = getPlanDisplayName(billingData.plan as any);
  const showUpgrade = billingData.plan === "free" || billingData.plan === "starter";
  const seatUsagePercent = usageStats.maxSeats === -1 ? 0 : (usageStats.totalMembers / usageStats.maxSeats) * 100;

  // Get pricing display for current plan
  const getPricingDisplay = (plan: string) => {
    switch (plan) {
      case "free":
        return "Free forever";
      case "starter":
        return "$19/month (up to 10 seats)";
      case "pro":
        return `$8/seat/month (${billingData.seats} seats = $${billingData.seats * 8}/mo)`;
      case "enterprise":
        return "Custom pricing";
      default:
        return "Free";
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-coffee-espresso">Billing & Usage</h1>
        <p className="text-coffee-cortado mt-1">Manage your subscription and view usage statistics</p>
      </div>

      {/* Subscription Info */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-coffee-espresso">Current Subscription</h2>

        <div className="bg-white rounded-xl border border-coffee-foam p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <p className="text-xl font-semibold text-coffee-espresso">{planName} Plan</p>
                {getStatusBadge(billingData.status, billingData.isOnTrial)}
              </div>
              <p className="text-coffee-cortado">
                {getPricingDisplay(billingData.plan)}
              </p>
            </div>
            {billingData.isOnTrial && billingData.trialDaysRemaining && (
              <div className="text-right">
                <p className="text-sm text-amber-600 font-medium">
                  {billingData.trialDaysRemaining} days left in trial
                </p>
              </div>
            )}
          </div>

          {/* Billing Details */}
          <div className="pt-4 border-t border-coffee-foam space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-coffee-cortado">Status</span>
              <span className="text-coffee-espresso font-medium capitalize">
                {billingData.isOnTrial ? "Trialing" : billingData.status}
              </span>
            </div>
            {billingData.periodEnd && billingData.hasActiveSubscription && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-coffee-cortado">Next billing date</span>
                <span className="text-coffee-espresso font-medium">
                  {formatDate(billingData.periodEnd)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-coffee-cortado">Seat usage</span>
              <span className="text-coffee-espresso font-medium">
                {usageStats.totalMembers} of {usageStats.maxSeats === -1 ? "Unlimited" : usageStats.maxSeats} seats used
              </span>
            </div>
          </div>

          {/* Seat Usage Bar */}
          {usageStats.maxSeats !== -1 && (
            <div className="space-y-2">
              <div className="w-full bg-coffee-cream rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    seatUsagePercent >= 90 ? "bg-red-400" : seatUsagePercent >= 70 ? "bg-amber-400" : "bg-coffee-mocha"
                  }`}
                  style={{ width: `${Math.min(seatUsagePercent, 100)}%` }}
                />
              </div>
              {seatUsagePercent >= 90 && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span>You are approaching your seat limit. Consider upgrading.</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-coffee-foam flex flex-wrap gap-3">
            {billingData.hasActiveSubscription && billingData.isOwner && (
              <Button
                variant="outline"
                onClick={handleManageSubscription}
                disabled={portalLoading}
              >
                {portalLoading ? (
                  <LottieLoader size="sm" className="w-4 h-4 mr-2" />
                ) : (
                  <CreditCard01 className="w-4 h-4 mr-2" />
                )}
                Manage Subscription
              </Button>
            )}

            {showUpgrade && billingData.isOwner && !selectedPlan && (
              <div className="flex gap-2">
                {billingData.plan === "free" && (
                  <Button
                    onClick={() => setSelectedPlan("starter")}
                    variant="outline"
                    className="border-coffee-foam hover:border-coffee-latte"
                  >
                    Upgrade to Starter
                  </Button>
                )}
                <Button
                  onClick={() => setSelectedPlan("pro")}
                  className="bg-coffee-espresso hover:bg-coffee-mocha text-white"
                >
                  <ArrowRightMd className="w-4 h-4 mr-2" />
                  {billingData.plan === "free" ? "Upgrade to Pro" : "Upgrade to Pro"}
                </Button>
              </div>
            )}

            {/* Plan Selection UI */}
            {selectedPlan && billingData.isOwner && (
              <div className="w-full bg-coffee-cream rounded-lg p-4 space-y-4">
                {selectedPlan === "starter" && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-coffee-espresso">Starter Plan</p>
                        <p className="text-sm text-coffee-cortado">$19/month flat rate, up to 10 seats</p>
                      </div>
                      <p className="text-xl font-bold text-coffee-espresso">$19/mo</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedPlan(null)}
                        className="border-coffee-foam"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleUpgrade("starter")}
                        disabled={checkoutLoading}
                        className="bg-coffee-espresso hover:bg-coffee-mocha text-white"
                      >
                        {checkoutLoading ? (
                          <LottieLoader size="sm" className="w-4 h-4 mr-2" />
                        ) : null}
                        Continue to Checkout
                      </Button>
                    </div>
                  </>
                )}

                {selectedPlan === "pro" && (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-coffee-espresso">Pro Plan</p>
                        <p className="text-sm text-coffee-cortado">$8/seat/month, minimum 10 seats</p>
                      </div>
                      <p className="text-xl font-bold text-coffee-espresso">${selectedSeats * 8}/mo</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="text-sm text-coffee-cortado">Number of seats:</label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSeats(Math.max(10, selectedSeats - 5))}
                          disabled={selectedSeats <= 10}
                          className="border-coffee-foam w-8 h-8 p-0"
                        >
                          -
                        </Button>
                        <input
                          type="number"
                          value={selectedSeats}
                          onChange={(e) => setSelectedSeats(Math.max(10, Math.min(500, parseInt(e.target.value) || 10)))}
                          className="w-20 text-center border border-coffee-foam rounded-md py-1 text-coffee-espresso bg-white"
                          min={10}
                          max={500}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSeats(Math.min(500, selectedSeats + 5))}
                          disabled={selectedSeats >= 500}
                          className="border-coffee-foam w-8 h-8 p-0"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedPlan(null)}
                        className="border-coffee-foam"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleUpgrade("pro")}
                        disabled={checkoutLoading}
                        className="bg-coffee-espresso hover:bg-coffee-mocha text-white"
                      >
                        {checkoutLoading ? (
                          <LottieLoader size="sm" className="w-4 h-4 mr-2" />
                        ) : null}
                        Continue to Checkout
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {!billingData.isOwner && (
              <p className="text-sm text-coffee-cortado">
                Contact your organization owner to manage billing.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Usage Stats */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-coffee-espresso">Usage Statistics</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Members */}
          <div className="bg-white rounded-xl border border-coffee-foam p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-coffee-cream rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-coffee-mocha" />
              </div>
              <p className="text-sm text-coffee-cortado">Team Members</p>
            </div>
            <p className="text-2xl font-bold text-coffee-espresso">
              {usageStats.totalMembers}
            </p>
            <p className="text-xs text-coffee-latte mt-1">
              {usageStats.maxSeats === -1 ? "Unlimited" : `of ${usageStats.maxSeats} seats`}
            </p>
          </div>

          {/* Momentum Locks This Month */}
          <div className="bg-white rounded-xl border border-coffee-foam p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-coffee-cream rounded-lg flex items-center justify-center">
                <LockOpen className="w-5 h-5 text-coffee-mocha" />
              </div>
              <p className="text-sm text-coffee-cortado">Locks This Month</p>
            </div>
            <p className="text-2xl font-bold text-coffee-espresso">
              {usageStats.momentumLocksThisMonth}
            </p>
            <p className="text-xs text-coffee-latte mt-1">Momentum locks created</p>
          </div>

          {/* Active Locks */}
          <div className="bg-white rounded-xl border border-coffee-foam p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-coffee-cream rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-coffee-mocha" />
              </div>
              <p className="text-sm text-coffee-cortado">Active Locks</p>
            </div>
            <p className="text-2xl font-bold text-coffee-espresso">
              {usageStats.activeLocks}
            </p>
            <p className="text-xs text-coffee-latte mt-1">Currently in progress</p>
          </div>
        </div>
      </section>

      {/* Plan Features */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-coffee-espresso">Plan Features</h2>

        <div className="bg-white rounded-xl border border-coffee-foam p-5">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-coffee-cortado">Max Seats</span>
              <span className="text-coffee-espresso font-medium">
                {usageStats.maxSeats === -1 ? "Unlimited" : usageStats.maxSeats}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-coffee-cortado">Custom Branding</span>
              <span className="text-coffee-espresso font-medium">
                {["pro", "enterprise"].includes(billingData.plan) ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-coffee-cortado">Advanced Analytics</span>
              <span className="text-coffee-espresso font-medium">
                {["starter", "pro", "enterprise"].includes(billingData.plan) ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-coffee-cortado">Priority Support</span>
              <span className="text-coffee-espresso font-medium">
                {["pro", "enterprise"].includes(billingData.plan) ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-coffee-cortado">SSO Integration</span>
              <span className="text-coffee-espresso font-medium">
                {billingData.plan === "enterprise" ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-coffee-cortado">API Access</span>
              <span className="text-coffee-espresso font-medium">
                {["pro", "enterprise"].includes(billingData.plan) ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <BillingContent />
    </Suspense>
  );
}
