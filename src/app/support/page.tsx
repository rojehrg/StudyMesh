import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Mail, FileText, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Support - Attunly",
  description: "Get help with Attunly. Contact our support team or browse our documentation.",
};

export default function SupportPage() {
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
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">How can we help?</h1>
          <p className="text-xl text-muted-foreground">
            Get support for Attunly. We're here to help you succeed.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Email Support</CardTitle>
              <CardDescription>
                Get help from our team via email. We typically respond within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="mailto:support@attunly.com"
                className="text-primary hover:underline font-medium"
              >
                support@attunly.com
              </a>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Documentation</CardTitle>
              <CardDescription>
                Browse guides and tutorials to get the most out of Attunly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/docs/zoom"
                className="text-primary hover:underline font-medium"
              >
                View Documentation
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground mb-2">How do I connect Slack?</h3>
              <p className="text-muted-foreground">
                Go to Settings → Integrations and click "Connect Slack". You'll be redirected to authorize Attunly with your Slack workspace.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">How do I create a pod?</h3>
              <p className="text-muted-foreground">
                Click "Create Pod" from your dashboard. Give it a name and share the pod code with your teammates so they can join.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">How does Find Help work?</h3>
              <p className="text-muted-foreground">
                Our AI matches your request with teammates who have relevant expertise. Just describe what you need help with, and we'll show you the best matches.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">How do I delete my account?</h3>
              <p className="text-muted-foreground">
                Go to Settings → scroll to the bottom → click "Delete Account". This will permanently delete all your data.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-12 text-muted-foreground">
          <p>
            Can't find what you're looking for?{" "}
            <a href="mailto:support@attunly.com" className="text-primary hover:underline">
              Contact us directly
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
