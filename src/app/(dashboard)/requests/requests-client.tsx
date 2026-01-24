'use client';

import { useState, useMemo } from 'react';
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle, AlertCircle, XCircle, PlayCircle, PauseCircle, Timer, Search } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem, HoverScale } from "@/components/motion-wrappers";

// Status badge configurations
const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    color: "bg-coffee-foam text-coffee-cortado",
    icon: Clock,
  },
  active: {
    label: "Active",
    color: "bg-coffee-oat/20 text-coffee-oat",
    icon: Timer,
  },
  started: {
    label: "In Progress",
    color: "bg-coffee-steamed text-coffee-mocha",
    icon: PlayCircle,
  },
  blocked: {
    label: "Blocked",
    color: "bg-coffee-roast/20 text-coffee-roast",
    icon: PauseCircle,
  },
  done: {
    label: "Completed",
    color: "bg-coffee-cream text-coffee-mocha",
    icon: CheckCircle,
  },
  canceled: {
    label: "Canceled",
    color: "bg-coffee-foam text-coffee-latte",
    icon: XCircle,
  },
  expired: {
    label: "Expired",
    color: "bg-coffee-foam text-coffee-oat",
    icon: AlertCircle,
  },
} as const;

type LockStatus = keyof typeof STATUS_CONFIG;

interface MomentumLock {
  id: string;
  required_outcome: string;
  status: LockStatus;
  deadline_at: string;
  created_at: string;
  updated_at: string;
  owner_user_id: string;
  requester_user_id: string;
  channel_id: string;
  workspace_id: string;
  impact_statement: string | null;
}

interface LockEvent {
  id: string;
  lock_id: string;
  event_type: string;
  created_at: string;
  actor_user_id: string | null;
  payload: Record<string, unknown>;
}

