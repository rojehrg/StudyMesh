"use client";

import { useState } from "react";
import Link from "next/link";

const SlackIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
  </svg>
);

const plans = [
  {
    name: "Free",
    description: "Try Attunly with a small team",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { text: "Up to 5 team members", included: true },
      { text: "Basic expertise matching", included: true },
      { text: "Slack integration", included: true },
      { text: "AI-drafted messages", included: true },
      { text: "Calendar integration", included: false },
      { text: "Advanced analytics", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Starter",
    description: "For growing teams",
    monthlyPrice: 8,
    yearlyPrice: 6,
    features: [
      { text: "Up to 20 team members", included: true },
      { text: "AI-powered matching", included: true },
      { text: "Slack integration", included: true },
      { text: "AI-drafted messages", included: true },
      { text: "Calendar integration", included: true },
      { text: "Basic analytics", included: true },
      { text: "Priority support", included: false },
    ],
    cta: "Start 14-Day Trial",
    popular: false,
  },
  {
    name: "Pro",
    description: "For scaling organizations",
    monthlyPrice: 15,
    yearlyPrice: 12,
    features: [
      { text: "Up to 100 team members", included: true },
      { text: "AI-powered matching", included: true },
      { text: "All integrations", included: true },
      { text: "AI-drafted messages", included: true },
      { text: "Calendar integration", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Start 14-Day Trial",
    popular: true,
  },
];

const faqs = [
  {
    q: "Can I change plans later?",
    a: "Yes! You can upgrade or downgrade at any time. When upgrading, you'll be prorated. When downgrading, changes take effect at your next billing cycle.",
  },
  {
    q: "What counts as a seat?",
    a: "A seat is any user who can log in and use Attunly. Inactive users don't count toward your seat limit.",
  },
  {
    q: "Is there a free trial?",
    a: "Paid plans come with a 14-day free trial. No credit card required to start. You can also use the Free plan indefinitely.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards (Visa, Mastercard, American Express) and can arrange invoicing for Enterprise plans.",
  },
  {
    q: "Will it always be free?",
    a: "The Free plan will always be available. We're committed to helping small teams get started without cost.",
  },
  {
    q: "What about enterprise teams?",
    a: "Need unlimited seats, SSO, dedicated support, or custom integrations? Contact us for Enterprise pricing.",
  },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div
      className="min-h-screen bg-coffee-paper"
      style={{
        fontFamily:
          '"Source Serif 4", "Source Serif Pro", Georgia, "Times New Roman", serif',
      }}
    >
      {/* Header */}
      <header className="border-b border-coffee-foam bg-coffee-paper/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="" className="w-6 h-6" />
            <span className="font-semibold text-xl text-coffee-espresso">
              attunly
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-coffee-cortado hover:text-coffee-espresso transition-colors"
            >
              ← Back to Home
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-coffee-cortado hover:text-coffee-espresso transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <p className="text-coffee-latte text-sm tracking-wide uppercase mb-4">
            Pricing
          </p>

          <h1 className="text-4xl md:text-5xl font-semibold text-coffee-espresso leading-tight mb-4">
            Simple, transparent pricing.
            <br />
            <span className="text-coffee-oat">Start free, scale as you grow.</span>
          </h1>

          <p className="text-xl text-coffee-cortado mb-8 max-w-[50ch] mx-auto">
            No hidden fees. 14-day free trial on paid plans. Cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 bg-coffee-cream rounded-full p-1.5">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                !isYearly
                  ? "bg-coffee-paper text-coffee-espresso shadow-sm"
                  : "text-coffee-cortado hover:text-coffee-espresso"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                isYearly
                  ? "bg-coffee-paper text-coffee-espresso shadow-sm"
                  : "text-coffee-cortado hover:text-coffee-espresso"
              }`}
            >
              Yearly
            </button>
          </div>
          {isYearly && (
            <p className="text-sm text-coffee-roast font-medium mt-3">
              Save 25% with annual billing
            </p>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl p-6 transition-all duration-300 ${
                plan.popular
                  ? "bg-coffee-espresso text-coffee-paper ring-2 ring-coffee-espresso md:-mt-4 md:mb-4 md:py-10"
                  : "bg-coffee-cream border border-coffee-foam"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-coffee-oat text-coffee-espresso text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}

              <div className="mb-4">
                <h3
                  className={`text-xl font-semibold mb-1 ${
                    plan.popular ? "text-coffee-paper" : "text-coffee-espresso"
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-sm ${
                    plan.popular ? "text-coffee-steamed" : "text-coffee-cortado"
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-4xl font-bold ${
                      plan.popular ? "text-coffee-paper" : "text-coffee-espresso"
                    }`}
                  >
                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span
                    className={
                      plan.popular ? "text-coffee-steamed" : "text-coffee-latte"
                    }
                  >
                    /user/mo
                  </span>
                </div>
                {plan.monthlyPrice === 0 ? (
                  <p
                    className={`text-sm mt-1 ${
                      plan.popular ? "text-coffee-steamed" : "text-coffee-latte"
                    }`}
                  >
                    Free forever
                  </p>
                ) : isYearly ? (
                  <p
                    className={`text-sm mt-1 ${
                      plan.popular ? "text-coffee-steamed" : "text-coffee-latte"
                    }`}
                  >
                    Billed annually
                  </p>
                ) : null}
              </div>

              <Link
                href="/signup"
                className={`flex items-center justify-center gap-2 w-full text-center px-6 py-3 rounded-lg font-medium transition-all duration-200 mb-6 ${
                  plan.popular
                    ? "bg-coffee-paper text-coffee-espresso hover:bg-coffee-cream"
                    : "bg-coffee-espresso text-coffee-paper hover:bg-coffee-roast"
                }`}
              >
                {plan.monthlyPrice === 0 && <SlackIcon className="w-4 h-4" />}
                {plan.cta}
              </Link>

              <div className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <div
                    key={featureIndex}
                    className={`flex items-center gap-3 text-sm ${
                      feature.included
                        ? plan.popular
                          ? "text-coffee-paper"
                          : "text-coffee-cortado"
                        : plan.popular
                          ? "text-coffee-mocha"
                          : "text-coffee-latte"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                        feature.included
                          ? plan.popular
                            ? "bg-coffee-paper/20 text-coffee-paper"
                            : "bg-coffee-paper text-coffee-espresso"
                          : plan.popular
                            ? "bg-coffee-mocha/30 text-coffee-mocha"
                            : "bg-coffee-foam text-coffee-latte"
                      }`}
                    >
                      {feature.included ? "✓" : "–"}
                    </span>
                    <span className={!feature.included ? "line-through" : ""}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise CTA */}
        <div className="bg-coffee-espresso rounded-xl p-8 md:p-12 text-center mb-16">
          <h3 className="text-2xl md:text-3xl font-semibold text-coffee-paper mb-4">
            Need enterprise features?
          </h3>
          <p className="text-coffee-steamed mb-8 max-w-xl mx-auto">
            Get unlimited seats, SSO, dedicated support, custom integrations, and
            SLA guarantees.
          </p>
          <a
            href="mailto:support@attunly.com"
            className="inline-flex items-center justify-center px-8 py-3 rounded-lg font-medium bg-coffee-paper text-coffee-espresso hover:bg-coffee-cream transition-all duration-200"
          >
            Contact Sales →
          </a>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 py-8 mb-16 border-y border-coffee-foam">
          <div className="flex items-center gap-2 text-coffee-cortado">
            <span className="w-5 h-5 rounded-full bg-coffee-cream flex items-center justify-center text-coffee-espresso text-xs">
              ✓
            </span>
            <span className="text-sm font-medium">14-Day Free Trial</span>
          </div>
          <div className="flex items-center gap-2 text-coffee-cortado">
            <span className="w-5 h-5 rounded-full bg-coffee-cream flex items-center justify-center text-coffee-espresso text-xs">
              ✓
            </span>
            <span className="text-sm font-medium">Cancel Anytime</span>
          </div>
          <div className="flex items-center gap-2 text-coffee-cortado">
            <span className="w-5 h-5 rounded-full bg-coffee-cream flex items-center justify-center text-coffee-espresso text-xs">
              ✓
            </span>
            <span className="text-sm font-medium">No Credit Card Required</span>
          </div>
          <div className="flex items-center gap-2 text-coffee-cortado">
            <span className="w-5 h-5 rounded-full bg-coffee-cream flex items-center justify-center text-coffee-espresso text-xs">
              ✓
            </span>
            <span className="text-sm font-medium">Secure Payments</span>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <p className="text-coffee-latte text-sm tracking-wide uppercase mb-4 text-center">
            Questions
          </p>
          <h2 className="text-3xl font-semibold text-coffee-espresso text-center mb-10">
            Frequently asked questions.
          </h2>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="pb-6 border-b border-coffee-foam last:border-b-0"
              >
                <h3 className="text-lg font-medium text-coffee-espresso mb-2">
                  {faq.q}
                </h3>
                <p className="text-coffee-cortado">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-12 bg-coffee-espresso text-coffee-latte">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="" className="w-6 h-6 invert" />
            <span className="text-xl font-semibold text-coffee-paper">
              attunly
            </span>
          </Link>
          <div className="flex gap-8 text-sm">
            <Link
              href="/privacy"
              className="hover:text-coffee-paper transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-coffee-paper transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/support"
              className="hover:text-coffee-paper transition-colors"
            >
              Contact
            </Link>
          </div>
          <p className="text-sm text-coffee-latte">
            © {new Date().getFullYear()} Attunly. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
