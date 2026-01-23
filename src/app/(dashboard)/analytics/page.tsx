"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { PageLoader, Skeleton } from "@/components/loading-states";
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// ============================================
// Types
// ============================================

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

interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
  dropOffRate: number;
}

interface BlockerStat {
  reason: string;
  count: number;
  percentage: number;
}

interface TimeZoneStat {
  timezone: string;
  count: number;
  percentage: number;
}

interface ResponseTimeByHour {
  hour: number;
  averageMinutes: number;
  count: number;
}

interface TrendDataPoint {
  date: string;
  created: number;
  started: number;
  completed: number;
  blocked: number;
}

interface InsightsData {
  funnel: {
    stages: FunnelStage[];
    totalCreated: number;
    totalCompleted: number;
    overallConversionRate: number;
  };
  timeMetrics: {
    averageTimeToStart: number | null;
    averageTimeToComplete: number | null;
    averageTimeToBlock: number | null;
    medianResolutionTime: number | null;
  };
  blockAnalysis: {
    blockRate: number;
    topBlockers: BlockerStat[];
  };
  teamDistribution: {
    timezones: TimeZoneStat[];
  };
  responsePatterns: {
    byHour: ResponseTimeByHour[];
    peakHour: number | null;
    slowestHour: number | null;
  };
  trends: TrendDataPoint[];
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
  averageResponseMinutes: number | null;
  blockRate: number;

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

// ============================================
// Stat Card Component
// ============================================

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { text: string; color: string } | null;
  secondaryValue?: string | number;
  secondaryLabel?: string;
  delay?: number;
}

