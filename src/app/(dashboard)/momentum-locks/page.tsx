import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { momentumLocks } from "@/lib/db/schema";
import { eq, desc, or } from "drizzle-orm";
import { Lock, Clock, AlertCircle, CheckCircle2, XCircle, ChevronRight } from "lucide-react";

type LockStatus = 'draft' | 'active' | 'started' | 'blocked' | 'done' | 'canceled' | 'expired';

const STATUS_CONFIG: Record<LockStatus, { label: string; color: string; icon: typeof Clock }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: Clock },
  active: { label: 'Active', color: 'bg-blue-100 text-blue-700', icon: Clock },
  started: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  blocked: { label: 'Blocked', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
  done: { label: 'Done', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  canceled: { label: 'Canceled', color: 'bg-gray-100 text-gray-500', icon: XCircle },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-700', icon: XCircle },
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const absDiff = Math.abs(diff);
  const hours = Math.round(absDiff / (60 * 60 * 1000));

  if (diff < 0) {
    // Past
    if (hours < 1) return 'just now';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.round(hours / 24);
    return days === 1 ? '1 day ago' : `${days} days ago`;
  } else {
    // Future
    if (hours < 1) return 'less than 1 hour';
    if (hours === 1) return 'in 1 hour';
    if (hours < 24) return `in ${hours} hours`;
    const days = Math.round(hours / 24);
    return days === 1 ? 'in 1 day' : `in ${days} days`;
  }
}

export default async function MomentumLocksPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch profile to get Slack user ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('slack_user_id, slack_team_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!profile?.slack_user_id || !profile?.slack_team_id) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="text-center py-12">
          <Lock className="w-12 h-12 text-coffee-steamed mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-coffee-espresso mb-2">Connect Slack First</h2>
          <p className="text-coffee-cortado mb-4">
            Momentum Locks work with your Slack workspace. Connect Slack to get started.
          </p>
          <Link
            href="/settings"
            className="inline-flex items-center px-4 py-2 bg-coffee-mocha text-white rounded-lg hover:bg-coffee-espresso transition-colors"
          >
            Go to Settings
          </Link>
        </div>
      </div>
    );
  }

  // Fetch locks where user is owner, requester, or fallback
  const locks = await db
    .select()
    .from(momentumLocks)
    .where(
      or(
        eq(momentumLocks.ownerUserId, profile.slack_user_id),
        eq(momentumLocks.requesterUserId, profile.slack_user_id),
        eq(momentumLocks.fallbackUserId, profile.slack_user_id)
      )
    )
    .orderBy(desc(momentumLocks.createdAt))
    .limit(50);

  // Separate active and completed locks
  const activeLocks = locks.filter(l =>
    ['draft', 'active', 'started', 'blocked'].includes(l.status)
  );
  const completedLocks = locks.filter(l =>
    ['done', 'canceled', 'expired'].includes(l.status)
  );

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-coffee-espresso tracking-tight">
          Momentum Locks
        </h1>
        <p className="text-coffee-cortado mt-1">
          Track work commitments across time zones
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-coffee-cream/40 rounded-xl border border-coffee-foam/50 p-4 mb-6">
        <p className="text-sm text-coffee-cortado">
          Create locks from Slack using <code className="bg-coffee-foam/80 px-1.5 py-0.5 rounded text-xs font-mono text-coffee-mocha">/attunly lock</code> in a thread,
          or right-click a message and select <strong>Create Momentum Lock</strong>.
        </p>
      </div>

      {/* Active Locks */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-coffee-mocha mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Active ({activeLocks.length})
        </h2>

        {activeLocks.length === 0 ? (
          <div className="bg-white rounded-xl border border-coffee-foam/50 p-6 text-center">
            <p className="text-coffee-cortado text-sm">No active locks</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeLocks.map((lock) => {
              const statusConfig = STATUS_CONFIG[lock.status as LockStatus] || STATUS_CONFIG.active;
              const StatusIcon = statusConfig.icon;
              const isOwner = lock.ownerUserId === profile.slack_user_id;
              const isRequester = lock.requesterUserId === profile.slack_user_id;

              return (
                <Link
                  key={lock.id}
                  href={`/momentum-locks/${lock.id}`}
                  className="block bg-white rounded-xl border border-coffee-foam/50 p-4 hover:border-coffee-steamed hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                        {isOwner && (
                          <span className="text-xs text-coffee-latte">You own this</span>
                        )}
                        {isRequester && !isOwner && (
                          <span className="text-xs text-coffee-latte">You requested</span>
                        )}
                      </div>
                      <p className="text-coffee-espresso font-medium line-clamp-1">
                        {lock.requiredOutcome}
                      </p>
                      <p className="text-xs text-coffee-cortado mt-1">
                        Deadline: {formatRelativeTime(new Date(lock.deadlineAt))}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-coffee-steamed group-hover:text-coffee-cortado transition-colors shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Locks */}
      {completedLocks.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-coffee-mocha mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Completed ({completedLocks.length})
          </h2>

          <div className="space-y-3">
            {completedLocks.map((lock) => {
              const statusConfig = STATUS_CONFIG[lock.status as LockStatus] || STATUS_CONFIG.done;
              const StatusIcon = statusConfig.icon;

              return (
                <Link
                  key={lock.id}
                  href={`/momentum-locks/${lock.id}`}
                  className="block bg-white/60 rounded-xl border border-coffee-foam/30 p-4 hover:border-coffee-steamed hover:bg-white transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-coffee-cortado line-clamp-1">
                        {lock.requiredOutcome}
                      </p>
                      <p className="text-xs text-coffee-latte mt-1">
                        {formatRelativeTime(new Date(lock.createdAt))}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-coffee-steamed/50 group-hover:text-coffee-cortado transition-colors shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
