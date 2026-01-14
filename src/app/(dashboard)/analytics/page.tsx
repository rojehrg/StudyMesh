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
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface DailyActivity {
  day: string;
  created: number;
  completed: number;
}

interface TeamMemberStats {
  userId: string;
  name: string;
  locksOwned: number;
  locksCompleted: number;
  avgResolutionHours: number | null;
}

interface AnalyticsData {
  // Overview metrics
  totalLocks: number;
  completedLocks: number;
  blockedLocks: number;
  activeLocks: number;
  completionRate: number;
  averageResolutionHours: number | null;

  // New analytics metrics
  averageResponseMinutes: number | null; // Time from creation to first "started" event
  blockRate: number; // % of locks that have a "blocked" event

  // This month vs last month
  locksThisMonth: number;
  locksLastMonth: number;
  completedThisMonth: number;
  completedLastMonth: number;

  // Daily activity (last 7 days)
  dailyActivity: DailyActivity[];

  // Team stats
  teamStats: TeamMemberStats[];
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();

      if (!profile?.organization_id) {
        router.push("/dashboard");
        return;
      }

      const { data: org } = await supabase
        .from("organizations")
        .select("slack_team_id")
        .eq("id", profile.organization_id)
        .single();

      if (!org?.slack_team_id) {
        setAnalyticsData(getEmptyAnalytics());
        setLoading(false);
        return;
      }

      const workspaceId = org.slack_team_id;
      const now = new Date();

      // Calculate date ranges
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Fetch all locks for this workspace
      const { data: allLocks } = await supabase
        .from("momentum_locks")
        .select("id, status, created_at, owner_user_id")
        .eq("workspace_id", workspaceId);

      const locks = allLocks || [];

      // Calculate basic metrics
      const totalLocks = locks.length;
      const completedLocks = locks.filter((l) => l.status === "done").length;
      const blockedLocks = locks.filter((l) => l.status === "blocked").length;
      const activeLocks = locks.filter((l) => ["active", "started"].includes(l.status)).length;
      const completionRate = totalLocks > 0 ? Math.round((completedLocks / totalLocks) * 100) : 0;

      // This month vs last month
      const locksThisMonth = locks.filter(
        (l) => new Date(l.created_at) >= startOfThisMonth
      ).length;
      const locksLastMonth = locks.filter(
        (l) =>
          new Date(l.created_at) >= startOfLastMonth &&
          new Date(l.created_at) <= endOfLastMonth
      ).length;
      const completedThisMonth = locks.filter(
        (l) => l.status === "done" && new Date(l.created_at) >= startOfThisMonth
      ).length;
      const completedLastMonth = locks.filter(
        (l) =>
          l.status === "done" &&
          new Date(l.created_at) >= startOfLastMonth &&
          new Date(l.created_at) <= endOfLastMonth
      ).length;

      // Daily activity (last 7 days)
      const dailyActivity: DailyActivity[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

        const created = locks.filter(
          (l) => new Date(l.created_at) >= dayStart && new Date(l.created_at) < dayEnd
        ).length;
        const completed = locks.filter(
          (l) =>
            l.status === "done" &&
            new Date(l.created_at) >= dayStart &&
            new Date(l.created_at) < dayEnd
        ).length;

        dailyActivity.push({
          day: dayStart.toLocaleDateString("en-US", { weekday: "short" }),
          created,
          completed,
        });
      }

      // Calculate average resolution time
      let averageResolutionHours: number | null = null;
      const completedLockIds = locks.filter((l) => l.status === "done").map((l) => l.id);

