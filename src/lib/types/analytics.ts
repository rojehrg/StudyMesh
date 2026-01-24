/**
 * Shared Analytics Types
 *
 * Single source of truth for analytics data structures.
 * Used by both the analytics page and API endpoint.
 */

// ============================================
// Date Range Types
// ============================================

export type DateRangeOption = '7d' | '14d' | '30d' | '90d';

export interface DateRangeConfig {
  label: string;
  days: number;
  value: DateRangeOption;
}

export const DATE_RANGE_OPTIONS: DateRangeConfig[] = [
  { label: 'Last 7 days', days: 7, value: '7d' },
  { label: 'Last 14 days', days: 14, value: '14d' },
  { label: 'Last 30 days', days: 30, value: '30d' },
  { label: 'Last 90 days', days: 90, value: '90d' },
];

// ============================================
// Funnel & Metrics Types
// ============================================

export interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
  dropOffRate: number;
}

export interface BlockerStat {
  reason: string;
  count: number;
  percentage: number;
}

export interface TimeZoneStat {
  timezone: string;
  count: number;
  percentage: number;
}

export interface ResponseTimeByHour {
  hour: number;
  averageMinutes: number;
  count: number;
}

export interface TrendDataPoint {
  date: string;
  created: number;
  started: number;
  completed: number;
  blocked: number;
}

export interface DailyActivity {
  day: string;
  created: number;
  completed: number;
}

export interface TeamMemberStats {
  userId: string;
  name: string;
  locksOwned: number;
  locksCompleted: number;
  avgResolutionHours: number | null;
}

// ============================================
// API Response Types
// ============================================

export interface AnalyticsInsights {
  // Funnel metrics
  funnel: {
    stages: FunnelStage[];
    totalCreated: number;
    totalCompleted: number;
    overallConversionRate: number;
  };

  // Time metrics (all in minutes)
  timeMetrics: {
    averageTimeToStart: number | null;
    averageTimeToComplete: number | null;
    averageTimeToBlock: number | null;
    medianResolutionTime: number | null;
  };

  // Block analysis
  blockAnalysis: {
    blockRate: number;
    topBlockers: BlockerStat[];
  };

  // Team distribution
  teamDistribution: {
    timezones: TimeZoneStat[];
  };

  // Response patterns
  responsePatterns: {
    byHour: ResponseTimeByHour[];
    peakHour: number | null;
    slowestHour: number | null;
  };

  // Trend data (configurable by date range)
  trends: TrendDataPoint[];
}

export interface AnalyticsOverview {
  // Core metrics
  totalLocks: number;
  completedLocks: number;
  blockedLocks: number;
  activeLocks: number;
  completionRate: number;
  averageResolutionHours: number | null;

  // Response metrics
  averageResponseMinutes: number | null;
  blockRate: number;

  // Period comparison
  locksThisMonth: number;
  locksLastMonth: number;
  completedThisMonth: number;
  completedLastMonth: number;

  // Activity breakdown
  dailyActivity: DailyActivity[];

  // Team stats
  teamStats: TeamMemberStats[];
}

export interface AnalyticsAPIResponse {
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

// ============================================
// Query Parameters
// ============================================

export interface AnalyticsQueryParams {
  range?: DateRangeOption;
  from?: string;
  to?: string;
}

// ============================================
// Internal Types (for API calculations)
// ============================================

export interface Lock {
  id: string;
  status: string;
  created_at: string;
  updated_at?: string;
  owner_user_id: string;
  requester_user_id?: string;
  owner_timezone: string | null;
}

export interface LockEvent {
  lock_id: string;
  event_type: string;
  created_at: string;
  payload: Record<string, unknown> | null;
}

// ============================================
// UI State Types
// ============================================

export interface AnalyticsLoadingState {
  overview: boolean;
  insights: boolean;
}

export interface AnalyticsErrorState {
  overview: string | null;
  insights: string | null;
}

// ============================================
// Helper Functions
// ============================================

export function getDateRangeFromOption(option: DateRangeOption): { from: Date; to: Date } {
  const to = new Date();
  const config = DATE_RANGE_OPTIONS.find(o => o.value === option);
  const days = config?.days || 14;
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  return { from, to };
}

export function formatMinutesToReadable(minutes: number | null): string {
  if (minutes === null) return '-';
  if (minutes < 60) return `${Math.round(minutes)}m`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
  return `${Math.round(minutes / 1440)}d`;
}

export function formatHoursToReadable(hours: number | null): string {
  if (hours === null) return '-';
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}d`;
}

export function formatHour(hour: number): string {
  if (hour === 0) return '12am';
  if (hour === 12) return '12pm';
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
}
