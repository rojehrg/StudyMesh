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
    <div className="min-h-screen bg-coffee-paper light">
      {/* Header */}
      <header className="border-b border-coffee-foam bg-coffee-paper">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <img src="/icon.png" alt="Attunly" className="w-7 h-7" />
            <span className="font-bold text-xl">
              <span className="text-coffee-espresso">Attun</span>
              <span className="text-coffee-mocha">ly</span>
            </span>
          </Link>
          <Button variant="ghost" asChild className="text-coffee-cortado hover:text-coffee-espresso hover:bg-coffee-cream">
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
            <img src="/zoom-icon.svg" alt="Zoom" className="w-12 h-12" />
            <div>
              <h1 className="text-3xl font-bold text-coffee-espresso">Zoom Integration</h1>
              <p className="text-coffee-cortado">Connect Zoom to automatically create meeting links</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Overview */}
          <section>
            <h2 className="text-xl font-semibold text-coffee-espresso mb-4">Overview</h2>
            <p className="text-coffee-cortado mb-4">
              The Zoom integration allows Attunly to automatically create Zoom meeting links when you schedule syncs with teammates. This eliminates the need to manually create and share meeting URLs.
            </p>
            <Card className="bg-coffee-cream border-coffee-foam">
              <CardContent className="pt-4">
                <h3 className="font-medium text-coffee-espresso mb-2">What data does Attunly access?</h3>
                <ul className="text-sm text-coffee-cortado space-y-1">
                  <li>• Your Zoom user profile (name, email) for verification</li>
                  <li>• Ability to create meetings on your behalf</li>
                  <li>• We do NOT access your existing meetings or recordings</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Adding the App */}
          <section>
            <Card className="bg-coffee-paper border-coffee-foam">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-coffee-cream rounded-lg flex items-center justify-center">
                    <Link2 className="w-4 h-4 text-coffee-mocha" />
                  </div>
                  <CardTitle className="text-coffee-espresso">Connecting Zoom</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-coffee-mocha rounded-full flex items-center justify-center text-coffee-paper text-sm font-medium shrink-0">1</div>
                  <div>
                    <p className="font-medium text-coffee-espresso">Go to Settings</p>
                    <p className="text-sm text-coffee-cortado">Click on Settings in the sidebar, then select the "Integrations" tab.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-coffee-mocha rounded-full flex items-center justify-center text-coffee-paper text-sm font-medium shrink-0">2</div>
                  <div>
                    <p className="font-medium text-coffee-espresso">Click "Connect Zoom"</p>
                    <p className="text-sm text-coffee-cortado">Find the Zoom section and click the Connect button.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-coffee-mocha rounded-full flex items-center justify-center text-coffee-paper text-sm font-medium shrink-0">3</div>
                  <div>
                    <p className="font-medium text-coffee-espresso">Authorize with Zoom</p>
                    <p className="text-sm text-coffee-cortado">You'll be redirected to Zoom. Sign in and click "Allow" to grant Attunly access.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-coffee-cortado rounded-full flex items-center justify-center text-coffee-paper shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-coffee-espresso">Done!</p>
                    <p className="text-sm text-coffee-cortado">You'll be redirected back to Attunly. Zoom is now connected.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Using the Integration */}
          <section>
            <Card className="bg-coffee-paper border-coffee-foam">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-coffee-cream rounded-lg flex items-center justify-center">
                    <Settings className="w-4 h-4 text-coffee-mocha" />
                  </div>
                  <CardTitle className="text-coffee-espresso">Using the Integration</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-coffee-cortado">
                  Once connected, Zoom works automatically:
                </p>
                <ul className="space-y-2 text-coffee-cortado">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-coffee-cortado mt-0.5 shrink-0" />
                    <span>When you schedule a sync with a teammate, a Zoom link is automatically created</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-coffee-cortado mt-0.5 shrink-0" />
                    <span>The meeting link is included in the calendar invite and notification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-coffee-cortado mt-0.5 shrink-0" />
                    <span>Both you and your teammate can join with one click</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Removing the App */}
          <section>
            <Card className="bg-coffee-paper border-coffee-foam">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-coffee-steamed rounded-lg flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-coffee-roast" />
                  </div>
                  <CardTitle className="text-coffee-espresso">Disconnecting Zoom</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-coffee-cortado">
                  To disconnect Zoom from Attunly:
                </p>
                <ol className="space-y-2 text-coffee-cortado list-decimal list-inside">
                  <li>Go to <strong>Settings → Integrations</strong> in Attunly</li>
                  <li>Find the Zoom section and click <strong>"Disconnect"</strong></li>
                  <li>Optionally, revoke access from your <a href="https://marketplace.zoom.us/user/installed" className="text-coffee-mocha hover:underline" target="_blank" rel="noopener noreferrer">Zoom Marketplace installed apps</a></li>
                </ol>
                <p className="text-sm text-coffee-latte mt-4">
                  After disconnecting, Attunly will no longer be able to create Zoom meetings on your behalf. Any existing meetings created through Attunly will remain in your Zoom account.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Troubleshooting */}
          <section>
            <h2 className="text-xl font-semibold text-coffee-espresso mb-4">Troubleshooting</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-coffee-espresso mb-1">Connection failed?</h3>
                <p className="text-sm text-coffee-cortado">
                  Make sure you're signed into the correct Zoom account. Try disconnecting and reconnecting.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-coffee-espresso mb-1">Meeting links not generating?</h3>
                <p className="text-sm text-coffee-cortado">
                  Check that Zoom is still connected in Settings → Integrations. Your Zoom account must be active.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-coffee-espresso mb-1">Need more help?</h3>
                <p className="text-sm text-coffee-cortado">
                  Contact us at <a href="mailto:support@attunly.com" className="text-coffee-mocha hover:underline">support@attunly.com</a>
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-coffee-foam text-center text-sm text-coffee-latte">
          <p>
            Last updated: January 2026 •{" "}
            <Link href="/privacy" className="text-coffee-mocha hover:underline">Privacy Policy</Link>
            {" "} •{" "}
            <Link href="/terms" className="text-coffee-mocha hover:underline">Terms of Service</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
