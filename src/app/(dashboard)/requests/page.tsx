import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle, AlertCircle, XCircle, PlayCircle, PauseCircle, Timer } from "lucide-react";

// Helper function to format relative time (replaces date-fns formatDistanceToNow)
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

// Helper function to format date (replaces date-fns format)
function formatDate(date: Date, pattern: string): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  const paddedMinutes = minutes.toString().padStart(2, "0");

  // Pattern: "MMM d, h:mm a"
  return `${month} ${day}, ${hour12}:${paddedMinutes} ${ampm}`;
}

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

      {/* Timeline - Show recent events */}
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
  );
}

function EmptyState() {
  return (
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
  );
}

export default async function RequestHistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile to get slack_user_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("slack_user_id, first_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.slack_user_id) {
    redirect("/dashboard");
  }

  const slackUserId = profile.slack_user_id;

  // Fetch all momentum locks where user is owner or requester
  const { data: locks, error: locksError } = await supabase
    .from("momentum_locks")
    .select("*")
    .or(`owner_user_id.eq.${slackUserId},requester_user_id.eq.${slackUserId}`)
    .order("created_at", { ascending: false });

  if (locksError) {
    console.error("Error fetching locks:", locksError);
  }

  const allLocks = (locks || []) as MomentumLock[];

  // Fetch events for all locks
  const lockIds = allLocks.map((l) => l.id);
  let allEvents: LockEvent[] = [];

  if (lockIds.length > 0) {
    const { data: events } = await supabase
      .from("momentum_lock_events")
      .select("*")
      .in("lock_id", lockIds)
      .order("created_at", { ascending: false });

    allEvents = (events || []) as LockEvent[];
  }

  // Categorize locks
  const activeLocks = allLocks.filter((l) =>
    ["active", "started", "blocked"].includes(l.status)
  );
  const completedLocks = allLocks.filter((l) =>
    ["done", "canceled", "expired"].includes(l.status)
  );

  // Calculate stats
  const totalLocks = allLocks.length;
  const completedCount = allLocks.filter((l) => l.status === "done").length;
  const avgResponseTime =
    completedLocks.length > 0
      ? completedLocks
          .filter((l) => l.status === "done")
          .reduce((acc, l) => {
            const created = new Date(l.created_at).getTime();
            const updated = new Date(l.updated_at).getTime();
            return acc + (updated - created);
          }, 0) /
        completedLocks.filter((l) => l.status === "done").length /
        (1000 * 60 * 60) // Convert to hours
      : 0;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
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

      {/* Stats Summary */}
      {totalLocks > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-coffee-foam p-4 text-center">
            <p className="text-2xl font-semibold text-coffee-espresso">{activeLocks.length}</p>
            <p className="text-xs text-coffee-cortado">Active</p>
          </div>
          <div className="bg-white rounded-xl border border-coffee-foam p-4 text-center">
            <p className="text-2xl font-semibold text-coffee-espresso">{completedCount}</p>
            <p className="text-xs text-coffee-cortado">Completed</p>
          </div>
          <div className="bg-white rounded-xl border border-coffee-foam p-4 text-center">
            <p className="text-2xl font-semibold text-coffee-espresso">
              {avgResponseTime > 0 ? `${avgResponseTime.toFixed(1)}h` : "--"}
            </p>
            <p className="text-xs text-coffee-cortado">Avg. Time</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalLocks === 0 && <EmptyState />}

      {/* Active Locks Section */}
      {activeLocks.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-medium text-coffee-mocha mb-4 flex items-center gap-2">
            <Timer className="w-4 h-4" />
            Active Requests ({activeLocks.length})
          </h2>
          <div className="space-y-4">
            {activeLocks.map((lock) => (
              <LockCard
                key={lock.id}
                lock={lock}
                events={allEvents}
                userRole={lock.owner_user_id === slackUserId ? "owner" : "requester"}
              />
            ))}
          </div>
        </section>
      )}

      {/* Completed Locks Section */}
      {completedLocks.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-coffee-mocha mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Completed ({completedLocks.length})
          </h2>
          <div className="space-y-4">
            {completedLocks.slice(0, 10).map((lock) => (
              <LockCard
                key={lock.id}
                lock={lock}
                events={allEvents}
                userRole={lock.owner_user_id === slackUserId ? "owner" : "requester"}
              />
            ))}
          </div>
          {completedLocks.length > 10 && (
            <p className="text-center text-sm text-coffee-latte mt-4">
              Showing 10 of {completedLocks.length} completed requests
            </p>
          )}
        </section>
      )}
    </div>
  );
}
