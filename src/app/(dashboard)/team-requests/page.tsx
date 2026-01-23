"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle, AlertCircle, Users, Timer, PlayCircle, PauseCircle, ShieldAlert } from "lucide-react";
import { PageLoader } from "@/components/loading-states";
import { usePermissions } from "@/hooks/use-permissions";
import { Permission } from "@/lib/rbac/permissions";

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
} as const;

type LockStatus = keyof typeof STATUS_CONFIG;

interface TeamMember {
  slackUserId: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl?: string;
}

interface TeamLock {
  id: string;
  required_outcome: string;
  status: LockStatus;
  deadline_at: string;
  created_at: string;
  owner_user_id: string;
  requester_user_id: string;
  impact_statement: string | null;
}

interface OrgData {
  slack_team_id: string;
  name: string | null;
}

interface ProfileData {
  slack_user_id: string | null;
  organization_id: string;
  first_name: string | null;
}

function StatusBadge({ status }: { status: LockStatus }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.active;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

function getInitials(firstName: string | null, lastName: string | null): string {
  const f = firstName?.charAt(0) || "";
  const l = lastName?.charAt(0) || "";
  return (f + l).toUpperCase() || "?";
}

function TeamLockRow({
  lock,
  members,
  currentUserId,
}: {
  lock: TeamLock;
  members: Map<string, TeamMember>;
  currentUserId: string;
}) {
  const deadline = new Date(lock.deadline_at);
  const isOverdue = deadline < new Date() && !["done"].includes(lock.status);
  const owner = members.get(lock.owner_user_id);
  const requester = members.get(lock.requester_user_id);

  const hoursLeft = Math.round((deadline.getTime() - Date.now()) / (1000 * 60 * 60));
  let timeText: string;
  if (isOverdue) {
    timeText = "Overdue";
  } else if (hoursLeft < 1) {
    timeText = "< 1h";
  } else if (hoursLeft < 24) {
    timeText = `${hoursLeft}h`;
  } else {
    timeText = `${Math.round(hoursLeft / 24)}d`;
  }

  const isYourRequest =
    lock.owner_user_id === currentUserId ||
    lock.requester_user_id === currentUserId;

  return (
    <div
      className={`bg-white border rounded-lg p-4 ${
        isYourRequest ? "border-coffee-steamed" : "border-coffee-foam"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Owner Avatar */}
        <div className="shrink-0">
          <div className="w-10 h-10 rounded-full bg-coffee-cream flex items-center justify-center text-sm font-medium text-coffee-mocha">
            {getInitials(owner?.firstName || null, owner?.lastName || null)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={lock.status} />
            {isYourRequest && (
              <span className="text-xs text-coffee-cortado bg-coffee-cream/60 px-1.5 py-0.5 rounded">
                You're involved
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-coffee-espresso line-clamp-2 mb-1">
            {lock.required_outcome}
          </p>
          <div className="flex items-center gap-3 text-xs text-coffee-cortado">
            <span>
              Owner: {owner ? `${owner.firstName || ""} ${owner.lastName || ""}`.trim() || "Unknown" : "Unknown"}
            </span>
            <span>
              Requester: {requester ? `${requester.firstName || ""} ${requester.lastName || ""}`.trim() || "Unknown" : "Unknown"}
            </span>
          </div>
        </div>

        {/* Deadline */}
        <div className="shrink-0 text-right">
          <div
            className={`text-sm font-medium ${
              isOverdue ? "text-coffee-roast" : "text-coffee-cortado"
            }`}
          >
            {timeText}
          </div>
          <div className="text-xs text-coffee-latte">
            {deadline.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 px-6">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-coffee-cream/60 flex items-center justify-center">
        <Users className="w-8 h-8 text-coffee-latte" />
      </div>
      <h3 className="text-lg font-medium text-coffee-espresso mb-2">No team requests</h3>
      <p className="text-sm text-coffee-cortado mb-6 max-w-sm mx-auto">
        Your team doesn't have any active momentum locks. Use{" "}
        <code className="bg-coffee-foam/80 px-1.5 py-0.5 rounded text-xs font-mono text-coffee-mocha">
          /attunly lock
        </code>{" "}
        in Slack to create one.
      </p>
    </div>
  );
}

export default function TeamRequestsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { loading: permLoading, membership } = usePermissions();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [org, setOrg] = useState<OrgData | null>(null);
  const [allLocks, setAllLocks] = useState<TeamLock[]>([]);
  const [members, setMembers] = useState<Map<string, TeamMember>>(new Map());

  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch user's profile with organization
      const { data: profileData } = await supabase
        .from("profiles")
        .select("slack_user_id, organization_id, first_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profileData?.organization_id) {
        router.push("/dashboard");
        return;
      }

      setProfile(profileData);

      // Get organization's Slack team ID
      const { data: orgData } = await supabase
        .from("organizations")
        .select("slack_team_id, name")
        .eq("id", profileData.organization_id)
        .maybeSingle();

      if (!orgData?.slack_team_id) {
        router.push("/dashboard");
        return;
      }

      setOrg(orgData);

      // Fetch all active momentum locks for the team
      const { data: teamLocks, error: locksError } = await supabase
        .from("momentum_locks")
        .select("*")
        .eq("workspace_id", orgData.slack_team_id)
        .in("status", ["active", "started", "blocked"])
        .order("deadline_at", { ascending: true });

      if (locksError) {
        console.error("Error fetching team locks:", locksError);
      }

      const locks = (teamLocks || []) as TeamLock[];
      setAllLocks(locks);

      // Get unique user IDs from locks
      const userIds = new Set<string>();
      for (const lock of locks) {
        userIds.add(lock.owner_user_id);
        userIds.add(lock.requester_user_id);
      }

      // Fetch profiles for these users
      const membersMap = new Map<string, TeamMember>();
      if (userIds.size > 0) {
        const { data: memberProfiles } = await supabase
          .from("profiles")
          .select("slack_user_id, first_name, last_name")
          .in("slack_user_id", Array.from(userIds));

        for (const p of memberProfiles || []) {
          if (p.slack_user_id) {
            membersMap.set(p.slack_user_id, {
              slackUserId: p.slack_user_id,
              firstName: p.first_name,
              lastName: p.last_name,
            });
          }
        }
      }
      setMembers(membersMap);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  useEffect(() => {
    if (!permLoading && membership?.isAdmin) {
      loadData();
    } else if (!permLoading) {
      setLoading(false);
    }
  }, [permLoading, membership?.isAdmin, loadData]);

  if (permLoading || loading) {
    return <PageLoader />;
  }

  // Check if user has permission to view team requests (admin/owner only)
  if (!membership?.isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <ShieldAlert className="w-12 h-12 text-coffee-latte mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-coffee-espresso mb-2">
          Access Restricted
        </h1>
        <p className="text-coffee-cortado mb-6">
          You don't have permission to view team requests. This page is only available to admins and owners.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-coffee-cortado hover:text-coffee-espresso transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Categorize locks
  const overdueLocks = allLocks.filter(
    (l) => new Date(l.deadline_at) < new Date()
  );
  const urgentLocks = allLocks.filter((l) => {
    const deadline = new Date(l.deadline_at);
    const now = new Date();
    const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursLeft > 0 && hoursLeft <= 4;
  });
  const upcomingLocks = allLocks.filter((l) => {
    const deadline = new Date(l.deadline_at);
    const now = new Date();
    const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursLeft > 4;
  });

  // Stats
  const totalActive = allLocks.length;
  const blockedCount = allLocks.filter((l) => l.status === "blocked").length;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-coffee-cortado hover:text-coffee-espresso transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-coffee-espresso">
              Team Requests
            </h1>
            <p className="text-coffee-cortado mt-1">
              {org?.name ? `${org.name} - ` : ""}What the team is waiting on
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      {totalActive > 0 && (
        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-coffee-foam">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-coffee-cortado" />
            <span className="text-sm text-coffee-cortado">
              <span className="font-medium text-coffee-espresso">{totalActive}</span> active
            </span>
          </div>
          {overdueLocks.length > 0 && (
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-coffee-roast" />
              <span className="text-sm text-coffee-roast font-medium">
                {overdueLocks.length} overdue
              </span>
            </div>
          )}
          {blockedCount > 0 && (
            <div className="flex items-center gap-2">
              <PauseCircle className="w-4 h-4 text-coffee-oat" />
              <span className="text-sm text-coffee-oat">
                {blockedCount} blocked
              </span>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {totalActive === 0 && <EmptyState />}

      {/* Overdue Section */}
      {overdueLocks.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-medium text-coffee-roast mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Overdue ({overdueLocks.length})
          </h2>
          <div className="space-y-3">
            {overdueLocks.map((lock) => (
              <TeamLockRow
                key={lock.id}
                lock={lock}
                members={members}
                currentUserId={profile?.slack_user_id || ""}
              />
            ))}
          </div>
        </section>
      )}

      {/* Urgent Section */}
      {urgentLocks.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-medium text-coffee-oat mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Due Soon ({urgentLocks.length})
          </h2>
          <div className="space-y-3">
            {urgentLocks.map((lock) => (
              <TeamLockRow
                key={lock.id}
                lock={lock}
                members={members}
                currentUserId={profile?.slack_user_id || ""}
              />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Section */}
      {upcomingLocks.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-coffee-mocha mb-3 flex items-center gap-2">
            <Timer className="w-4 h-4" />
            Upcoming ({upcomingLocks.length})
          </h2>
          <div className="space-y-3">
            {upcomingLocks.map((lock) => (
              <TeamLockRow
                key={lock.id}
                lock={lock}
                members={members}
                currentUserId={profile?.slack_user_id || ""}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
