import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RequestsClient } from "./requests-client";
import {
  getUserContext,
  getUserMomentumLocks,
  getLockEvents,
} from "@/lib/services/user-context";

export default async function RequestHistoryPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get complete user context
  const context = await getUserContext(supabase, user.id);

  if (!context) {
    redirect("/onboarding");
  }

  // If no Slack connected, redirect to dashboard (can't have locks)
  if (!context.slackUserId) {
    redirect("/dashboard");
  }

  // Fetch all momentum locks for this user (uses Slack ID)
  const allLocks = await getUserMomentumLocks(supabase, context.slackUserId);

  // Fetch events for all locks
  const lockIds = allLocks.map((l) => l.id);
  const allEvents = await getLockEvents(supabase, lockIds);

  // Calculate avg response time for completed locks
  const completedLocks = allLocks.filter((l) => l.status === "done");
  const avgResponseTime =
    completedLocks.length > 0
      ? completedLocks.reduce((acc, l) => {
          const created = new Date(l.created_at).getTime();
          const updated = new Date(l.updated_at).getTime();
          return acc + (updated - created);
        }, 0) /
        completedLocks.length /
        (1000 * 60 * 60) // Convert to hours
      : 0;

  return (
    <RequestsClient
      allLocks={allLocks}
      allEvents={allEvents}
      slackUserId={context.slackUserId}
      avgResponseTime={avgResponseTime}
      firstName={context.firstName || undefined}
    />
  );
}
