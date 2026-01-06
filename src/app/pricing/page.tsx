"use client";

import Link from "next/link";

const SlackIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
  </svg>
);

export default function PricingPage() {
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
        <p className="text-coffee-latte text-sm tracking-wide uppercase mb-4">
          Pricing
        </p>

        <h1 className="text-4xl md:text-5xl font-semibold text-coffee-espresso leading-tight mb-6">
          Free to start.
          <br />
          <span className="text-coffee-oat">No credit card.</span>
        </h1>

        <p className="text-xl text-coffee-cortado mb-12 leading-relaxed max-w-[60ch]">
          Attunly is free to use. Add it to your Slack workspace and start asking for help without overthinking.
        </p>

        {/* Single Pricing Card */}
        <div className="p-8 bg-coffee-paper rounded-lg border border-coffee-foam mb-12">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-5xl font-semibold text-coffee-espresso">$0</span>
            <span className="text-coffee-latte">/month</span>
          </div>

          <p className="text-coffee-cortado mb-6 leading-relaxed">
            Everything you need to ask for help in Slack.
          </p>

          <div className="space-y-3 mb-8">
            {[
              "Unlimited /attunly commands",
              "AI-drafted messages",
              "Send DMs to any teammate",
              "Works with any Slack plan",
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-coffee-cortado">
                <span className="w-5 h-5 rounded-full bg-coffee-cream flex items-center justify-center text-coffee-espresso text-sm">
                  ✓
                </span>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <a
            href="/api/auth/slack"
            className="inline-flex items-center justify-center w-full px-6 py-3.5 rounded-lg text-base font-medium bg-coffee-espresso text-coffee-paper hover:bg-coffee-roast transition-all duration-200"
          >
            <SlackIcon className="w-5 h-5 mr-2" />
            Add to Slack
          </a>
        </div>

        {/* FAQ */}
        <div className="p-6 bg-coffee-cream rounded-lg border border-coffee-foam">
          <h2 className="text-xl font-semibold text-coffee-espresso mb-6">Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-coffee-espresso mb-2">Will it always be free?</h3>
              <p className="text-coffee-cortado leading-relaxed">
                We're focused on making Attunly useful first. If we add paid features later, the core functionality will stay free.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-coffee-espresso mb-2">What about enterprise teams?</h3>
              <p className="text-coffee-cortado leading-relaxed">
                Need custom integrations, SSO, or dedicated support? Email us at{" "}
                <a href="mailto:support@attunly.com" className="text-coffee-espresso hover:text-coffee-roast">
                  support@attunly.com
                </a>
              </p>
            </div>
          </div>
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
            <Link href="/support" className="hover:text-coffee-paper transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