      if (completedLockIds.length > 0) {
        const { data: doneEvents } = await supabase
          .from("momentum_lock_events")
          .select("lock_id, created_at")
          .in("lock_id", completedLockIds.slice(0, 100))
          .eq("event_type", "done");

        if (doneEvents && doneEvents.length > 0) {
          const resolutionTimes: number[] = [];
          const lockMap = new Map(locks.map((l) => [l.id, l]));

          doneEvents.forEach((event) => {
            const lock = lockMap.get(event.lock_id);
            if (lock) {
              const hours =
                (new Date(event.created_at).getTime() - new Date(lock.created_at).getTime()) /
                (1000 * 60 * 60);
              if (hours > 0 && hours < 720) {
                // Ignore outliers > 30 days
                resolutionTimes.push(hours);
              }
            }
          });

          if (resolutionTimes.length > 0) {
            averageResolutionHours =
              Math.round((resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length) * 10) / 10;
          }
        }
      }

      // Calculate average response time (time from creation to first "started" event)
      let averageResponseMinutes: number | null = null;
      const lockIds = locks.map((l) => l.id);

      if (lockIds.length > 0) {
        const { data: startedEvents } = await supabase
          .from("momentum_lock_events")
          .select("lock_id, created_at, payload")
          .in("lock_id", lockIds.slice(0, 100))
          .eq("event_type", "started");

        if (startedEvents && startedEvents.length > 0) {
          const responseTimes: number[] = [];
          const lockMap = new Map(locks.map((l) => [l.id, l]));

          startedEvents.forEach((event) => {
            const lock = lockMap.get(event.lock_id);
            if (lock) {
              // Check if payload has minutesSinceCreation (new enhanced payload)
              const payload = event.payload as { minutesSinceCreation?: number } | null;
              if (payload?.minutesSinceCreation !== undefined) {
                responseTimes.push(payload.minutesSinceCreation);
              } else {
                // Fallback: calculate from timestamps
                const minutes =
                  (new Date(event.created_at).getTime() - new Date(lock.created_at).getTime()) /
                  (1000 * 60);
                if (minutes > 0 && minutes < 10080) {
                  // Ignore outliers > 7 days
                  responseTimes.push(minutes);
                }
              }
            }
          });

          if (responseTimes.length > 0) {
            averageResponseMinutes =
              Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length);
          }
        }
      }

      // Calculate block rate (% of locks that have a "blocked" event)
      let blockRate = 0;
      if (lockIds.length > 0) {
        const { data: blockedEvents } = await supabase
          .from("momentum_lock_events")
          .select("lock_id")
          .in("lock_id", lockIds.slice(0, 100))
          .eq("event_type", "blocked");

        if (blockedEvents && blockedEvents.length > 0) {
          // Count unique locks that have been blocked
          const uniqueBlockedLocks = new Set(blockedEvents.map((e) => e.lock_id));
          blockRate = Math.round((uniqueBlockedLocks.size / Math.min(lockIds.length, 100)) * 100);
        }
      }

      // Team member stats
      const ownerCounts = new Map<string, { owned: number; completed: number }>();
      locks.forEach((lock) => {
        const current = ownerCounts.get(lock.owner_user_id) || { owned: 0, completed: 0 };
        current.owned++;
        if (lock.status === "done") current.completed++;
        ownerCounts.set(lock.owner_user_id, current);
      });

      // Get profile names for top owners
      const topOwnerIds = Array.from(ownerCounts.entries())
        .sort((a, b) => b[1].owned - a[1].owned)
        .slice(0, 5)
        .map(([id]) => id);

      let teamStats: TeamMemberStats[] = [];
      if (topOwnerIds.length > 0) {
        const { data: ownerProfiles } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name")
          .in("user_id", topOwnerIds);

        if (ownerProfiles) {
          teamStats = topOwnerIds.map((userId) => {
            const profile = ownerProfiles.find((p) => p.user_id === userId);
            const stats = ownerCounts.get(userId) || { owned: 0, completed: 0 };
            return {
              userId,
              name: profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Unknown" : "Unknown",
              locksOwned: stats.owned,
              locksCompleted: stats.completed,
              avgResolutionHours: null,
            };
          });
        }
      }

      setAnalyticsData({
        totalLocks,
        completedLocks,
        blockedLocks,
        activeLocks,
        completionRate,
        averageResolutionHours,
        averageResponseMinutes,
        blockRate,
        locksThisMonth,
        locksLastMonth,
        completedThisMonth,
        completedLastMonth,
        dailyActivity,
        teamStats,
      });
    } catch (error) {
      console.error("Error loading analytics data:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const getEmptyAnalytics = (): AnalyticsData => ({
    totalLocks: 0,
    completedLocks: 0,
    blockedLocks: 0,
    activeLocks: 0,
    completionRate: 0,
    averageResolutionHours: null,
    averageResponseMinutes: null,
    blockRate: 0,
    locksThisMonth: 0,
    locksLastMonth: 0,
    completedThisMonth: 0,
    completedLastMonth: 0,
    dailyActivity: [],
    teamStats: [],
  });

  const formatResolutionTime = (hours: number | null): string => {
    if (hours === null) return "—";
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${Math.round(hours)}h`;
    return `${Math.round(hours / 24)}d`;
  };

  const formatResponseTime = (minutes: number | null): string => {
    if (minutes === null) return "—";
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
    return `${Math.round(minutes / 1440)}d`;
  };

  const getTrendIndicator = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? { text: "New", color: "text-emerald-600" } : null;
    const change = Math.round(((current - previous) / previous) * 100);
    if (change > 0) return { text: `+${change}%`, color: "text-emerald-600" };
    if (change < 0) return { text: `${change}%`, color: "text-red-500" };
    return { text: "0%", color: "text-coffee-latte" };
  };

  if (loading || planLoading) {
    return <PageLoader />;
  }

  if (!hasAdvancedAnalytics) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-xl border border-coffee-foam p-8 text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-coffee-espresso">Analytics</h1>
            <p className="text-coffee-cortado">
              Advanced analytics are available on Starter and higher plans.
            </p>
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
      <div className="max-w-4xl mx-auto py-8">
        <p className="text-coffee-cortado">Unable to load analytics.</p>
      </div>
    );
  }

  const pieData = [
    { name: "Completed", value: analyticsData.completedLocks, color: "#8c7b70" },
    { name: "Active", value: analyticsData.activeLocks, color: "#c4b5a9" },
    { name: "Blocked", value: analyticsData.blockedLocks, color: "#e8e2dc" },
  ].filter((d) => d.value > 0);

  const monthTrend = getTrendIndicator(analyticsData.locksThisMonth, analyticsData.locksLastMonth);
  const completionTrend = getTrendIndicator(analyticsData.completedThisMonth, analyticsData.completedLastMonth);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-coffee-espresso">Analytics</h1>
        <p className="text-coffee-cortado mt-1">
          Insights into your team&apos;s momentum locks
        </p>
      </div>

      {analyticsData.totalLocks === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-coffee-foam p-12 text-center"
        >
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-coffee-cream rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-coffee-latte" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-coffee-espresso">No data yet</h2>
            <p className="text-coffee-cortado">
              Create your first momentum lock in Slack using <code className="bg-coffee-cream px-2 py-0.5 rounded text-sm">/attunly</code> to start tracking progress.
            </p>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Top Row - Key Metrics + Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Completion Rate Donut */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-coffee-foam p-6 lg:row-span-2"
            >
              <h3 className="text-sm font-medium text-coffee-cortado mb-4">Status Breakdown</h3>
              <div className="flex flex-col items-center">
                <div className="relative">
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [value ?? 0, "Locks"]}
                        contentStyle={{
                          background: "#fffcf9",
                          border: "1px solid #e8e2dc",
                          borderRadius: "8px",
                          fontSize: "14px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-coffee-espresso">
                      {analyticsData.completionRate}%
                    </span>
                    <span className="text-xs text-coffee-latte">completed</span>
                  </div>
                </div>
                <div className="flex gap-4 mt-4 text-sm">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                      <span className="text-coffee-cortado">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Key Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-xl border border-coffee-foam p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-coffee-cortado">Total Locks</p>
                  <p className="text-3xl font-bold text-coffee-espresso mt-1">
                    {analyticsData.totalLocks}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-coffee-cortado">This month</p>
                  <p className="text-lg font-semibold text-coffee-espresso">
                    {analyticsData.locksThisMonth}
                  </p>
                  {monthTrend && (
                    <p className={`text-xs ${monthTrend.color}`}>{monthTrend.text} vs last</p>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-coffee-foam p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-coffee-cortado">Avg Resolution</p>
                  <p className="text-3xl font-bold text-coffee-espresso mt-1">
                    {formatResolutionTime(analyticsData.averageResolutionHours)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-coffee-cortado">Completed</p>
                  <p className="text-lg font-semibold text-coffee-espresso">
                    {analyticsData.completedThisMonth}
                  </p>
                  {completionTrend && (
                    <p className={`text-xs ${completionTrend.color}`}>{completionTrend.text} vs last</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Active / Blocked */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-xl border border-coffee-foam p-6 lg:col-span-2"
            >
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-coffee-cortado">Active Right Now</p>
                  <p className="text-3xl font-bold text-coffee-espresso mt-1">
                    {analyticsData.activeLocks}
                  </p>
                  <p className="text-xs text-coffee-latte mt-1">In progress</p>
                </div>
                <div>
                  <p className="text-sm text-coffee-cortado">Currently Blocked</p>
                  <p className="text-3xl font-bold text-coffee-espresso mt-1">
                    {analyticsData.blockedLocks}
                  </p>
                  <p className="text-xs text-coffee-latte mt-1">Needs attention</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Response Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average Response Time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.27 }}
              className="bg-white rounded-xl border border-coffee-foam p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-coffee-cortado">Avg Response Time</p>
                  <p className="text-3xl font-bold text-coffee-espresso mt-1">
                    {formatResponseTime(analyticsData.averageResponseMinutes)}
                  </p>
                  <p className="text-xs text-coffee-latte mt-1">Time to first action</p>
                </div>
              </div>
            </motion.div>

            {/* Block Rate */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              className="bg-white rounded-xl border border-coffee-foam p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-coffee-cortado">Block Rate</p>
                  <p className="text-3xl font-bold text-coffee-espresso mt-1">
                    {analyticsData.blockRate}%
                  </p>
                  <p className="text-xs text-coffee-latte mt-1">Locks encountering blockers</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Activity Chart */}
          {analyticsData.dailyActivity.some((d) => d.created > 0 || d.completed > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl border border-coffee-foam p-6"
            >
              <h3 className="text-sm font-medium text-coffee-cortado mb-4">Last 7 Days Activity</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analyticsData.dailyActivity} barGap={4}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8c7b70", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8c7b70", fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#fffcf9",
                      border: "1px solid #e8e2dc",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                  />
                  <Bar dataKey="created" name="Created" fill="#8c7b70" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Completed" fill="#c4b5a9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2">
                <div className="flex items-center gap-1.5 text-sm">
                  <div className="w-3 h-3 rounded bg-coffee-mocha" />
                  <span className="text-coffee-cortado">Created</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <div className="w-3 h-3 rounded bg-coffee-latte" />
                  <span className="text-coffee-cortado">Completed</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Team Leaderboard */}
          {analyticsData.teamStats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white rounded-xl border border-coffee-foam p-6"
            >
              <h3 className="text-sm font-medium text-coffee-cortado mb-4">Team Activity</h3>
              <div className="space-y-3">
                {analyticsData.teamStats.map((member, index) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between py-2 border-b border-coffee-foam last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-coffee-cream flex items-center justify-center text-xs font-medium text-coffee-mocha">
                        {index + 1}
                      </span>
                      <span className="text-coffee-espresso font-medium">{member.name}</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-right">
                        <span className="text-coffee-espresso font-medium">{member.locksOwned}</span>
                        <span className="text-coffee-latte ml-1">assigned</span>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <span className="text-coffee-espresso font-medium">{member.locksCompleted}</span>
                        <span className="text-coffee-latte ml-1">done</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
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
