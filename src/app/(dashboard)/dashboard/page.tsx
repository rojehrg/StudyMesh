import Link from "next/link";
import { Settings, ArrowRightMd } from "react-coolicons";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CheckCircle, XCircle, Slack } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('first_name, last_name, slack_connected, slack_handle')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Error fetching profile:", profileError.message);
  }

  if (!profile) {
    redirect('/onboarding');
  }

  const isSlackConnected = profile.slack_connected === true;

  return (
    <div className="max-w-xl mx-auto space-y-6 py-8">
      {/* Welcome */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-coffee-espresso tracking-tight">
          Welcome{profile.first_name ? `, ${profile.first_name}` : ''}!
        </h1>
        <p className="text-coffee-cortado mt-2">
          Use <code className="bg-coffee-foam/60 px-2 py-0.5 rounded text-sm font-mono text-coffee-mocha">/attunly</code> in Slack to ask for help
        </p>
      </div>

      {/* Slack Connection Status */}
      <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
        isSlackConnected ? "border-coffee-foam" : "border-coffee-oat"
      }`}>
        <div className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-[#4A154B]/10 flex items-center justify-center shrink-0">
            <Slack className="w-5 h-5 text-[#4A154B]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-coffee-espresso">Slack Connection</h3>
              {isSlackConnected ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              ) : (
                <XCircle className="w-4 h-4 text-coffee-oat" />
              )}
            </div>
            <p className="text-sm text-coffee-cortado">
              {isSlackConnected
                ? `Connected as @${profile.slack_handle || 'user'}`
                : "Connect Slack to use /attunly command"
              }
            </p>
          </div>
        </div>
        {!isSlackConnected && (
          <div className="px-5 pb-5">
            <Button asChild className="w-full bg-[#4A154B] hover:bg-[#3a1039] text-white h-10 font-medium rounded-lg">
              <Link href="/settings?tab=integrations">
                <Slack className="mr-2 h-4 w-4" />
                Connect Slack
              </Link>
            </Button>
          </div>
        )}
      </div>

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

      {/* How it works */}
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
    </div>
  );
}