function StatCard({ title, value, subtitle, trend, secondaryValue, secondaryLabel, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-xl border border-coffee-foam p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-coffee-cortado">{title}</p>
          <p className="text-3xl font-bold text-coffee-espresso mt-1">{value}</p>
          {subtitle && <p className="text-xs text-coffee-latte mt-1">{subtitle}</p>}
        </div>
        {(secondaryValue !== undefined || trend) && (
          <div className="text-right">
            {secondaryLabel && <p className="text-sm text-coffee-cortado">{secondaryLabel}</p>}
            {secondaryValue !== undefined && (
              <p className="text-lg font-semibold text-coffee-espresso">{secondaryValue}</p>
            )}
            {trend && <p className={`text-xs ${trend.color}`}>{trend.text}</p>}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================
// Funnel Chart Component
// ============================================

interface FunnelChartProps {
  stages: FunnelStage[];
  delay?: number;
}

function FunnelChart({ stages, delay = 0 }: FunnelChartProps) {
  if (stages.length === 0) return null;

  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-xl border border-coffee-foam p-6"
    >
      <h3 className="text-sm font-medium text-coffee-cortado mb-4">Lock Completion Funnel</h3>
      <div className="space-y-4">
        {stages.map((stage, index) => (
          <div key={stage.stage} className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-coffee-espresso">{stage.stage}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-coffee-cortado">{stage.count} locks</span>
                <span className="text-sm font-medium text-coffee-espresso">{stage.percentage}%</span>
              </div>
            </div>
            <div className="h-8 bg-coffee-cream rounded-lg overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(stage.count / maxCount) * 100}%` }}
                transition={{ delay: delay + index * 0.1, duration: 0.5 }}
                className="h-full bg-coffee-mocha rounded-lg"
              />
            </div>
            {index < stages.length - 1 && stage.dropOffRate > 0 && (
              <div className="absolute -bottom-3 right-0 text-xs text-coffee-latte">
                {stage.dropOffRate}% drop-off
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-coffee-foam">
        <div className="flex justify-between text-sm">
          <span className="text-coffee-cortado">Overall Conversion</span>
          <span className="font-semibold text-coffee-espresso">
            {stages.length > 0 ? stages[stages.length - 1].percentage : 0}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// Time Metrics Card Component
// ============================================

interface TimeMetricsCardProps {
  timeMetrics: InsightsData["timeMetrics"];
  delay?: number;
}

function TimeMetricsCard({ timeMetrics, delay = 0 }: TimeMetricsCardProps) {
  const formatTime = (minutes: number | null): string => {
    if (minutes === null) return "-";
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
    return `${Math.round(minutes / 1440)}d`;
  };

  const metrics = [
    { label: "Avg Time to Start", value: formatTime(timeMetrics.averageTimeToStart) },
    { label: "Avg Time to Complete", value: formatTime(timeMetrics.averageTimeToComplete) },
    { label: "Median Resolution", value: formatTime(timeMetrics.medianResolutionTime) },
    { label: "Avg Time to Block", value: formatTime(timeMetrics.averageTimeToBlock) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-xl border border-coffee-foam p-6"
    >
      <h3 className="text-sm font-medium text-coffee-cortado mb-4">Time to Each Status</h3>
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="text-center p-3 bg-coffee-cream/50 rounded-lg">
            <p className="text-2xl font-bold text-coffee-espresso">{metric.value}</p>
            <p className="text-xs text-coffee-cortado mt-1">{metric.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================
// Top Blockers Card Component
// ============================================

interface TopBlockersCardProps {
  blockRate: number;
  topBlockers: BlockerStat[];
  delay?: number;
}

function TopBlockersCard({ blockRate, topBlockers, delay = 0 }: TopBlockersCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-xl border border-coffee-foam p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-coffee-cortado">Top Blockers</h3>
        <span className="text-sm font-semibold text-coffee-espresso">{blockRate}% block rate</span>
      </div>
      {topBlockers.length === 0 ? (
        <p className="text-sm text-coffee-latte text-center py-4">No blockers recorded yet</p>
      ) : (
        <div className="space-y-3">
          {topBlockers.map((blocker, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-coffee-espresso truncate">{blocker.reason}</p>
                <div className="mt-1 h-2 bg-coffee-cream rounded-full overflow-hidden">
                  <div
                    className="h-full bg-coffee-latte rounded-full"
                    style={{ width: `${blocker.percentage}%` }}
                  />
                </div>
              </div>
              <span className="ml-3 text-sm text-coffee-cortado">{blocker.count}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ============================================
// Timezone Distribution Card Component
// ============================================

interface TimezoneCardProps {
  timezones: TimeZoneStat[];
  delay?: number;
}

function TimezoneCard({ timezones, delay = 0 }: TimezoneCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-xl border border-coffee-foam p-6"
    >
      <h3 className="text-sm font-medium text-coffee-cortado mb-4">Team Time Zone Distribution</h3>
      {timezones.length === 0 ? (
        <p className="text-sm text-coffee-latte text-center py-4">No timezone data available</p>
      ) : (
        <div className="space-y-2">
          {timezones.slice(0, 5).map((tz) => (
            <div key={tz.timezone} className="flex items-center justify-between">
              <span className="text-sm text-coffee-espresso">{tz.timezone}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-coffee-cream rounded-full overflow-hidden">
                  <div
                    className="h-full bg-coffee-mocha rounded-full"
                    style={{ width: `${tz.percentage}%` }}
                  />
                </div>
                <span className="text-xs text-coffee-cortado w-8 text-right">{tz.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ============================================
// Response Time by Hour Card Component
// ============================================

interface ResponseTimeChartProps {
  byHour: ResponseTimeByHour[];
  peakHour: number | null;
  slowestHour: number | null;
  delay?: number;
}

function ResponseTimeChart({ byHour, peakHour, slowestHour, delay = 0 }: ResponseTimeChartProps) {
  const formatHour = (hour: number): string => {
    if (hour === 0) return "12am";
    if (hour === 12) return "12pm";
    if (hour < 12) return `${hour}am`;
    return `${hour - 12}pm`;
  };

  // Prepare data for all 24 hours, filling in zeros for missing hours
  const chartData = Array.from({ length: 24 }, (_, hour) => {
    const found = byHour.find((h) => h.hour === hour);
    return {
      hour,
      hourLabel: formatHour(hour),
      averageMinutes: found?.averageMinutes || 0,
      count: found?.count || 0,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-xl border border-coffee-foam p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-coffee-cortado">Response Time by Hour</h3>
        <div className="flex gap-4 text-xs">
          {peakHour !== null && (
            <span className="text-coffee-mocha">Fastest: {formatHour(peakHour)}</span>
          )}
          {slowestHour !== null && (
            <span className="text-coffee-latte">Slowest: {formatHour(slowestHour)}</span>
          )}
        </div>
      </div>
      {byHour.length === 0 ? (
        <p className="text-sm text-coffee-latte text-center py-8">Not enough data to show patterns</p>
      ) : (
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={chartData} barSize={8}>
            <XAxis
              dataKey="hourLabel"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8c7b70", fontSize: 10 }}
              interval={5}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8c7b70", fontSize: 10 }}
              tickFormatter={(value) => (value < 60 ? `${value}m` : `${Math.round(value / 60)}h`)}
            />
            <Tooltip
              formatter={(value) =>
                typeof value === 'number'
                  ? (value < 60 ? [`${value}m`, "Avg Response"] : [`${Math.round(value / 60)}h`, "Avg Response"])
                  : [String(value ?? 0), "Avg Response"]
              }
              contentStyle={{
                background: "#fffcf9",
                border: "1px solid #e8e2dc",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="averageMinutes" fill="#8c7b70" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}

// ============================================
// Trends Chart Component
// ============================================

interface TrendsChartProps {
  trends: TrendDataPoint[];
  delay?: number;
}

function TrendsChart({ trends, delay = 0 }: TrendsChartProps) {
  if (trends.length === 0) return null;

  const formattedData = trends.map((t) => ({
    ...t,
    dateLabel: new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-xl border border-coffee-foam p-6"
    >
      <h3 className="text-sm font-medium text-coffee-cortado mb-4">14-Day Trend</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={formattedData}>
          <XAxis
            dataKey="dateLabel"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8c7b70", fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8c7b70", fontSize: 10 }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: "#fffcf9",
              border: "1px solid #e8e2dc",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Line
            type="monotone"
            dataKey="created"
            name="Created"
            stroke="#1a1614"
            strokeWidth={2}
            dot={{ fill: "#1a1614", strokeWidth: 0, r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="completed"
            name="Completed"
            stroke="#8c7b70"
            strokeWidth={2}
            dot={{ fill: "#8c7b70", strokeWidth: 0, r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="blocked"
            name="Blocked"
            stroke="#d4cbc4"
            strokeWidth={2}
            dot={{ fill: "#d4cbc4", strokeWidth: 0, r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 mt-2">
        <div className="flex items-center gap-1.5 text-sm">
          <div className="w-3 h-3 rounded bg-coffee-espresso" />
          <span className="text-coffee-cortado">Created</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <div className="w-3 h-3 rounded bg-coffee-mocha" />
          <span className="text-coffee-cortado">Completed</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <div className="w-3 h-3 rounded bg-coffee-latte" />
          <span className="text-coffee-cortado">Blocked</span>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// Main Analytics Content
// ============================================

function AnalyticsContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(true);

  const { hasFeature, loading: planLoading } = usePlanFeatures();
  const supabase = createClient();

  const hasAdvancedAnalytics = hasFeature("advancedAnalytics");

  useEffect(() => {
    if (!planLoading) {
      loadAnalyticsData();
      loadInsightsData();
    }
  }, [planLoading]);

  const loadInsightsData = async () => {
    setInsightsLoading(true);
    try {
      const response = await fetch("/api/analytics/insights");
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          setInsightsData(json.data);
        }
      }
    } catch (error) {
      console.error("Error loading insights data:", error);
    } finally {
      setInsightsLoading(false);
    }
  };

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

      // Calculate average response time
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
              const payload = event.payload as { minutesSinceCreation?: number } | null;
              if (payload?.minutesSinceCreation !== undefined) {
                responseTimes.push(payload.minutesSinceCreation);
              } else {
                const minutes =
                  (new Date(event.created_at).getTime() - new Date(lock.created_at).getTime()) /
                  (1000 * 60);
                if (minutes > 0 && minutes < 10080) {
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

      // Calculate block rate
      let blockRate = 0;
      if (lockIds.length > 0) {
        const { data: blockedEvents } = await supabase
          .from("momentum_lock_events")
          .select("lock_id")
          .in("lock_id", lockIds.slice(0, 100))
          .eq("event_type", "blocked");

        if (blockedEvents && blockedEvents.length > 0) {
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
    if (hours === null) return "-";
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${Math.round(hours)}h`;
    return `${Math.round(hours / 24)}d`;
  };

  const formatResponseTime = (minutes: number | null): string => {
    if (minutes === null) return "-";
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
    return `${Math.round(minutes / 1440)}d`;
  };

  const getTrendIndicator = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? { text: "New", color: "text-coffee-mocha" } : null;
    const change = Math.round(((current - previous) / previous) * 100);
    if (change > 0) return { text: `+${change}%`, color: "text-coffee-mocha" };
    if (change < 0) return { text: `${change}%`, color: "text-coffee-cortado" };
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
            <h1 className="text-2xl font-bold text-coffee-espresso text-balance">Analytics</h1>
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
    { name: "Active", value: analyticsData.activeLocks, color: "#d4cbc4" },
    { name: "Blocked", value: analyticsData.blockedLocks, color: "#e8e2dc" },
  ].filter((d) => d.value > 0);

  const monthTrend = getTrendIndicator(analyticsData.locksThisMonth, analyticsData.locksLastMonth);
  const completionTrend = getTrendIndicator(analyticsData.completedThisMonth, analyticsData.completedLastMonth);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-coffee-espresso text-balance">Analytics</h1>
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
          {/* Top Row - Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Locks"
              value={analyticsData.totalLocks}
              secondaryLabel="This month"
              secondaryValue={analyticsData.locksThisMonth}
              trend={monthTrend}
              delay={0.1}
            />
            <StatCard
              title="Avg Resolution"
              value={formatResolutionTime(analyticsData.averageResolutionHours)}
              secondaryLabel="Completed"
              secondaryValue={analyticsData.completedThisMonth}
              trend={completionTrend}
              delay={0.15}
            />
            <StatCard
              title="Avg Response Time"
              value={formatResponseTime(analyticsData.averageResponseMinutes)}
              subtitle="Time to first action"
              delay={0.2}
            />
            <StatCard
              title="Block Rate"
              value={`${analyticsData.blockRate}%`}
              subtitle="Locks encountering blockers"
              delay={0.25}
            />
          </div>

          {/* Status Overview Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Completion Rate Donut */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl border border-coffee-foam p-6"
            >
              <h3 className="text-sm font-medium text-coffee-cortado mb-4">Status Breakdown</h3>
              <div className="flex flex-col items-center">
                <div className="relative">
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
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
                    <span className="text-2xl font-bold text-coffee-espresso">
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

            {/* Active / Blocked Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white rounded-xl border border-coffee-foam p-6 lg:col-span-2"
            >
              <h3 className="text-sm font-medium text-coffee-cortado mb-4">Current Status</h3>
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center p-4 bg-coffee-cream/50 rounded-lg">
                  <p className="text-4xl font-bold text-coffee-espresso">{analyticsData.activeLocks}</p>
                  <p className="text-sm text-coffee-cortado mt-1">Active Right Now</p>
                </div>
                <div className="text-center p-4 bg-coffee-cream/50 rounded-lg">
                  <p className="text-4xl font-bold text-coffee-espresso">{analyticsData.blockedLocks}</p>
                  <p className="text-sm text-coffee-cortado mt-1">Currently Blocked</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Funnel Section */}
          {insightsData && insightsData.funnel.stages.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FunnelChart stages={insightsData.funnel.stages} delay={0.4} />
              <TimeMetricsCard timeMetrics={insightsData.timeMetrics} delay={0.45} />
            </div>
          )}

          {/* Block Analysis and Timezone Section */}
          {insightsData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopBlockersCard
                blockRate={insightsData.blockAnalysis.blockRate}
                topBlockers={insightsData.blockAnalysis.topBlockers}
                delay={0.5}
              />
              <TimezoneCard
                timezones={insightsData.teamDistribution.timezones}
                delay={0.55}
              />
            </div>
          )}

          {/* Response Time by Hour */}
          {insightsData && insightsData.responsePatterns.byHour.length > 0 && (
            <ResponseTimeChart
              byHour={insightsData.responsePatterns.byHour}
              peakHour={insightsData.responsePatterns.peakHour}
              slowestHour={insightsData.responsePatterns.slowestHour}
              delay={0.6}
            />
          )}

          {/* Trends Chart */}
          {insightsData && insightsData.trends.length > 0 && (
            <TrendsChart trends={insightsData.trends} delay={0.65} />
          )}

          {/* Activity Chart - Last 7 Days */}
          {analyticsData.dailyActivity.some((d) => d.created > 0 || d.completed > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
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
                  <Bar dataKey="completed" name="Completed" fill="#d4cbc4" radius={[4, 4, 0, 0]} />
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
              transition={{ delay: 0.75 }}
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
