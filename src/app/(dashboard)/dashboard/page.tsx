import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";
import {
  getUserContext,
  getUserActivityStats,
  calculateActivationScore,
} from "@/lib/services/user-context";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get complete user context (bridges Supabase + Slack identities)
  const context = await getUserContext(supabase, user.id);

  if (!context) {
    redirect('/onboarding');
  }

  // Get activity stats (uses Slack ID for momentum locks)
  const stats = await getUserActivityStats(supabase, context);

  // Calculate activation score
  const activationScore = calculateActivationScore(context, stats);

  // Determine user state
  const isFullySetup = context.slackConnected;
  const isFirstTimeUser = stats.isFirstTimeUser;
  const hasNoActivity = !stats.hasActivity;

  return (
    <DashboardClient
      firstName={context.firstName || undefined}
      isSlackConnected={context.slackConnected}
      isCalendarConnected={context.hasCalendarConnected}
      hasExpertise={context.hasExpertise}
      nudgesSent={stats.nudgesSent}
      nudgesReceived={stats.nudgesReceived}
      activeLocksCount={stats.activeLocksCount}
      completedLocksCount={stats.completedLocksCount}
      activationScore={activationScore}
      isFullySetup={isFullySetup}
      isFirstTimeUser={isFirstTimeUser}
      hasNoActivity={hasNoActivity}
      slackHandle={context.slackHandle || undefined}
    />
  );
}
