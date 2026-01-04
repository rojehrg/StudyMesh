import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Settings, Link2, Trash2 } from "lucide-react";

export const metadata = {
  title: "Zoom Integration Guide - Attunly",
  description: "Learn how to connect, use, and manage the Zoom integration with Attunly.",
};

export default function ZoomDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 hover:opacity-90 transition-opacity">
            <span className="font-bold text-xl text-primary">Attun</span>
            <span className="font-bold text-xl text-foreground">ly</span>
          </Link>
          <Button variant="ghost" asChild>
            <Link href="/support">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Support
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#2D8CFF] rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.585 10.831v5.341a2.416 2.416 0 0 0 2.419 2.412h8.404a.403.403 0 0 0 .403-.402v-5.341a2.416 2.416 0 0 0-2.419-2.412H4.988a.403.403 0 0 0-.403.402zm12.812.403v4.133l3.016 2.012a.81.81 0 0 0 1.257-.672V7.293a.81.81 0 0 0-1.257-.672l-3.016 2.012v2.601z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Zoom Integration</h1>
              <p className="text-muted-foreground">Connect Zoom to automatically create meeting links</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Overview */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Overview</h2>
            <p className="text-muted-foreground mb-4">
              The Zoom integration allows Attunly to automatically create Zoom meeting links when you schedule syncs with teammates. This eliminates the need to manually create and share meeting URLs.
            </p>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4">
                <h3 className="font-medium text-foreground mb-2">What data does Attunly access?</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your Zoom user profile (name, email) for verification</li>
                  <li>• Ability to create meetings on your behalf</li>
                  <li>• We do NOT access your existing meetings or recordings</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Adding the App */}
          <section>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Link2 className="w-4 h-4 text-primary" />
                  </div>
                  <CardTitle>Connecting Zoom</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0">1</div>
                  <div>
                    <p className="font-medium text-foreground">Go to Settings</p>
                    <p className="text-sm text-muted-foreground">Click on Settings in the sidebar, then select the "Integrations" tab.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0">2</div>
                  <div>
                    <p className="font-medium text-foreground">Click "Connect Zoom"</p>
                    <p className="text-sm text-muted-foreground">Find the Zoom section and click the Connect button.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0">3</div>
                  <div>
                    <p className="font-medium text-foreground">Authorize with Zoom</p>
                    <p className="text-sm text-muted-foreground">You'll be redirected to Zoom. Sign in and click "Allow" to grant Attunly access.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Done!</p>
                    <p className="text-sm text-muted-foreground">You'll be redirected back to Attunly. Zoom is now connected.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Using the Integration */}
          <section>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Settings className="w-4 h-4 text-primary" />
                  </div>
                  <CardTitle>Using the Integration</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Once connected, Zoom works automatically:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>When you schedule a sync with a teammate, a Zoom link is automatically created</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>The meeting link is included in the calendar invite and notification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Both you and your teammate can join with one click</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Removing the App */}
          <section>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </div>
                  <CardTitle>Disconnecting Zoom</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  To disconnect Zoom from Attunly:
                </p>
                <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                  <li>Go to <strong>Settings → Integrations</strong> in Attunly</li>
                  <li>Find the Zoom section and click <strong>"Disconnect"</strong></li>
                  <li>Optionally, revoke access from your <a href="https://marketplace.zoom.us/user/installed" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Zoom Marketplace installed apps</a></li>
                </ol>
                <p className="text-sm text-muted-foreground mt-4">
                  After disconnecting, Attunly will no longer be able to create Zoom meetings on your behalf. Any existing meetings created through Attunly will remain in your Zoom account.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Troubleshooting */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Troubleshooting</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground mb-1">Connection failed?</h3>
                <p className="text-sm text-muted-foreground">
                  Make sure you're signed into the correct Zoom account. Try disconnecting and reconnecting.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">Meeting links not generating?</h3>
                <p className="text-sm text-muted-foreground">
                  Check that Zoom is still connected in Settings → Integrations. Your Zoom account must be active.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">Need more help?</h3>
                <p className="text-sm text-muted-foreground">
                  Contact us at <a href="mailto:support@attunly.com" className="text-primary hover:underline">support@attunly.com</a>
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            Last updated: January 2026 •{" "}
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            {" "} •{" "}
            <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
