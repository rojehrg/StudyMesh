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
  ctaVariant: "default" | "outline" | "secondary";
}

const plans: Plan[] = [
  {
    name: "Free",
    description: "Perfect for trying out Attunly with a small team",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { text: "Up to 5 seats", included: true },
      { text: "Up to 2 pods", included: true },
      { text: "Basic expertise matching", included: true },
      { text: "Weekly availability grid", included: true },
      { text: "Slack integration", included: true },
      { text: "Advanced analytics", included: false },
      { text: "Custom branding", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Get Started",
    ctaVariant: "outline",
  },
  {
    name: "Starter",
    description: "For growing teams that need more flexibility",
    monthlyPrice: 8,
    yearlyPrice: 6,
    features: [
      { text: "Up to 20 seats", included: true },
      { text: "Up to 10 pods", included: true },
      { text: "AI-powered expertise matching", included: true },
      { text: "Weekly availability grid", included: true },
      { text: "Slack integration", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Custom branding", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Start Free Trial",
    ctaVariant: "default",
  },
  {
    name: "Pro",
    description: "For larger organizations with custom needs",
    monthlyPrice: 15,
    yearlyPrice: 12,
    popular: true,
    features: [
      { text: "Up to 100 seats", included: true },
      { text: "Up to 50 pods", included: true },
      { text: "AI-powered expertise matching", included: true },
      { text: "Weekly availability grid", included: true },
      { text: "Slack integration", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Custom branding", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Start Free Trial",
    ctaVariant: "default",
  },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              <Image
                src="/icon.png"
                alt="Attunly"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-bold text-xl">
                <span className="text-foreground">Attun</span>
                <span className="text-primary">ly</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-0 px-3 py-1">
              <Star className="w-3 h-3 mr-1" />
              Simple, transparent pricing
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Find the right plan for your team
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Start free, upgrade when you need more. All plans include core features.
              Annual billing saves you 2 months.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-3 mb-12">
              <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
              />
              <span className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                Yearly
              </span>
              {isYearly && (
                <Badge className="bg-success/20 text-success border-0 text-xs">
                  Save 2 months
                </Badge>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`h-full relative ${
                  plan.popular
                    ? 'border-2 border-primary shadow-lg shadow-primary/10'
                    : 'border border-border'
                }`}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="pb-4 pt-8">
                    <div className="flex items-center gap-2 mb-2">
                      {plan.name === "Free" && <Building01 className="w-5 h-5 text-primary" />}
                      {plan.name === "Starter" && <UsersGroup className="w-5 h-5 text-primary" />}
                      {plan.name === "Pro" && <Star className="w-5 h-5 text-primary" />}
                      <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-foreground">
                        ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-muted-foreground ml-1">
                        /seat/month
                      </span>
                      {isYearly && plan.monthlyPrice > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Billed annually (${plan.yearlyPrice * 12}/seat/year)
                        </p>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      className="w-full gap-2"
                      variant={plan.ctaVariant}
                      asChild
                    >
                      <Link href="/signup">
                        {plan.cta}
                        <ArrowRightMd className="w-4 h-4" />
                      </Link>
                    </Button>
                    <div className="space-y-3 pt-4 border-t border-border">
                      {plan.features.map((feature, featureIndex) => (
                        <div
                          key={featureIndex}
                          className={`flex items-center gap-2 text-sm ${
                            feature.included ? 'text-foreground' : 'text-muted-foreground line-through'
                          }`}
                        >
                          <CheckBig className={`w-4 h-4 shrink-0 ${
                            feature.included ? 'text-success' : 'text-muted-foreground/50'
                          }`} />
                          {feature.text}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Need more? Let's talk Enterprise
                </h3>
                <p className="text-muted-foreground">
                  Unlimited seats, SSO, dedicated support, and custom integrations.
                </p>
              </div>
              <Button variant="outline" asChild>
                <a href="mailto:enterprise@attunly.com">
                  Contact Sales
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="pb-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-6 text-left">
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Can I change plans later?
              </h3>
              <p className="text-muted-foreground text-sm">
                Yes! You can upgrade or downgrade at any time. When upgrading, you'll be prorated.
                When downgrading, changes take effect at your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                What counts as a seat?
              </h3>
              <p className="text-muted-foreground text-sm">
                A seat is any user who can log in and use Attunly. Inactive users don't count
                toward your seat limit.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Is there a free trial?
              </h3>
              <p className="text-muted-foreground text-sm">
                Paid plans come with a 14-day free trial. No credit card required to start.
                You can also use the Free plan indefinitely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
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
              <span className="text-foreground">Attun</span>
              <span className="text-primary">ly</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <a href="mailto:support@attunly.com" className="hover:text-foreground transition-colors">Support</a>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Attunly. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
