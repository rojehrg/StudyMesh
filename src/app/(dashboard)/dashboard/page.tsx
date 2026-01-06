import Link from "next/link";
import { Settings, ArrowRightMd } from "react-coolicons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Welcome */}
      <div className="text-center pt-8">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome{profile.first_name ? `, ${profile.first_name}` : ''}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Use <code className="bg-muted px-2 py-1 rounded text-sm font-mono">/attunly</code> in Slack to ask for help
        </p>
      </div>

      {/* Slack Connection Status */}
      <Card className={isSlackConnected ? "border-success/30 bg-success/5" : "border-warning/30 bg-warning/5"}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isSlackConnected ? "bg-success/20" : "bg-warning/20"
            }`}>
              <Slack className={`w-6 h-6 ${isSlackConnected ? "text-success" : "text-warning"}`} />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Slack Connection
                {isSlackConnected ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : (
                  <XCircle className="w-5 h-5 text-warning" />
                )}
              </CardTitle>
              <CardDescription>
                {isSlackConnected
                  ? `Connected as @${profile.slack_handle || 'user'}`
                  : "Connect Slack to use /attunly command"
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        {!isSlackConnected && (
          <CardContent className="pt-0">
            <Button asChild className="w-full">
              <Link href="/settings?tab=integrations">
                <Slack className="mr-2 h-4 w-4" />
                Connect Slack
              </Link>
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Settings Link */}
      <Link href="/settings">
        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Settings</h3>
                <p className="text-sm text-muted-foreground">Manage your profile and integrations</p>
              </div>
            </div>
            <ArrowRightMd className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>

      {/* How it works */}
      <Card className="bg-muted/30 border-dashed">
        <CardHeader>
          <CardTitle className="text-base">How to use Attunly</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">1</span>
            <p>Type <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-foreground">/attunly</code> followed by what you need help with</p>
          </div>
          <div className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</span>
            <p>Review the AI-generated message and pick who to ask</p>
          </div>
          <div className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</span>
            <p>Click send - they'll get a low-pressure DM</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
