"use client";

import { Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/loading-states";
import { motion } from "framer-motion";
import { usePlanFeatures } from "@/hooks/use-plan-features";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  type AnalyticsOverview,
  type AnalyticsInsights,
  type DateRangeOption,
  DATE_RANGE_OPTIONS,
  formatHoursToReadable,
} from "@/lib/types/analytics";

interface APIResponse {
  success: boolean;
  data: {
    overview: AnalyticsOverview;
    insights: AnalyticsInsights;
    dateRange: {
      from: string;
      to: string;
      days: number;
    };
    warnings?: string[];
  } | null;
  error?: string;
}

const fetcher = async (url: string): Promise<APIResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to fetch" }));
    throw new Error(error.error || "Failed to fetch analytics");
  }
  return res.json();
};

function DateRangeSelector({
  value,
  onChange,
}: {
  value: DateRangeOption;
  onChange: (value: DateRangeOption) => void;
}) {
  return (
    <div className="flex rounded-lg border border-coffee-foam overflow-hidden">
      {DATE_RANGE_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-3 py-1.5 text-sm transition-colors ${
            value === option.value
              ? "bg-coffee-espresso text-white"
              : "bg-white text-coffee-cortado hover:bg-coffee-cream"
          }`}
        >
          {option.value}
        </button>
      ))}
    </div>
  );
}

function AnalyticsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateRange = (searchParams.get("range") as DateRangeOption) || "14d";

  const { hasFeature, loading: planLoading } = usePlanFeatures();
  const hasAdvancedAnalytics = hasFeature("advancedAnalytics");

  const { data, error, isLoading, mutate } = useSWR<APIResponse>(
    hasAdvancedAnalytics ? `/api/analytics/insights?range=${dateRange}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      refreshInterval: 300000,
    }
  );

  const handleDateRangeChange = useCallback(
    (newRange: DateRangeOption) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("range", newRange);
      router.push(`/analytics?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  if (planLoading) {
    return <PageLoader />;
  }

  if (!hasAdvancedAnalytics) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-xl border border-coffee-foam p-8 text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-coffee-espresso">
              Analytics
            </h1>
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-coffee-espresso">Analytics</h1>
          <DateRangeSelector value={dateRange} onChange={handleDateRangeChange} />
        </div>
        <div className="bg-white rounded-xl border border-coffee-foam p-8 text-center">
          <p className="text-coffee-cortado mb-4">{error.message}</p>
          <Button
            onClick={() => mutate()}
            variant="outline"
            className="border-coffee-foam"
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !data?.data) {
    return (
      <div className="max-w-4xl mx-auto py-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-coffee-espresso">Analytics</h1>
          <DateRangeSelector value={dateRange} onChange={handleDateRangeChange} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-coffee-foam p-6 animate-pulse"
            >
              <div className="h-4 w-20 bg-coffee-cream rounded mb-3" />
              <div className="h-8 w-12 bg-coffee-cream rounded" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-coffee-foam p-6 animate-pulse">
          <div className="h-4 w-24 bg-coffee-cream rounded mb-4" />
          <div className="h-48 bg-coffee-cream rounded" />
        </div>
      </div>
    );
  }

  const { overview, insights, dateRange: apiDateRange } = data.data;

  if (overview.totalLocks === 0) {
    return (
      <div className="max-w-4xl mx-auto py-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-coffee-espresso">Analytics</h1>
          <DateRangeSelector value={dateRange} onChange={handleDateRangeChange} />
        </div>
        <div className="bg-white rounded-xl border border-coffee-foam p-12 text-center">
          <h2 className="text-xl font-semibold text-coffee-espresso">
            No analytics data yet
          </h2>
          <p className="text-coffee-cortado mt-2 max-w-md mx-auto">
            Create your first momentum lock in Slack to start tracking your
            team&apos;s progress.
          </p>
        </div>
      </div>
    );
  }

  const trendData = insights.trends.map((t) => ({
    ...t,
    label: new Date(t.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-6 py-4"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-coffee-espresso">Analytics</h1>
        <DateRangeSelector value={dateRange} onChange={handleDateRangeChange} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-coffee-foam p-6">
          <p className="text-sm text-coffee-cortado">Total Locks</p>
          <p className="text-3xl font-bold text-coffee-espresso mt-1">
            {overview.totalLocks}
          </p>
          <p className="text-xs text-coffee-latte mt-1">
            {overview.locksThisMonth} this month
          </p>
        </div>

        <div className="bg-white rounded-xl border border-coffee-foam p-6">
          <p className="text-sm text-coffee-cortado">Completion Rate</p>
          <p className="text-3xl font-bold text-coffee-espresso mt-1">
            {overview.completionRate}%
          </p>
          <p className="text-xs text-coffee-latte mt-1">
            {overview.completedLocks} completed
          </p>
        </div>

        <div className="bg-white rounded-xl border border-coffee-foam p-6">
          <p className="text-sm text-coffee-cortado">Avg Resolution</p>
          <p className="text-3xl font-bold text-coffee-espresso mt-1">
            {formatHoursToReadable(overview.averageResolutionHours)}
          </p>
          <p className="text-xs text-coffee-latte mt-1">time to complete</p>
        </div>

        <div className="bg-white rounded-xl border border-coffee-foam p-6">
          <p className="text-sm text-coffee-cortado">Active Now</p>
          <p className="text-3xl font-bold text-coffee-espresso mt-1">
            {overview.activeLocks}
          </p>
          <p className="text-xs text-coffee-latte mt-1">
            {overview.blockedLocks} blocked
          </p>
        </div>
      </div>

      {trendData.length > 0 && (
        <div className="bg-white rounded-xl border border-coffee-foam p-6">
          <h3 className="text-sm font-medium text-coffee-cortado mb-4">
            {apiDateRange.days}-Day Trend
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8c7b70", fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8c7b70", fontSize: 12 }}
                allowDecimals={false}
                width={30}
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
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="completed"
                name="Completed"
                stroke="#8c7b70"
                strokeWidth={2}
                dot={false}
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
          </div>
        </div>
      )}

      {overview.teamStats.length > 0 && (
        <div className="bg-white rounded-xl border border-coffee-foam p-6">
          <h3 className="text-sm font-medium text-coffee-cortado mb-4">
            Team Activity
          </h3>
          <div className="space-y-3">
            {overview.teamStats.map((member, index) => (
              <div
                key={member.userId}
                className="flex items-center justify-between py-2 border-b border-coffee-foam last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-coffee-cream flex items-center justify-center text-xs font-medium text-coffee-mocha">
                    {index + 1}
                  </span>
                  <span className="text-coffee-espresso font-medium">
                    {member.name}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-coffee-cortado">
                    {member.locksOwned} assigned
                  </span>
                  <span className="text-coffee-espresso font-medium">
                    {member.locksCompleted} done
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
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