// Helper functions
function formatRelativeTime(date: Date, options?: { addSuffix?: boolean }): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const isPast = diffMs > 0;
  const absDiffMs = Math.abs(diffMs);

  const minutes = Math.floor(absDiffMs / (1000 * 60));
  const hours = Math.floor(absDiffMs / (1000 * 60 * 60));
  const days = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));

  let result: string;
  if (minutes < 1) {
    result = "less than a minute";
  } else if (minutes < 60) {
    result = `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  } else if (hours < 24) {
    result = `${hours} hour${hours !== 1 ? "s" : ""}`;
  } else {
    result = `${days} day${days !== 1 ? "s" : ""}`;
  }

  if (options?.addSuffix) {
    return isPast ? `${result} ago` : `in ${result}`;
  }
  return result;
}

function formatDate(date: Date, pattern: string): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  const paddedMinutes = minutes.toString().padStart(2, "0");
  return `${month} ${day}, ${hour12}:${paddedMinutes} ${ampm}`;
}

function StatusBadge({ status }: { status: LockStatus }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

function TimelineEvent({ event, isLast }: { event: LockEvent; isLast: boolean }) {
  const eventLabels: Record<string, string> = {
    created: "Request created",
    confirmed: "Confirmed by owner",
    delivered: "Notification delivered",
    started: "Work started",
    blocked: "Marked as blocked",
    done: "Completed",
    escalated: "Escalated to fallback",
    reassigned: "Reassigned",
    expired: "Deadline expired",
    canceled: "Canceled",
  };

  const label = eventLabels[event.event_type] || event.event_type;

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-2 h-2 rounded-full bg-coffee-steamed" />
        {!isLast && <div className="w-0.5 h-full bg-coffee-foam flex-1 mt-1" />}
      </div>
      <div className="pb-4">
        <p className="text-sm text-coffee-espresso">{label}</p>
        <p className="text-xs text-coffee-latte">
          {formatRelativeTime(new Date(event.created_at), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

function LockCard({
  lock,
  events,
  userRole,
}: {
  lock: MomentumLock;
  events: LockEvent[];
  userRole: "owner" | "requester";
}) {
  const deadline = new Date(lock.deadline_at);
  const isOverdue = deadline < new Date() && !["done", "canceled", "expired"].includes(lock.status);
  const lockEvents = events.filter((e) => e.lock_id === lock.id).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <HoverScale scale={1.01}>
      <div className="bg-white rounded-xl border border-coffee-foam shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-5 pb-4">
          <div className="flex items-start justify-between gap-4 mb-3">
            <StatusBadge status={lock.status} />
            <span className="text-xs text-coffee-latte">
              {userRole === "owner" ? "You own this" : "You requested this"}
            </span>
          </div>
          <h3 className="text-base font-medium text-coffee-espresso mb-2 line-clamp-2">
            {lock.required_outcome}
          </h3>
          {lock.impact_statement && (
            <p className="text-sm text-coffee-cortado line-clamp-2">{lock.impact_statement}</p>
          )}
        </div>

        {/* Deadline */}
        <div className={`px-5 py-3 border-t border-coffee-foam/50 ${isOverdue ? "bg-coffee-roast/10" : "bg-coffee-cream/20"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${isOverdue ? "text-coffee-roast" : "text-coffee-cortado"}`} />
              <span className={`text-sm ${isOverdue ? "text-coffee-roast font-medium" : "text-coffee-cortado"}`}>
                {isOverdue ? "Overdue" : "Due"} {formatRelativeTime(deadline, { addSuffix: true })}
              </span>
            </div>
            <span className="text-xs text-coffee-latte">
              {formatDate(deadline, "MMM d, h:mm a")}
            </span>
          </div>
        </div>

        {/* Timeline */}
        {lockEvents.length > 0 && (
          <div className="px-5 py-4 border-t border-coffee-foam/50 bg-coffee-paper">
            <p className="text-xs font-medium text-coffee-mocha mb-3">Activity</p>
            <div className="max-h-32 overflow-y-auto">
              {lockEvents.slice(0, 4).map((event, idx) => (
                <TimelineEvent
                  key={event.id}
                  event={event}
                  isLast={idx === lockEvents.slice(0, 4).length - 1}
                />
              ))}
            </div>
          </div>
        )}

        {/* Response Time Stats */}
        {lock.status === "done" && lockEvents.length > 1 && (
          <div className="px-5 py-3 border-t border-coffee-foam/50 bg-coffee-cream/50">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-coffee-mocha" />
              <span className="text-sm text-coffee-mocha">
                Completed in {formatRelativeTime(new Date(lock.created_at))}
              </span>
            </div>
          </div>
        )}
      </div>
    </HoverScale>
  );
}

type FilterType = 'all' | 'active' | 'completed' | 'expired';

interface RequestsClientProps {
  allLocks: MomentumLock[];
  allEvents: LockEvent[];
  slackUserId: string;
  avgResponseTime: number;
  firstName?: string;
}

export function RequestsClient({
  allLocks,
  allEvents,
  slackUserId,
  avgResponseTime,
  firstName,
}: RequestsClientProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter locks based on current filter and search
  const filteredLocks = useMemo(() => {
    let result = allLocks;

    // Apply status filter
    if (filter === 'active') {
      result = result.filter(l => ['active', 'started', 'blocked'].includes(l.status));
    } else if (filter === 'completed') {
      result = result.filter(l => ['done', 'canceled'].includes(l.status));
    } else if (filter === 'expired') {
      result = result.filter(l => l.status === 'expired');
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(l =>
        l.required_outcome.toLowerCase().includes(query) ||
        (l.impact_statement && l.impact_statement.toLowerCase().includes(query))
      );
    }

    return result;
  }, [allLocks, filter, searchQuery]);

  // Categorize filtered locks
  const activeLocks = filteredLocks.filter((l) =>
    ["active", "started", "blocked"].includes(l.status)
  );
  const completedLocks = filteredLocks.filter((l) =>
    ["done", "canceled", "expired"].includes(l.status)
  );

  // Calculate stats from all locks (not filtered)
  const totalLocks = allLocks.length;
  const allActiveLocks = allLocks.filter(l => ["active", "started", "blocked"].includes(l.status));
  const completedCount = allLocks.filter((l) => l.status === "done").length;

  const filterLabels: Record<FilterType, string> = {
    all: 'All',
    active: 'Active',
    completed: 'Completed',
    expired: 'Expired',
  };

  // Empty state component
  const EmptyState = ({ type }: { type: 'no-requests' | 'no-results' | 'no-filter-results' }) => {
    if (type === 'no-requests') {
      return (
        <FadeIn>
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-coffee-cream/60 flex items-center justify-center">
              <Clock className="w-8 h-8 text-coffee-latte" />
            </div>
            <h3 className="text-lg font-medium text-coffee-espresso mb-2">No requests yet</h3>
            <p className="text-sm text-coffee-cortado mb-6 max-w-sm mx-auto">
              Use <code className="bg-coffee-foam/80 px-1.5 py-0.5 rounded text-xs font-mono text-coffee-mocha">/attunly lock</code> in Slack to create your first momentum lock.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-coffee-espresso text-white rounded-lg text-sm font-medium hover:bg-coffee-mocha transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </FadeIn>
      );
    }

    if (type === 'no-results') {
      return (
        <FadeIn>
          <div className="text-center py-12 px-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-coffee-cream/60 flex items-center justify-center">
              <Search className="w-5 h-5 text-coffee-latte" />
            </div>
            <h3 className="text-base font-medium text-coffee-espresso mb-1">No results found</h3>
            <p className="text-sm text-coffee-cortado mb-4">
              No requests matching "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-sm text-coffee-mocha hover:text-coffee-espresso transition-colors"
            >
              Clear search
            </button>
          </div>
        </FadeIn>
      );
    }

    return (
      <FadeIn>
        <div className="text-center py-12 px-6">
          <h3 className="text-base font-medium text-coffee-espresso mb-1">
            No {filter} requests
          </h3>
          <p className="text-sm text-coffee-cortado mb-4">
            {filter === 'active' && "You don't have any active requests right now."}
            {filter === 'completed' && "No completed requests to show."}
            {filter === 'expired' && "No expired requests."}
          </p>
          <button
            onClick={() => setFilter('all')}
            className="text-sm text-coffee-mocha hover:text-coffee-espresso transition-colors"
          >
            View all requests
          </button>
        </div>
      </FadeIn>
    );
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <FadeIn>
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-coffee-cortado hover:text-coffee-espresso transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-semibold text-coffee-espresso text-balance">Request History</h1>
          <p className="text-coffee-cortado mt-1">
            Track your momentum locks and their progress
          </p>
        </div>
      </FadeIn>

      {/* Stats Summary */}
      {totalLocks > 0 && (
        <FadeIn delay={0.1}>
          <StaggerContainer className="grid grid-cols-3 gap-4 mb-8">
            <StaggerItem>
              <div className="bg-white rounded-xl border border-coffee-foam p-4 text-center">
                <p className="text-2xl font-semibold text-coffee-espresso">{allActiveLocks.length}</p>
                <p className="text-xs text-coffee-cortado">Active</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="bg-white rounded-xl border border-coffee-foam p-4 text-center">
                <p className="text-2xl font-semibold text-coffee-espresso">{completedCount}</p>
                <p className="text-xs text-coffee-cortado">Completed</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="bg-white rounded-xl border border-coffee-foam p-4 text-center">
                <p className="text-2xl font-semibold text-coffee-espresso">
                  {avgResponseTime > 0 ? `${avgResponseTime.toFixed(1)}h` : "--"}
                </p>
                <p className="text-xs text-coffee-cortado">Avg. Time</p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </FadeIn>
      )}

      {/* Filters and Search */}
      {totalLocks > 0 && (
        <FadeIn delay={0.15}>
          <div className="mb-6 space-y-4">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {(['all', 'active', 'completed', 'expired'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === f
                      ? 'bg-coffee-espresso text-coffee-paper'
                      : 'bg-coffee-foam text-coffee-cortado hover:bg-coffee-cream'
                  }`}
                >
                  {filterLabels[f]}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-latte" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-coffee-foam bg-white text-coffee-espresso placeholder:text-coffee-latte focus:outline-none focus:ring-2 focus:ring-coffee-mocha focus:border-transparent transition-all"
              />
            </div>
          </div>
        </FadeIn>
      )}

      {/* Empty States */}
      {totalLocks === 0 && <EmptyState type="no-requests" />}
      {totalLocks > 0 && filteredLocks.length === 0 && searchQuery && <EmptyState type="no-results" />}
      {totalLocks > 0 && filteredLocks.length === 0 && !searchQuery && filter !== 'all' && <EmptyState type="no-filter-results" />}

      {/* Active Locks Section */}
      {activeLocks.length > 0 && (
        <section className="mb-8">
          <FadeIn delay={0.2}>
            <h2 className="text-sm font-medium text-coffee-mocha mb-4 flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Active Requests ({activeLocks.length})
            </h2>
          </FadeIn>
          <StaggerContainer className="space-y-4" staggerDelay={0.05}>
            {activeLocks.map((lock) => (
              <StaggerItem key={lock.id}>
                <LockCard
                  lock={lock}
                  events={allEvents}
                  userRole={lock.owner_user_id === slackUserId ? "owner" : "requester"}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      )}

      {/* Completed Locks Section */}
      {completedLocks.length > 0 && (
        <section>
          <FadeIn delay={0.25}>
            <h2 className="text-sm font-medium text-coffee-mocha mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Completed ({completedLocks.length})
            </h2>
          </FadeIn>
          <StaggerContainer className="space-y-4" staggerDelay={0.05}>
            {completedLocks.slice(0, 10).map((lock) => (
              <StaggerItem key={lock.id}>
                <LockCard
                  lock={lock}
                  events={allEvents}
                  userRole={lock.owner_user_id === slackUserId ? "owner" : "requester"}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
          {completedLocks.length > 10 && (
            <FadeIn delay={0.3}>
              <p className="text-center text-sm text-coffee-latte mt-4">
                Showing 10 of {completedLocks.length} completed requests
              </p>
            </FadeIn>
          )}
        </section>
      )}
    </div>
  );
}
