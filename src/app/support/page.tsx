"use client";

import Link from "next/link";

export default function SupportPage() {
  return (
    <div
      className="min-h-screen bg-coffee-paper"
      style={{
        fontFamily: '"Source Serif 4", "Source Serif Pro", Georgia, "Times New Roman", serif',
      }}
    >
      {/* Header */}
      <header className="border-b border-coffee-foam bg-[#fffcf9]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="" className="w-6 h-6" />
            <span className="font-semibold text-xl text-coffee-espresso">attunly</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-coffee-cortado hover:text-coffee-espresso transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-semibold text-coffee-espresso mb-4">How can we help?</h1>
        <p className="text-xl text-coffee-cortado mb-12 leading-relaxed">
          Get support for Attunly. We typically respond within 24 hours.
        </p>

        <div className="space-y-6 mb-12">
          <div className="p-6 bg-coffee-paper rounded-lg border border-coffee-foam">
            <h2 className="text-lg font-medium text-coffee-espresso mb-2">Email Support</h2>
            <p className="text-coffee-cortado mb-4 leading-relaxed">
              Get help from our team via email.
            </p>
            <a
              href="mailto:support@attunly.com"
              className="text-coffee-espresso hover:text-coffee-roast font-medium"
            >
              support@attunly.com →
            </a>
          </div>
        </div>

        <div className="p-6 bg-coffee-cream rounded-lg border border-coffee-foam mb-12">
          <h2 className="text-2xl font-semibold text-coffee-espresso mb-6">Frequently Asked Questions</h2>
          <div className="space-y-8">
            <div>
              <h3 className="font-medium text-coffee-espresso mb-2">How do I use /attunly?</h3>
              <p className="text-coffee-cortado leading-relaxed">
                Type /attunly in any Slack channel or DM, describe what you need help with, and we'll draft a calm message for you. Review it, pick a recipient, and send.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-coffee-espresso mb-2">What does Attunly do with my data?</h3>
              <p className="text-coffee-cortado leading-relaxed">
                We only access the data needed to draft and send your message. Message content is not stored after delivery. See our <Link href="/privacy" className="text-coffee-espresso hover:text-coffee-roast">Privacy Policy</Link> for details.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-coffee-espresso mb-2">How do I remove Attunly from my workspace?</h3>
              <p className="text-coffee-cortado leading-relaxed">
                Go to your Slack workspace settings → Manage apps → Find Attunly → Remove. This will disconnect Attunly from your workspace.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-coffee-espresso mb-2">Is there a free trial?</h3>
              <p className="text-coffee-cortado leading-relaxed">
                Attunly is free to start. No credit card required. We'll let you know if that changes.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-coffee-latte">
            Can't find what you're looking for?{" "}
            <a href="mailto:support@attunly.com" className="text-coffee-espresso hover:text-coffee-roast">
              Contact us directly
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-12 bg-coffee-espresso text-coffee-latte">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <a href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="" className="w-6 h-6 invert" />
            <span className="text-xl font-semibold text-coffee-paper">attunly</span>
          </a>
          <div className="flex gap-8 text-sm">
            <Link href="/privacy" className="hover:text-coffee-paper transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-coffee-paper transition-colors">
              Terms
            </Link>
            <Link href="/support" className="text-coffee-paper">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
