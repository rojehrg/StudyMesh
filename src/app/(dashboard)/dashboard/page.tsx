import Link from "next/link";
import { Settings, ArrowRightMd } from "react-coolicons";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CheckCircle, XCircle, Slack, Calendar, MessageSquare, Users } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch profile with calendar connection status
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('first_name, last_name, slack_connected, slack_handle, google_calendar_connected')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Error fetching profile:", profileError.message);
  }

  if (!profile) {
    redirect('/onboarding');
  }

  // Fetch activity stats for this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [sentNudges, receivedNudges] = await Promise.all([
    supabase
      .from('nudges')
      .select('id', { count: 'exact', head: true })
      .eq('sender_id', user.id)
      .gte('created_at', weekAgo.toISOString()),
    supabase
      .from('nudges')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', user.id)
      .gte('created_at', weekAgo.toISOString())
  ]);

  const isSlackConnected = profile.slack_connected === true;
  const isCalendarConnected = profile.google_calendar_connected === true;
  const nudgesSent = sentNudges.count || 0;
  const nudgesReceived = receivedNudges.count || 0;

  // Determine setup status
  const isFullySetup = isSlackConnected;
  const statusMessage = isFullySetup
    ? "You're all set! Use /attunly in Slack to get help."
    : "Complete your setup to start using Attunly.";

  return (
    <div className="max-w-xl mx-auto space-y-6 py-8">
      {/* Welcome */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-coffee-espresso tracking-tight">
          {isFullySetup ? "You're all set" : "Welcome"}{profile.first_name ? `, ${profile.first_name}` : ''}!
        </h1>
        <p className="text-coffee-cortado mt-2">
          {isFullySetup ? (
            <>Use <code className="bg-coffee-foam/60 px-2 py-0.5 rounded text-sm font-mono text-coffee-mocha">/attunly</code> in Slack to ask for help</>
          ) : (
            statusMessage
          )}
        </p>
      </div>

      {/* Connection Status Cards */}
      <div className="grid gap-4">
        {/* Slack Connection */}
        <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
          isSlackConnected ? "border-coffee-foam" : "border-coffee-oat"
        }`}>
          <div className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-[#4A154B]/10 flex items-center justify-center shrink-0">
              <Slack className="w-5 h-5 text-[#4A154B]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-coffee-espresso">Slack</h3>
                {isSlackConnected ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-coffee-oat" />
                )}
              </div>
              <p className="text-sm text-coffee-cortado">
                {isSlackConnected
                  ? `Connected as @${profile.slack_handle || 'user'}`
                  : "Required for /attunly command"
                }
              </p>
            </div>
            {!isSlackConnected && (
              <Button asChild size="sm" className="bg-[#4A154B] hover:bg-[#3a1039] text-white">
                <Link href="/settings">
                  Connect
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Calendar Connection */}
        <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
          isCalendarConnected ? "border-coffee-foam" : "border-coffee-foam/50"
        }`}>
          <div className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-coffee-espresso">Calendar</h3>
                {isCalendarConnected ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                ) : (
                  <span className="text-xs text-coffee-latte">Optional</span>
                )}
              </div>
              <p className="text-sm text-coffee-cortado">
                {isCalendarConnected
                  ? "Syncing your availability"
                  : "Sync to show when you're free"
                }
              </p>
            </div>
            {!isCalendarConnected && (
              <Button asChild size="sm" variant="outline">
                <Link href="/settings">
                  Connect
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      {isFullySetup && (
        <div className="bg-white rounded-xl border border-coffee-foam shadow-sm p-5">
          <h3 className="text-sm font-medium text-coffee-mocha mb-4">This week</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-coffee-cream/60 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-coffee-mocha" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-coffee-espresso">{nudgesSent}</p>
                <p className="text-xs text-coffee-cortado">asks sent</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-coffee-cream/60 flex items-center justify-center">
                <Users className="w-4 h-4 text-coffee-mocha" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-coffee-espresso">{nudgesReceived}</p>
                <p className="text-xs text-coffee-cortado">people helped</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How it works - Only show if not fully set up */}
      {!isFullySetup && (
        <div className="bg-coffee-cream/40 rounded-xl border border-coffee-foam/50 p-5">
          <h3 className="text-sm font-medium text-coffee-mocha mb-4">How to use Attunly</h3>
          <div className="space-y-3 text-sm text-coffee-cortado">
            <div className="flex gap-3 items-start">
              <span className="w-5 h-5 rounded-full bg-coffee-foam text-coffee-mocha flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">1</span>
              <p>Type <code className="bg-coffee-foam/80 px-1.5 py-0.5 rounded text-xs font-mono text-coffee-mocha">/attunly</code> followed by what you need help with</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="w-5 h-5 rounded-full bg-coffee-foam text-coffee-mocha flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">2</span>
              <p>Review the AI-generated message and pick who to ask</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="w-5 h-5 rounded-full bg-coffee-foam text-coffee-mocha flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">3</span>
              <p>Click send - they'll get a low-pressure DM</p>
            </div>
          </div>
        </div>
      )}

      {/* Settings Link */}
      <Link href="/settings" className="block group">
        <div className="bg-white rounded-xl border border-coffee-foam/50 p-4 hover:border-coffee-steamed hover:shadow-sm transition-all flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-coffee-cream/60 rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-coffee-mocha" />
            </div>
            <div>
              <h3 className="font-medium text-coffee-espresso text-sm">Settings</h3>
              <p className="text-xs text-coffee-latte">Manage your profile and integrations</p>
            </div>
          </div>
          <ArrowRightMd className="w-4 h-4 text-coffee-steamed group-hover:text-coffee-cortado transition-colors" />
        </div>
      </Link>
    </div>
  );
}
