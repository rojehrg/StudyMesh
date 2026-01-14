import Link from "next/link";
import { Settings, ArrowRightMd } from "react-coolicons";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CheckCircle, XCircle, Slack, Calendar, MessageSquare, Users, Clock, Zap, ArrowRight, Target } from "lucide-react";

// Sample request suggestions for first-time users
const SAMPLE_REQUESTS = [
  {
    category: "Technical Help",
    examples: [
      "Who knows how to debug memory leaks in Node.js?",
      "Need help setting up CI/CD pipelines",
      "Looking for someone familiar with GraphQL schema design",
    ],
  },
  {
    category: "Process Questions",
    examples: [
      "Who handles expense report approvals?",
      "Need guidance on the quarterly planning process",
      "Looking for help navigating vendor contracts",
    ],
  },
  {
    category: "Cross-Team Collaboration",
    examples: [
      "Who's the go-to person for marketing analytics?",
      "Need an intro to someone on the legal team",
      "Looking for design feedback on a new feature",
    ],
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch profile with more fields for first-time experience
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('first_name, last_name, slack_connected, slack_handle, expertise_text, created_at')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Error fetching profile:", profileError.message);
  }

  if (!profile) {
    redirect('/onboarding');
  }

  // Check for Google Calendar connection in user_provider_credentials
  const { data: googleCreds } = await supabase
    .from('user_provider_credentials')
    .select('id')
    .eq('user_id', user.id)
    .eq('provider', 'google')
    .maybeSingle();

  // Fetch activity stats for this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  // Fetch all stats in parallel
  const [sentNudges, receivedNudges, activeLocks, completedLocks] = await Promise.all([
    supabase
      .from('nudges')
      .select('id', { count: 'exact', head: true })
      .eq('sender_id', user.id)
      .gte('created_at', weekAgo.toISOString()),
    supabase
      .from('nudges')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', user.id)
      .gte('created_at', weekAgo.toISOString()),
    // Count active momentum locks where user is owner or requester
    supabase
      .from('momentum_locks')
      .select('id', { count: 'exact', head: true })
      .or(`owner_user_id.eq.${user.id},requester_user_id.eq.${user.id}`)
      .in('status', ['active', 'started', 'blocked']),
    // Count completed locks this week
    supabase
      .from('momentum_locks')
      .select('id', { count: 'exact', head: true })
      .or(`owner_user_id.eq.${user.id},requester_user_id.eq.${user.id}`)
      .eq('status', 'done')
      .gte('updated_at', weekAgo.toISOString()),
  ]);

  const isSlackConnected = profile.slack_connected === true;
  const isCalendarConnected = !!googleCreds;
  const hasExpertise = !!profile.expertise_text;
  const nudgesSent = sentNudges.count || 0;
  const nudgesReceived = receivedNudges.count || 0;
  const activeLocksCount = activeLocks.count || 0;
  const completedLocksCount = completedLocks.count || 0;

  // Determine user state
  const isFullySetup = isSlackConnected;
  const isFirstTimeUser = nudgesSent === 0 && nudgesReceived === 0 && activeLocksCount === 0;
  const hasNoActivity = isFirstTimeUser && completedLocksCount === 0;

  // Calculate activation score (0-100)
  const activationSteps = [
    isSlackConnected,
    hasExpertise,
    isCalendarConnected,
    nudgesSent > 0,
  ];
  const activationScore = Math.round((activationSteps.filter(Boolean).length / activationSteps.length) * 100);

  return (
    <div className="max-w-xl mx-auto space-y-6 py-8">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-coffee-espresso tracking-tight">
          {isFirstTimeUser && isSlackConnected ? "Ready to get started" : isFullySetup ? "You're all set" : "Welcome"}{profile.first_name ? `, ${profile.first_name}` : ''}!
        </h1>
        <p className="text-coffee-cortado mt-2">
          {isFullySetup ? (
            <>Use <code className="bg-coffee-foam/60 px-2 py-0.5 rounded text-sm font-mono text-coffee-mocha">/attunly</code> in Slack to ask for help</>
          ) : (
            "Complete your setup to start using Attunly."
          )}
        </p>
      </div>

      {/* Activation Progress - Show for partially set up users */}
      {isSlackConnected && activationScore < 100 && (
        <div className="bg-coffee-cream/30 rounded-xl border border-coffee-foam p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-coffee-espresso">Getting started</h3>
            <span className="text-xs text-coffee-cortado">{activationScore}% complete</span>
          </div>
          <div className="h-1.5 bg-coffee-foam rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-coffee-espresso rounded-full transition-all duration-500"
              style={{ width: `${activationScore}%` }}
            />
          </div>
          <div className="space-y-2">
            {!hasExpertise && (
              <Link href="/settings" className="flex items-center gap-3 p-2 rounded-lg hover:bg-coffee-foam/50 transition-colors group">
                <div className="w-6 h-6 rounded-full border-2 border-dashed border-coffee-oat flex items-center justify-center">
                  <Target className="w-3 h-3 text-coffee-oat" />
                </div>
                <span className="text-sm text-coffee-cortado group-hover:text-coffee-espresso flex-1">Describe your expertise so others can find you</span>
                <ArrowRight className="w-4 h-4 text-coffee-latte group-hover:text-coffee-cortado" />
              </Link>
            )}
            {!isCalendarConnected && (
              <Link href="/settings" className="flex items-center gap-3 p-2 rounded-lg hover:bg-coffee-foam/50 transition-colors group">
                <div className="w-6 h-6 rounded-full border-2 border-dashed border-coffee-oat flex items-center justify-center">
                  <Calendar className="w-3 h-3 text-coffee-oat" />
                </div>
                <span className="text-sm text-coffee-cortado group-hover:text-coffee-espresso flex-1">Connect your calendar to show availability</span>
                <ArrowRight className="w-4 h-4 text-coffee-latte group-hover:text-coffee-cortado" />
              </Link>
            )}
            {nudgesSent === 0 && (
              <div className="flex items-center gap-3 p-2 rounded-lg bg-coffee-foam/30">
                <div className="w-6 h-6 rounded-full border-2 border-dashed border-coffee-oat flex items-center justify-center">
                  <Zap className="w-3 h-3 text-coffee-oat" />
                </div>
                <span className="text-sm text-coffee-cortado flex-1">Send your first request using <code className="bg-coffee-foam/80 px-1 py-0.5 rounded text-xs font-mono">/attunly</code></span>
              </div>
            )}
          </div>
        </div>
      )}

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
            <div className="w-11 h-11 rounded-lg bg-coffee-cream flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-coffee-mocha" />
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

      {/* Active Momentum Locks - Quick Access */}
      {isFullySetup && activeLocksCount > 0 && (
        <Link href="/requests" className="block group">
          <div className="bg-coffee-cream/40 rounded-xl border border-coffee-foam p-5 hover:border-coffee-steamed hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-coffee-foam flex items-center justify-center">
                  <Clock className="w-5 h-5 text-coffee-mocha" />
                </div>
                <div>
                  <h3 className="font-medium text-coffee-espresso">
                    {activeLocksCount} active request{activeLocksCount !== 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-coffee-cortado">View status and timeline</p>
                </div>
              </div>
              <ArrowRightMd className="w-4 h-4 text-coffee-steamed group-hover:text-coffee-cortado transition-colors" />
            </div>
          </div>
        </Link>
      )}

      {/* Activity Stats - For established users */}
      {isFullySetup && !hasNoActivity && (
        <div className="bg-white rounded-xl border border-coffee-foam shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-coffee-mocha">This week</h3>
            <Link href="/requests" className="text-xs text-coffee-cortado hover:text-coffee-espresso transition-colors">
              View all activity
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-3 bg-coffee-cream/30 rounded-lg">
              <p className="text-2xl font-semibold text-coffee-espresso">{nudgesSent}</p>
              <p className="text-xs text-coffee-cortado text-center">asks sent</p>
            </div>
            <div className="flex flex-col items-center p-3 bg-coffee-cream/30 rounded-lg">
              <p className="text-2xl font-semibold text-coffee-espresso">{nudgesReceived}</p>
              <p className="text-xs text-coffee-cortado text-center">people helped</p>
            </div>
            <div className="flex flex-col items-center p-3 bg-coffee-cream/30 rounded-lg">
              <p className="text-2xl font-semibold text-coffee-espresso">{completedLocksCount}</p>
              <p className="text-xs text-coffee-cortado text-center">completed</p>
            </div>
          </div>
        </div>
      )}

      {/* First-Time User: Sample Request Suggestions */}
      {isFullySetup && isFirstTimeUser && (
        <div className="bg-white rounded-xl border border-coffee-foam shadow-sm overflow-hidden">
          <div className="p-5 pb-4">
            <h3 className="text-sm font-medium text-coffee-mocha mb-1">Try asking for help</h3>
            <p className="text-xs text-coffee-cortado">Copy one of these to Slack and type <code className="bg-coffee-foam/80 px-1 py-0.5 rounded font-mono">/attunly</code></p>
          </div>
          <div className="border-t border-coffee-foam/50">
            {SAMPLE_REQUESTS.map((category, idx) => (
              <div key={category.category} className={idx > 0 ? "border-t border-coffee-foam/50" : ""}>
                <div className="px-5 py-2 bg-coffee-cream/20">
                  <span className="text-xs font-medium text-coffee-mocha">{category.category}</span>
                </div>
                <div className="divide-y divide-coffee-foam/30">
                  {category.examples.map((example) => (
                    <div key={example} className="px-5 py-3 hover:bg-coffee-cream/20 transition-colors cursor-pointer group">
                      <p className="text-sm text-coffee-cortado group-hover:text-coffee-espresso">{example}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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

      {/* Quick Actions */}
      <div className="grid gap-3">
        {/* Request History Link */}
        {isFullySetup && (
          <Link href="/requests" className="block group">
            <div className="bg-white rounded-xl border border-coffee-foam/50 p-4 hover:border-coffee-steamed hover:shadow-sm transition-all flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-coffee-cream/60 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-coffee-mocha" />
                </div>
                <div>
                  <h3 className="font-medium text-coffee-espresso text-sm">Request History</h3>
                  <p className="text-xs text-coffee-latte">View all your requests and their status</p>
                </div>
              </div>
              <ArrowRightMd className="w-4 h-4 text-coffee-steamed group-hover:text-coffee-cortado transition-colors" />
            </div>
          </Link>
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
    </div>
  );
}
