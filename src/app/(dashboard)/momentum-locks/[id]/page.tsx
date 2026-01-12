import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { momentumLocks, momentumLockEvents } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  Lock,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  User,
  Users,
  MessageSquare,
  ExternalLink,
  Calendar,
} from "lucide-react";

type LockStatus = 'draft' | 'active' | 'started' | 'blocked' | 'done' | 'canceled' | 'expired';

const STATUS_CONFIG: Record<LockStatus, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  draft: { label: 'Draft', color: 'text-gray-700', bgColor: 'bg-gray-100', icon: Clock },
  active: { label: 'Active', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: Clock },
  started: { label: 'In Progress', color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: Clock },
  blocked: { label: 'Blocked', color: 'text-orange-700', bgColor: 'bg-orange-100', icon: AlertCircle },
  done: { label: 'Done', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle2 },
  canceled: { label: 'Canceled', color: 'text-gray-500', bgColor: 'bg-gray-100', icon: XCircle },
  expired: { label: 'Expired', color: 'text-red-700', bgColor: 'bg-red-100', icon: XCircle },
};

const EVENT_LABELS: Record<string, string> = {
  created: 'Lock created',
  confirmed: 'Lock confirmed',
  delivered: 'Wake-up DM sent',
  started: 'Work started',
  blocked: 'Marked as blocked',
  done: 'Completed',
  escalated: 'Escalated to fallback',
  reassigned: 'Reassigned',
  expired: 'Expired',
  canceled: 'Canceled',
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const absDiff = Math.abs(diff);
  const hours = Math.round(absDiff / (60 * 60 * 1000));

  if (diff < 0) {
    if (hours < 1) return 'just now';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.round(hours / 24);
    return days === 1 ? '1 day ago' : `${days} days ago`;
  } else {
    if (hours < 1) return 'less than 1 hour';
    if (hours === 1) return 'in 1 hour';
    if (hours < 24) return `in ${hours} hours`;
    const days = Math.round(hours / 24);
    return days === 1 ? 'in 1 day' : `in ${days} days`;
  }
}

function generateThreadLink(workspaceId: string, channelId: string, threadTs: string): string {
  const linkTs = threadTs.replace('.', '');
  return `https://slack.com/archives/${channelId}/p${linkTs}`;
}

export default async function MomentumLockDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the lock
  const [lock] = await db
    .select()
    .from(momentumLocks)
    .where(eq(momentumLocks.id, id));

  if (!lock) {
    notFound();
  }

  // Fetch events for timeline
  const events = await db
    .select()
    .from(momentumLockEvents)
    .where(eq(momentumLockEvents.lockId, id))
    .orderBy(desc(momentumLockEvents.createdAt));

  const statusConfig = STATUS_CONFIG[lock.status as LockStatus] || STATUS_CONFIG.active;
  const StatusIcon = statusConfig.icon;
  const threadLink = generateThreadLink(lock.workspaceId, lock.channelId, lock.threadTs);

  const isActive = ['draft', 'active', 'started', 'blocked'].includes(lock.status);
  const deadline = new Date(lock.deadlineAt);
  const isPastDeadline = deadline < new Date();

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Back link */}
      <Link
        href="/momentum-locks"
        className="inline-flex items-center gap-1 text-sm text-coffee-cortado hover:text-coffee-espresso mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to locks
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-coffee-foam shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${statusConfig.bgColor} flex items-center justify-center`}>
              <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
            </div>
            <div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>
          <a
            href={threadLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-coffee-cortado hover:text-coffee-espresso transition-colors"
          >
            View in Slack
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <h1 className="text-xl font-semibold text-coffee-espresso mb-4">
          {lock.requiredOutcome}
        </h1>

        {lock.acceptableFallback && (
          <div className="bg-coffee-cream/40 rounded-lg p-3 mb-4">
            <p className="text-sm text-coffee-cortado">
              <span className="font-medium">Acceptable fallback:</span> {lock.acceptableFallback}
            </p>
          </div>
        )}

        {lock.impactStatement && (
          <p className="text-coffee-cortado text-sm mb-4">
            <span className="font-medium">Why it matters:</span> {lock.impactStatement}
          </p>
        )}

        {/* Deadline */}
        <div className={`flex items-center gap-2 text-sm ${isPastDeadline && isActive ? 'text-red-600' : 'text-coffee-cortado'}`}>
          <Calendar className="w-4 h-4" />
          <span className="font-medium">Deadline:</span>
          <span>{formatDate(deadline)} ({formatRelativeTime(deadline)})</span>
        </div>
      </div>

      {/* People */}
      <div className="bg-white rounded-xl border border-coffee-foam shadow-sm p-6 mb-6">
        <h2 className="text-sm font-medium text-coffee-mocha mb-4 flex items-center gap-2">
          <Users className="w-4 h-4" />
          People
        </h2>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-coffee-latte">Owner</p>
              <p className="text-sm text-coffee-espresso font-medium">
                {lock.ownerUserId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-coffee-latte">Requester</p>
              <p className="text-sm text-coffee-espresso font-medium">
                {lock.requesterUserId}
              </p>
            </div>
          </div>

          {lock.fallbackUserId && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-coffee-latte">Fallback</p>
                <p className="text-sm text-coffee-espresso font-medium">
                  {lock.fallbackUserId}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-coffee-foam shadow-sm p-6">
        <h2 className="text-sm font-medium text-coffee-mocha mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Timeline
        </h2>

        {events.length === 0 ? (
          <p className="text-sm text-coffee-cortado">No events yet</p>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-coffee-steamed mt-2" />
                  {index < events.length - 1 && (
                    <div className="w-px flex-1 bg-coffee-foam mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-sm text-coffee-espresso font-medium">
                    {EVENT_LABELS[event.eventType] || event.eventType}
                  </p>
                  {event.actorUserId && (
                    <p className="text-xs text-coffee-latte">
                      by {event.actorUserId}
                    </p>
                  )}
                  <p className="text-xs text-coffee-latte mt-1">
                    {formatDate(new Date(event.createdAt))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="mt-6 text-xs text-coffee-latte">
        <p>Created: {formatDate(new Date(lock.createdAt))}</p>
        <p>Last updated: {formatDate(new Date(lock.updatedAt))}</p>
        <p className="font-mono mt-1">ID: {lock.id}</p>
      </div>
    </div>
  );
}
