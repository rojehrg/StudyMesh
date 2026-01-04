"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import {
  CheckBig,
  UsersGroup,
  Building01,
  Star,
  ArrowRightMd,
  ChevronLeft,
  Shield,
  TrendingUp,
  Clock,
} from "react-coolicons";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: PlanFeature[];
  popular?: boolean;
  cta: string;
  highlight?: boolean;
}

const plans: Plan[] = [
  {
    name: "Free",
    description: "Perfect for trying out Attunly with a small team",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { text: "Up to 5 team members", included: true },
      { text: "2 collaboration pods", included: true },
      { text: "Basic expertise matching", included: true },
      { text: "Weekly availability grid", included: true },
      { text: "Slack integration", included: true },
      { text: "Advanced analytics", included: false },
      { text: "Custom branding", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Get Started Free",
  },
  {
    name: "Starter",
    description: "For growing teams that need more flexibility",
    monthlyPrice: 8,
    yearlyPrice: 6,
    features: [
      { text: "Up to 20 team members", included: true },
      { text: "10 collaboration pods", included: true },
      { text: "AI-powered expertise matching", included: true },
      { text: "Weekly availability grid", included: true },
      { text: "Slack + Zoom integration", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Custom branding", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Start 14-Day Trial",
  },
  {
    name: "Pro",
    description: "For organizations that need the full power",
    monthlyPrice: 15,
    yearlyPrice: 12,
    popular: true,
    highlight: true,
    features: [
      { text: "Up to 100 team members", included: true },
      { text: "50 collaboration pods", included: true },
      { text: "AI-powered expertise matching", included: true },
      { text: "Weekly availability grid", included: true },
      { text: "All integrations", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Custom branding", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Start 14-Day Trial",
  },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    // Force light mode on pricing page
    <div className="min-h-screen bg-white light" data-theme="light" style={{ colorScheme: 'light' }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              <Image
                src="/icon.png"
                alt="Attunly"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-bold text-xl">
                <span className="text-gray-900">Attun</span>
                <span className="text-violet-600">ly</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button className="bg-violet-600 hover:bg-violet-700 text-white" asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 bg-gradient-to-b from-violet-50/50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <Badge className="mb-6 bg-violet-100 text-violet-700 border-0 px-4 py-1.5 text-sm font-medium">
              <Star className="w-3.5 h-3.5 mr-1.5" />
              Simple, transparent pricing
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Plans that scale with
              <span className="text-violet-600"> your team</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              Start free, upgrade when you need more. No hidden fees, no surprises.
              Cancel anytime.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 bg-gray-100 rounded-full p-1.5 mb-4">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  !isYearly
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  isYearly
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
              </button>
            </div>
            {isYearly && (
              <p className="text-sm text-emerald-600 font-medium">
                Save 25% with annual billing
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={plan.highlight ? 'md:-mt-4 md:mb-4' : ''}
              >
                <div className={`h-full rounded-2xl p-1 ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-violet-600 to-violet-700'
                    : ''
                }`}>
                  <div className={`h-full rounded-xl bg-white p-6 ${
                    plan.highlight
                      ? 'shadow-xl shadow-violet-500/20'
                      : 'border border-gray-200 shadow-sm'
                  }`}>
                    {plan.popular && (
                      <Badge className="mb-4 bg-violet-600 text-white border-0 px-3 py-1">
                        Most Popular
                      </Badge>
                    )}

                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        {plan.name === "Free" && <Building01 className="w-5 h-5 text-violet-600" />}
                        {plan.name === "Starter" && <UsersGroup className="w-5 h-5 text-violet-600" />}
                        {plan.name === "Pro" && <Star className="w-5 h-5 text-violet-600" />}
                        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      </div>
                      <p className="text-gray-600 text-sm">{plan.description}</p>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-bold text-gray-900">
                          ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                        </span>
                        <span className="text-gray-500">/seat/mo</span>
                      </div>
                      {isYearly && plan.monthlyPrice > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          Billed as ${plan.yearlyPrice * 12}/seat/year
                        </p>
                      )}
                      {plan.monthlyPrice === 0 && (
                        <p className="text-sm text-gray-500 mt-1">Free forever</p>
                      )}
                    </div>

                    <Button
                      className={`w-full mb-6 h-12 text-base font-semibold ${
                        plan.highlight
                          ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/30'
                          : plan.monthlyPrice === 0
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                            : 'bg-violet-600 hover:bg-violet-700 text-white'
                      }`}
                      asChild
                    >
                      <Link href="/signup" className="gap-2">
                        {plan.cta}
                        <ArrowRightMd className="w-4 h-4" />
                      </Link>
                    </Button>

                    <div className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <div
                          key={featureIndex}
                          className={`flex items-center gap-3 text-sm ${
                            feature.included ? 'text-gray-700' : 'text-gray-400'
                          }`}
                        >
                          <CheckBig className={`w-5 h-5 shrink-0 ${
                            feature.included ? 'text-emerald-500' : 'text-gray-300'
                          }`} />
                          <span className={!feature.included ? 'line-through' : ''}>
                            {feature.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 px-4 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            <div className="flex items-center gap-2 text-gray-600">
              <Shield className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-medium">SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <TrendingUp className="w-5 h-5 text-violet-500" />
              <span className="text-sm font-medium">99.9% Uptime SLA</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">14-Day Free Trial</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CheckBig className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-medium">Cancel Anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-violet-600 to-violet-700 rounded-2xl p-8 md:p-12 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Need enterprise features?
            </h3>
            <p className="text-violet-100 mb-8 max-w-xl mx-auto">
              Get unlimited seats, SSO, dedicated support, custom integrations, and SLA guarantees.
            </p>
            <Button
              size="lg"
              className="bg-white text-violet-700 hover:bg-violet-50 font-semibold px-8"
              asChild
            >
              <a href="mailto:enterprise@attunly.com">
                Contact Sales
                <ArrowRightMd className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "Can I change plans later?",
                a: "Yes! You can upgrade or downgrade at any time. When upgrading, you'll be prorated. When downgrading, changes take effect at your next billing cycle."
              },
              {
                q: "What counts as a seat?",
                a: "A seat is any user who can log in and use Attunly. Inactive users don't count toward your seat limit."
              },
              {
                q: "Is there a free trial?",
                a: "Paid plans come with a 14-day free trial. No credit card required to start. You can also use the Free plan indefinitely."
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards (Visa, Mastercard, American Express) and can arrange invoicing for Enterprise plans."
              },
              {
                q: "Can I get a refund?",
                a: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/icon.png"
              alt="Attunly"
              width={24}
              height={24}
              className="rounded-md"
            />
            <span className="font-semibold">
              <span className="text-gray-900">Attun</span>
              <span className="text-violet-600">ly</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms</Link>
            <a href="mailto:support@attunly.com" className="hover:text-gray-900 transition-colors">Support</a>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Attunly. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
