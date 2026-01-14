"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/loading-states";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { usePlanFeatures } from "@/hooks/use-plan-features";
import Link from "next/link";

interface AnalyticsData {
  // Overview metrics
  totalLocks: number;
  completedLocks: number;
  completionRate: number;
  averageResolutionHours: number | null;
  activeLocks: number;

  // This month stats
  locksThisMonth: number;
  completedThisMonth: number;
  blockedThisMonth: number;
}

function AnalyticsContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  const { hasFeature, loading: planLoading } = usePlanFeatures();
  const supabase = createClient();

  const hasAdvancedAnalytics = hasFeature("advancedAnalytics");

  useEffect(() => {
    if (!planLoading) {
      loadAnalyticsData();
    }
  }, [planLoading]);

  const loadAnalyticsData = async () => {
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

      // Get the org's slack_team_id
      const { data: org } = await supabase
        .from("organizations")
        .select("slack_team_id")
        .eq("id", profile.organization_id)
        .single();

      if (!org?.slack_team_id) {
        // No Slack connected, show empty state
        setAnalyticsData({
          totalLocks: 0,
          completedLocks: 0,
          completionRate: 0,
          averageResolutionHours: null,
          activeLocks: 0,
          locksThisMonth: 0,
          completedThisMonth: 0,
          blockedThisMonth: 0,
        });
        setLoading(false);
        return;
      }

      const workspaceId = org.slack_team_id;

      // Calculate start of month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Fetch all metrics in parallel
      const [
        totalLocksResult,
        completedLocksResult,
        activeLocksResult,
        locksThisMonthResult,
        completedThisMonthResult,
        blockedThisMonthResult,
        resolutionTimesResult,
      ] = await Promise.all([
        // Total locks (all time)
        supabase
          .from("momentum_locks")
          .select("*", { count: "exact", head: true })
          .eq("workspace_id", workspaceId),

        // Completed locks (all time)
        supabase
          .from("momentum_locks")
          .select("*", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .eq("status", "done"),

        // Active locks (current)
        supabase
          .from("momentum_locks")
          .select("*", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .in("status", ["active", "started"]),

        // Locks this month
        supabase
          .from("momentum_locks")
          .select("*", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .gte("created_at", startOfMonth.toISOString()),

        // Completed this month
        supabase
          .from("momentum_locks")
          .select("*", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .eq("status", "done")
          .gte("created_at", startOfMonth.toISOString()),

        // Blocked this month
        supabase
          .from("momentum_locks")
          .select("*", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .eq("status", "blocked")
          .gte("created_at", startOfMonth.toISOString()),

        // Get completed locks with their events for resolution time calculation
        supabase
          .from("momentum_locks")
          .select("id, created_at")
          .eq("workspace_id", workspaceId)
          .eq("status", "done")
          .limit(100),
      ]);

      const totalLocks = totalLocksResult.count || 0;
      const completedLocks = completedLocksResult.count || 0;
      const activeLocks = activeLocksResult.count || 0;
      const locksThisMonth = locksThisMonthResult.count || 0;
      const completedThisMonth = completedThisMonthResult.count || 0;
      const blockedThisMonth = blockedThisMonthResult.count || 0;

      // Calculate completion rate
      const completionRate = totalLocks > 0 ? Math.round((completedLocks / totalLocks) * 100) : 0;

      // Calculate average resolution time from events
      let averageResolutionHours: number | null = null;

      if (resolutionTimesResult.data && resolutionTimesResult.data.length > 0) {
        const lockIds = resolutionTimesResult.data.map((l) => l.id);

        // Get "done" events for these locks
        const { data: doneEvents } = await supabase
          .from("momentum_lock_events")
          .select("lock_id, created_at")
          .in("lock_id", lockIds)
          .eq("event_type", "done");

        if (doneEvents && doneEvents.length > 0) {
          // Create a map of lock_id to done time
          const doneTimeMap = new Map<string, string>();
          doneEvents.forEach((event) => {
            doneTimeMap.set(event.lock_id, event.created_at);
          });

          // Calculate resolution times
          const resolutionTimes: number[] = [];
          resolutionTimesResult.data.forEach((lock) => {
            const doneTime = doneTimeMap.get(lock.id);
            if (doneTime) {
              const createdAt = new Date(lock.created_at).getTime();
              const completedAt = new Date(doneTime).getTime();
              const hoursToResolve = (completedAt - createdAt) / (1000 * 60 * 60);
              if (hoursToResolve > 0) {
                resolutionTimes.push(hoursToResolve);
              }
            }
          });

          if (resolutionTimes.length > 0) {
            const totalHours = resolutionTimes.reduce((sum, h) => sum + h, 0);
            averageResolutionHours = Math.round((totalHours / resolutionTimes.length) * 10) / 10;
          }
        }
      }

      setAnalyticsData({
        totalLocks,
        completedLocks,
        completionRate,
        averageResolutionHours,
        activeLocks,
        locksThisMonth,
        completedThisMonth,
        blockedThisMonth,
      });
    } catch (error) {
      console.error("Error loading analytics data:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const formatResolutionTime = (hours: number | null): string => {
    if (hours === null) return "N/A";
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${hours}h`;
    const days = Math.round(hours / 24 * 10) / 10;
    return `${days}d`;
  };

  if (loading || planLoading) {
    return <PageLoader />;
  }

  // Access denied state for free users
  if (!hasAdvancedAnalytics) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto py-8"
      >
        <div className="bg-white rounded-xl border border-coffee-foam p-8 text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-coffee-espresso">Analytics</h1>
            <p className="text-coffee-cortado">
              Advanced analytics are available on Starter and higher plans.
            </p>
          </div>

          <div className="bg-coffee-cream rounded-lg p-6 space-y-4">
            <p className="text-coffee-mocha font-medium">
              Unlock detailed insights into your team&apos;s momentum locks:
            </p>
            <ul className="text-sm text-coffee-cortado space-y-2 text-left max-w-md mx-auto">
              <li>Track total locks and completion rates</li>
              <li>Monitor average resolution times</li>
              <li>View monthly trends and patterns</li>
              <li>Identify bottlenecks and blockers</li>
            </ul>
          </div>

          <Link href="/billing">
            <Button className="bg-coffee-espresso hover:bg-coffee-mocha text-white">
              Upgrade to Starter
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <p className="text-coffee-cortado">Unable to load analytics.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-8 py-4"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-coffee-espresso">Analytics</h1>
        <p className="text-coffee-cortado mt-1">
          Track your team&apos;s momentum lock performance
        </p>
      </div>

      {/* Overview Cards */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-coffee-espresso">Overview</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Locks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-coffee-foam p-5"
          >
            <p className="text-sm text-coffee-cortado mb-1">Total Locks</p>
            <p className="text-3xl font-bold text-coffee-espresso">
              {analyticsData.totalLocks}
            </p>
            <p className="text-xs text-coffee-latte mt-1">All time</p>
          </motion.div>

          {/* Completion Rate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl border border-coffee-foam p-5"
          >
            <p className="text-sm text-coffee-cortado mb-1">Completion Rate</p>
            <p className="text-3xl font-bold text-coffee-espresso">
              {analyticsData.completionRate}%
            </p>
            <p className="text-xs text-coffee-latte mt-1">
              {analyticsData.completedLocks} of {analyticsData.totalLocks} done
            </p>
          </motion.div>

          {/* Average Resolution Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-coffee-foam p-5"
          >
            <p className="text-sm text-coffee-cortado mb-1">Avg Resolution</p>
            <p className="text-3xl font-bold text-coffee-espresso">
              {formatResolutionTime(analyticsData.averageResolutionHours)}
            </p>
            <p className="text-xs text-coffee-latte mt-1">Time to completion</p>
          </motion.div>

          {/* Active Locks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-xl border border-coffee-foam p-5"
          >
            <p className="text-sm text-coffee-cortado mb-1">Active Locks</p>
            <p className="text-3xl font-bold text-coffee-espresso">
              {analyticsData.activeLocks}
            </p>
            <p className="text-xs text-coffee-latte mt-1">Currently in progress</p>
          </motion.div>
        </div>
      </section>

      {/* This Month Stats */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-coffee-espresso">This Month</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Locks Created */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl border border-coffee-foam p-5"
          >
            <p className="text-sm text-coffee-cortado mb-1">Locks Created</p>
            <p className="text-3xl font-bold text-coffee-espresso">
              {analyticsData.locksThisMonth}
            </p>
            <p className="text-xs text-coffee-latte mt-1">
              {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </motion.div>

          {/* Completed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-xl border border-coffee-foam p-5"
          >
            <p className="text-sm text-coffee-cortado mb-1">Completed</p>
            <p className="text-3xl font-bold text-coffee-espresso">
              {analyticsData.completedThisMonth}
            </p>
            <p className="text-xs text-coffee-latte mt-1">Marked as done</p>
          </motion.div>

          {/* Blocked */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl border border-coffee-foam p-5"
          >
            <p className="text-sm text-coffee-cortado mb-1">Blocked</p>
            <p className="text-3xl font-bold text-coffee-espresso">
              {analyticsData.blockedThisMonth}
            </p>
            <p className="text-xs text-coffee-latte mt-1">Encountered blockers</p>
          </motion.div>
        </div>
      </section>

      {/* Empty State */}
      {analyticsData.totalLocks === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-coffee-cream rounded-xl p-8 text-center"
        >
          <p className="text-coffee-mocha font-medium mb-2">No momentum locks yet</p>
          <p className="text-sm text-coffee-cortado">
            Create your first momentum lock in Slack using /lock to start tracking your team&apos;s progress.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AnalyticsContent />
    </Suspense>
  );
}
