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
    <div className="min-h-screen bg-white light">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <img src="/icon.png" alt="Attunly" className="w-7 h-7" />
            <span className="font-bold text-xl">
              <span className="text-gray-900">Attun</span>
              <span className="text-violet-600">ly</span>
            </span>
          </Link>
          <Button variant="ghost" asChild className="text-gray-700 hover:text-gray-900 hover:bg-gray-100">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How can we help?</h1>
          <p className="text-xl text-gray-600">
            Get support for Attunly. We're here to help you succeed.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="hover:border-violet-300 transition-colors bg-white border-gray-200">
            <CardHeader>
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-violet-600" />
              </div>
              <CardTitle className="text-gray-900">Email Support</CardTitle>
              <CardDescription className="text-gray-600">
                Get help from our team via email. We typically respond within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="mailto:support@attunly.com"
                className="text-violet-600 hover:underline font-medium"
              >
                support@attunly.com
              </a>
            </CardContent>
          </Card>

          <Card className="hover:border-violet-300 transition-colors bg-white border-gray-200">
            <CardHeader>
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-violet-600" />
              </div>
              <CardTitle className="text-gray-900">Documentation</CardTitle>
              <CardDescription className="text-gray-600">
                Browse guides and tutorials to get the most out of Attunly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/docs/zoom"
                className="text-violet-600 hover:underline font-medium"
              >
                View Documentation
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How do I connect Slack?</h3>
              <p className="text-gray-600">
                Go to Settings → Integrations and click "Connect Slack". You'll be redirected to authorize Attunly with your Slack workspace.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How do I create a pod?</h3>
              <p className="text-gray-600">
                Click "Create Pod" from your dashboard. Give it a name and share the pod code with your teammates so they can join.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How does AI Match work?</h3>
              <p className="text-gray-600">
                AI Match uses AI to find teammates with relevant expertise. Just describe what you need help with, and we'll show you the best matches.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How do I delete my account?</h3>
              <p className="text-gray-600">
                Go to Settings → scroll to the bottom → click "Delete Account". This will permanently delete all your data.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-12 text-gray-500">
          <p>
            Can't find what you're looking for?{" "}
            <a href="mailto:support@attunly.com" className="text-violet-600 hover:underline">
              Contact us directly
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
