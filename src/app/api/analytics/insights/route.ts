/**
 * Analytics Insights API
 *
 * GET - Fetch comprehensive analytics data including:
 * - Overview metrics (totals, rates, comparisons)
 * - Lock completion funnel metrics
 * - Time to each status
 * - Block analysis
 * - Team timezone distribution
 * - Response time by hour
 * - Trend data
 *
 * Query params:
 * - range: '7d' | '14d' | '30d' | '90d' (default: '14d')
 * - from: ISO date string (overrides range)
 * - to: ISO date string (overrides range)
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireOrgAuth, apiSuccess, apiError, withErrorHandling } from '@/lib/api-utils';
import {
  type AnalyticsAPIResponse,
  type AnalyticsOverview,
  type AnalyticsInsights,
  type FunnelStage,
  type BlockerStat,
  type TimeZoneStat,
  type ResponseTimeByHour,
  type TrendDataPoint,
  type DailyActivity,
  type TeamMemberStats,
  type Lock,
  type LockEvent,
  type DateRangeOption,
  getDateRangeFromOption,
} from '@/lib/types/analytics';

// ============================================
// API Handler
// ============================================

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { context, error } = await requireOrgAuth();
  if (error) return error;

  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;

  // Parse date range from query params
  const rangeParam = (searchParams.get('range') || '14d') as DateRangeOption;
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');

  let dateFrom: Date;
  let dateTo: Date;
  let rangeDays: number;

  if (fromParam && toParam) {
    dateFrom = new Date(fromParam);
    dateTo = new Date(toParam);
    rangeDays = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));
  } else {
    const range = getDateRangeFromOption(rangeParam);
    dateFrom = range.from;
    dateTo = range.to;
    rangeDays = parseInt(rangeParam) || 14;
  }

  // Get organization's workspace ID and validate
  const { data: org } = await supabase
    .from('organizations')
    .select('slack_team_id')
    .eq('id', context.organizationId)
    .single();

  // Get user's profile to check for workspace mismatch
  const { data: profile } = await supabase
    .from('profiles')
    .select('slack_team_id')
    .eq('user_id', context.userId)
    .single();

  const warnings: string[] = [];

  // Check for workspace mismatch
  if (profile?.slack_team_id && org?.slack_team_id &&
      profile.slack_team_id !== org.slack_team_id) {
    warnings.push(
      'Your Slack workspace differs from your organization. Some data may not be visible.'
    );
  }

  if (!org?.slack_team_id) {
    return apiSuccess({
      overview: getEmptyOverview(),
      insights: getEmptyInsights(),
      dateRange: {
        from: dateFrom.toISOString(),
        to: dateTo.toISOString(),
        days: rangeDays,
      },
      warnings: ['No Slack workspace connected to organization.'],
    });
  }

  const workspaceId = org.slack_team_id;

  // Fetch ALL locks for this workspace (no limit)
  const { data: locksData, error: locksError } = await supabase
    .from('momentum_locks')
    .select('id, status, created_at, updated_at, owner_user_id, requester_user_id, owner_timezone')
    .eq('workspace_id', workspaceId);

  if (locksError) {
    console.error('Error fetching locks:', locksError);
    return apiError('INTERNAL_ERROR', 'Failed to fetch lock data');
  }

  const allLocks: Lock[] = locksData || [];

  if (allLocks.length === 0) {
    return apiSuccess({
      overview: getEmptyOverview(),
      insights: getEmptyInsights(),
      dateRange: {
        from: dateFrom.toISOString(),
        to: dateTo.toISOString(),
        days: rangeDays,
      },
      warnings,
    });
  }

  // Fetch ALL lock events (no limit - use batching for large datasets)
  const lockIds = allLocks.map(l => l.id);
  const allEvents: LockEvent[] = [];

  // Batch fetch events in chunks of 1000 to avoid query limits
  const BATCH_SIZE = 1000;
  for (let i = 0; i < lockIds.length; i += BATCH_SIZE) {
    const batchIds = lockIds.slice(i, i + BATCH_SIZE);
    const { data: batchEvents } = await supabase
      .from('momentum_lock_events')
      .select('lock_id, event_type, created_at, payload')
      .in('lock_id', batchIds);

    if (batchEvents) {
      allEvents.push(...batchEvents);
    }
  }

  // Calculate all metrics
  const overview = await calculateOverview(supabase, allLocks, allEvents, context.organizationId!, rangeDays);
  const insights = calculateInsights(allLocks, allEvents, dateFrom, dateTo, rangeDays);

  return apiSuccess({
    overview,
    insights,
    dateRange: {
      from: dateFrom.toISOString(),
      to: dateTo.toISOString(),
      days: rangeDays,
    },
    warnings: warnings.length > 0 ? warnings : undefined,
  });
});

// ============================================
// Overview Calculations
// ============================================

async function calculateOverview(
  supabase: Awaited<ReturnType<typeof createClient>>,
  locks: Lock[],
  events: LockEvent[],
  organizationId: string,
  rangeDays: number
): Promise<AnalyticsOverview> {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Basic counts
  const totalLocks = locks.length;
  const completedLocks = locks.filter(l => l.status === 'done').length;
  const blockedLocks = locks.filter(l => l.status === 'blocked').length;
  const activeLocks = locks.filter(l => ['active', 'started'].includes(l.status)).length;
  const completionRate = totalLocks > 0 ? Math.round((completedLocks / totalLocks) * 100) : 0;

  // Month comparisons
  const locksThisMonth = locks.filter(
    l => new Date(l.created_at) >= startOfThisMonth
  ).length;
  const locksLastMonth = locks.filter(
    l => new Date(l.created_at) >= startOfLastMonth && new Date(l.created_at) <= endOfLastMonth
  ).length;
  const completedThisMonth = locks.filter(
    l => l.status === 'done' && new Date(l.created_at) >= startOfThisMonth
  ).length;
  const completedLastMonth = locks.filter(
    l => l.status === 'done' && new Date(l.created_at) >= startOfLastMonth && new Date(l.created_at) <= endOfLastMonth
  ).length;

  // Average resolution time (from completed locks' events)
  let averageResolutionHours: number | null = null;
  const completedLockIds = new Set(locks.filter(l => l.status === 'done').map(l => l.id));
  const lockCreatedMap = new Map(locks.map(l => [l.id, new Date(l.created_at)]));
  const resolutionTimes: number[] = [];

  for (const event of events) {
    if (event.event_type === 'done' && completedLockIds.has(event.lock_id)) {
      const createdAt = lockCreatedMap.get(event.lock_id);
      if (createdAt) {
        const hours = (new Date(event.created_at).getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        if (hours > 0 && hours < 720) { // < 30 days
          resolutionTimes.push(hours);
        }
      }
    }
  }

  if (resolutionTimes.length > 0) {
    averageResolutionHours = Math.round(
      (resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length) * 10
    ) / 10;
  }

  // Average response time (time to first 'started' event)
  let averageResponseMinutes: number | null = null;
  const responseTimes: number[] = [];

  for (const event of events) {
    if (event.event_type === 'started') {
      const createdAt = lockCreatedMap.get(event.lock_id);
      if (createdAt) {
        const payload = event.payload as { minutesSinceCreation?: number } | null;
        if (payload?.minutesSinceCreation !== undefined) {
          responseTimes.push(payload.minutesSinceCreation);
        } else {
          const minutes = (new Date(event.created_at).getTime() - createdAt.getTime()) / (1000 * 60);
          if (minutes > 0 && minutes < 10080) { // < 7 days
            responseTimes.push(minutes);
          }
        }
      }
    }
  }

  if (responseTimes.length > 0) {
    averageResponseMinutes = Math.round(
      responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    );
  }

  // Block rate
  const uniqueBlockedLocks = new Set(
    events.filter(e => e.event_type === 'blocked').map(e => e.lock_id)
  );
  const blockRate = locks.length > 0 ? Math.round((uniqueBlockedLocks.size / locks.length) * 100) : 0;

  // Daily activity (for the configured range)
  const dailyActivity: DailyActivity[] = [];
  for (let i = rangeDays - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const created = locks.filter(
      l => new Date(l.created_at) >= dayStart && new Date(l.created_at) < dayEnd
    ).length;
    const completed = locks.filter(
      l => l.status === 'done' && new Date(l.created_at) >= dayStart && new Date(l.created_at) < dayEnd
    ).length;

    dailyActivity.push({
      day: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
      created,
      completed,
    });
  }

  // Team stats (top 5 by lock ownership)
  const ownerCounts = new Map<string, { owned: number; completed: number }>();
  for (const lock of locks) {
    const current = ownerCounts.get(lock.owner_user_id) || { owned: 0, completed: 0 };
    current.owned++;
    if (lock.status === 'done') current.completed++;
    ownerCounts.set(lock.owner_user_id, current);
  }

  const topOwnerIds = Array.from(ownerCounts.entries())
    .sort((a, b) => b[1].owned - a[1].owned)
    .slice(0, 5)
    .map(([id]) => id);

  let teamStats: TeamMemberStats[] = [];
  if (topOwnerIds.length > 0) {
    const { data: ownerProfiles } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name')
      .in('user_id', topOwnerIds);

    if (ownerProfiles) {
      teamStats = topOwnerIds.map(userId => {
        const profile = ownerProfiles.find(p => p.user_id === userId);
        const stats = ownerCounts.get(userId) || { owned: 0, completed: 0 };
        return {
          userId,
          name: profile
            ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown'
            : 'Unknown',
          locksOwned: stats.owned,
          locksCompleted: stats.completed,
          avgResolutionHours: null,
        };
      });
    }
  }

  return {
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
  };
}

// ============================================
// Insights Calculations
// ============================================

function calculateInsights(
  locks: Lock[],
  events: LockEvent[],
  dateFrom: Date,
  dateTo: Date,
  rangeDays: number
): AnalyticsInsights {
  // Funnel metrics
  const funnel = calculateFunnelMetrics(locks, events);

  // Time metrics
  const timeMetrics = calculateTimeMetrics(locks, events);

  // Block analysis
  const blockAnalysis = calculateBlockAnalysis(locks, events);

  // Team distribution
  const teamDistribution = calculateTeamDistribution(locks);

  // Response patterns
  const responsePatterns = calculateResponsePatterns(events);

  // Trends
  const trends = calculateTrends(locks, events, rangeDays);

  return {
    funnel,
    timeMetrics,
    blockAnalysis,
    teamDistribution,
    responsePatterns,
    trends,
  };
}

function calculateFunnelMetrics(
  locks: Lock[],
  events: LockEvent[]
): AnalyticsInsights['funnel'] {
  const totalCreated = locks.length;

  // Group events by lock
  const eventsByLock = new Map<string, Set<string>>();
  for (const event of events) {
    if (!eventsByLock.has(event.lock_id)) {
      eventsByLock.set(event.lock_id, new Set());
    }
    eventsByLock.get(event.lock_id)!.add(event.event_type);
  }

  // Count stages
  const startedCount = locks.filter(lock => {
    const lockEvents = eventsByLock.get(lock.id);
    return lockEvents?.has('started') || ['started', 'blocked', 'done'].includes(lock.status);
  }).length;

  const doneCount = locks.filter(lock => {
    const lockEvents = eventsByLock.get(lock.id);
    return lockEvents?.has('done') || lock.status === 'done';
  }).length;

  const stages: FunnelStage[] = [
    {
      stage: 'Created',
      count: totalCreated,
      percentage: 100,
      dropOffRate: 0,
    },
    {
      stage: 'Started',
      count: startedCount,
      percentage: totalCreated > 0 ? Math.round((startedCount / totalCreated) * 100) : 0,
      dropOffRate: totalCreated > 0 ? Math.round(((totalCreated - startedCount) / totalCreated) * 100) : 0,
    },
    {
      stage: 'Done',
      count: doneCount,
      percentage: totalCreated > 0 ? Math.round((doneCount / totalCreated) * 100) : 0,
      dropOffRate: startedCount > 0 ? Math.round(((startedCount - doneCount) / startedCount) * 100) : 0,
    },
  ];

  return {
    stages,
    totalCreated,
    totalCompleted: doneCount,
    overallConversionRate: totalCreated > 0 ? Math.round((doneCount / totalCreated) * 100) : 0,
  };
}

function calculateTimeMetrics(
  locks: Lock[],
  events: LockEvent[]
): AnalyticsInsights['timeMetrics'] {
  const lockCreatedMap = new Map(locks.map(l => [l.id, new Date(l.created_at)]));

  // Group events by lock
  const eventsByLock = new Map<string, LockEvent[]>();
  for (const event of events) {
    if (!eventsByLock.has(event.lock_id)) {
      eventsByLock.set(event.lock_id, []);
    }
    eventsByLock.get(event.lock_id)!.push(event);
  }

  const timeToStart: number[] = [];
  const timeToComplete: number[] = [];
  const timeToBlock: number[] = [];

  for (const [lockId, lockEvents] of eventsByLock) {
    const createdAt = lockCreatedMap.get(lockId);
    if (!createdAt) continue;

    // Time to start
    const startedEvent = lockEvents.find(e => e.event_type === 'started');
    if (startedEvent) {
      const minutes = (new Date(startedEvent.created_at).getTime() - createdAt.getTime()) / (1000 * 60);
      if (minutes > 0 && minutes < 10080) { // < 7 days
        timeToStart.push(minutes);
      }
    }

    // Time to complete
    const doneEvent = lockEvents.find(e => e.event_type === 'done');
    if (doneEvent) {
      const minutes = (new Date(doneEvent.created_at).getTime() - createdAt.getTime()) / (1000 * 60);
      if (minutes > 0 && minutes < 43200) { // < 30 days
        timeToComplete.push(minutes);
      }
    }

    // Time to block
    const blockedEvent = lockEvents.find(e => e.event_type === 'blocked');
    if (blockedEvent) {
      const minutes = (new Date(blockedEvent.created_at).getTime() - createdAt.getTime()) / (1000 * 60);
      if (minutes > 0 && minutes < 10080) { // < 7 days
        timeToBlock.push(minutes);
      }
    }
  }

  const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;

  const median = (arr: number[]): number | null => {
    if (arr.length === 0) return null;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? Math.round(sorted[mid]) : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  };

  return {
    averageTimeToStart: avg(timeToStart),
    averageTimeToComplete: avg(timeToComplete),
    averageTimeToBlock: avg(timeToBlock),
    medianResolutionTime: median(timeToComplete),
  };
}

function calculateBlockAnalysis(
  locks: Lock[],
  events: LockEvent[]
): AnalyticsInsights['blockAnalysis'] {
  const blockedEvents = events.filter(e => e.event_type === 'blocked');
  const uniqueBlockedLocks = new Set(blockedEvents.map(e => e.lock_id));
  const blockRate = locks.length > 0 ? Math.round((uniqueBlockedLocks.size / locks.length) * 100) : 0;

  // Count block reasons
  const reasonCounts = new Map<string, number>();
  for (const event of blockedEvents) {
    const payload = event.payload as { reason?: string; note?: string } | null;
    const reason = payload?.reason || payload?.note || 'No reason provided';
    reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
  }

  const topBlockers: BlockerStat[] = Array.from(reasonCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([reason, count]) => ({
      reason: reason.length > 50 ? reason.substring(0, 50) + '...' : reason,
      count,
      percentage: blockedEvents.length > 0 ? Math.round((count / blockedEvents.length) * 100) : 0,
    }));

  return {
    blockRate,
    topBlockers,
  };
}

function calculateTeamDistribution(locks: Lock[]): AnalyticsInsights['teamDistribution'] {
  const timezoneCounts = new Map<string, number>();
  for (const lock of locks) {
    const tz = lock.owner_timezone || 'Unknown';
    timezoneCounts.set(tz, (timezoneCounts.get(tz) || 0) + 1);
  }

  const total = locks.length;
  const timezones: TimeZoneStat[] = Array.from(timezoneCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([timezone, count]) => ({
      timezone: formatTimezone(timezone),
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));

  return { timezones };
}

function formatTimezone(tz: string): string {
  if (tz === 'Unknown') return tz;
  const parts = tz.split('/');
  if (parts.length > 1) {
    return parts[parts.length - 1].replace(/_/g, ' ');
  }
  return tz;
}

function calculateResponsePatterns(events: LockEvent[]): AnalyticsInsights['responsePatterns'] {
  const startedEvents = events.filter(e => e.event_type === 'started');
  const hourlyData = new Map<number, { totalMinutes: number; count: number }>();

  for (const event of startedEvents) {
    const eventDate = new Date(event.created_at);
    const hour = eventDate.getUTCHours();
    const payload = event.payload as { minutesSinceCreation?: number } | null;

    if (payload?.minutesSinceCreation !== undefined) {
      const current = hourlyData.get(hour) || { totalMinutes: 0, count: 0 };
      current.totalMinutes += payload.minutesSinceCreation;
      current.count++;
      hourlyData.set(hour, current);
    }
  }

  const byHour: ResponseTimeByHour[] = [];
  let peakHour: number | null = null;
  let slowestHour: number | null = null;
  let minAvg = Infinity;
  let maxAvg = 0;

  for (let hour = 0; hour < 24; hour++) {
    const data = hourlyData.get(hour);
    if (data && data.count > 0) {
      const avgMinutes = Math.round(data.totalMinutes / data.count);
      byHour.push({
        hour,
        averageMinutes: avgMinutes,
        count: data.count,
      });

      if (avgMinutes < minAvg) {
        minAvg = avgMinutes;
        peakHour = hour;
      }
      if (avgMinutes > maxAvg) {
        maxAvg = avgMinutes;
        slowestHour = hour;
      }
    }
  }

  return {
    byHour,
    peakHour,
    slowestHour,
  };
}

function calculateTrends(
  locks: Lock[],
  events: LockEvent[],
  rangeDays: number
): TrendDataPoint[] {
  const now = new Date();
  const rangeStart = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);

  // Initialize data points
  const dataPoints = new Map<string, TrendDataPoint>();
  for (let i = rangeDays - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    dataPoints.set(dateStr, {
      date: dateStr,
      created: 0,
      started: 0,
      completed: 0,
      blocked: 0,
    });
  }

  // Count created locks
  for (const lock of locks) {
    const createdDate = new Date(lock.created_at);
    if (createdDate >= rangeStart) {
      const dateStr = createdDate.toISOString().split('T')[0];
      const point = dataPoints.get(dateStr);
      if (point) {
        point.created++;
      }
    }
  }

  // Count events
  for (const event of events) {
    const eventDate = new Date(event.created_at);
    if (eventDate >= rangeStart) {
      const dateStr = eventDate.toISOString().split('T')[0];
      const point = dataPoints.get(dateStr);
      if (point) {
        if (event.event_type === 'started') point.started++;
        if (event.event_type === 'done') point.completed++;
        if (event.event_type === 'blocked') point.blocked++;
      }
    }
  }

  return Array.from(dataPoints.values());
}

// ============================================
// Empty State Helpers
// ============================================

function getEmptyOverview(): AnalyticsOverview {
  return {
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
  };
}

function getEmptyInsights(): AnalyticsInsights {
  return {
    funnel: {
      stages: [],
      totalCreated: 0,
      totalCompleted: 0,
      overallConversionRate: 0,
    },
    timeMetrics: {
      averageTimeToStart: null,
      averageTimeToComplete: null,
      averageTimeToBlock: null,
      medianResolutionTime: null,
    },
    blockAnalysis: {
      blockRate: 0,
      topBlockers: [],
    },
    teamDistribution: {
      timezones: [],
    },
    responsePatterns: {
      byHour: [],
      peakHour: null,
      slowestHour: null,
    },
    trends: [],
  };
}
