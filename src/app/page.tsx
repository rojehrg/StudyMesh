"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Users,
  MessageCircle,
  Clock,
  Globe,
  Zap,
  Calendar,
  Search,
  CheckCircle2,
  Slack,
  Sparkles,
  Play,
} from "lucide-react";
import { motion } from "framer-motion";
import Head from "next/head";
import { ThemeToggle } from "@/components/theme-toggle";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>Meshflow - Coordinate Help Across Time Zones for Remote Teams</title>
        <meta
          name="description"
          content="Visual team availability, contextual help requests, and Slack integration. The modern way to coordinate remote teams."
        />
      </Head>

      <div className="min-h-screen bg-background text-foreground overflow-hidden">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-10">
              <Link href="/" className="flex items-center gap-1">
                <span className="text-primary font-bold text-xl">Mesh</span>
                <span className="font-bold text-xl">flow</span>
              </Link>
              <div className="hidden md:flex items-center gap-8">
                <Link
                  href="#features"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="#how-it-works"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  How it works
                </Link>
                <Link
                  href="#teams"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  For Teams
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link href="/login">
                <Button variant="ghost" className="font-medium">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="font-medium rounded-full px-5">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-24 px-6 relative">
          {/* Background gradient orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute top-60 -left-40 w-[400px] h-[400px] rounded-full bg-accent/10 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="text-center max-w-3xl mx-auto"
            >
              {/* Badge */}
              <motion.div variants={fadeIn} className="mb-8">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                  <Sparkles className="w-4 h-4" />
                  Built for remote-first teams
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={fadeIn}
                className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight"
              >
                Stop the timezone
                <br />
                <span className="text-primary">coordination chaos</span>
              </motion.h1>

              {/* Sub-headline */}
              <motion.p
                variants={fadeIn}
                className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
              >
                See who's available, find who knows what, and schedule help—all without the endless Slack threads.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeIn} className="flex flex-wrap justify-center gap-4 mb-12">
                <Link href="/signup">
                  <Button size="lg" className="rounded-full px-8 h-14 text-base font-semibold gap-2 shadow-lg shadow-primary/25">
                    <Zap className="w-5 h-5" />
                    Start for Free
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full px-8 h-14 text-base font-semibold gap-2"
                  >
                    <Play className="w-5 h-5" />
                    See How It Works
                  </Button>
                </Link>
              </motion.div>

              {/* Social Proof */}
              <motion.div
                variants={fadeIn}
                className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>Free for teams under 10</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>Slack integration included</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Visual - App Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-20 relative"
            >
              <div className="bg-card rounded-2xl border border-border shadow-2xl shadow-primary/10 overflow-hidden max-w-4xl mx-auto">
                <div className="p-1 bg-muted/50 flex items-center gap-2">
                  <div className="flex gap-1.5 ml-3">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-warning/60" />
                    <div className="w-3 h-3 rounded-full bg-success/60" />
                  </div>
                  <div className="flex-1 text-center text-xs text-muted-foreground font-medium">
                    meshflow.app/dashboard
                  </div>
                </div>
                <div className="p-8 bg-gradient-to-b from-card to-muted/20">
                  <div className="grid grid-cols-3 gap-6">
                    {/* Availability Preview */}
                    <div className="col-span-2 bg-background rounded-xl p-5 border border-border">
                      <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span className="font-semibold">Team Availability</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                          <div key={i} className="text-center text-xs text-muted-foreground font-medium">{day}</div>
                        ))}
                        {Array.from({ length: 21 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-6 rounded ${
                              [0, 1, 2, 7, 8, 9, 14, 15, 16].includes(i)
                                ? 'bg-primary/30'
                                : [3, 4, 10, 11, 17, 18].includes(i)
                                ? 'bg-primary/15'
                                : 'bg-muted'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Team Members */}
                    <div className="bg-background rounded-xl p-5 border border-border">
                      <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-primary" />
                        <span className="font-semibold">Online Now</span>
                      </div>
                      <div className="space-y-3">
                        {['Sarah', 'Mike', 'Priya'].map((name, i) => (
                          <div key={name} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                              {name[0]}
                            </div>
                            <div>
                              <div className="text-sm font-medium">{name}</div>
                              <div className="text-xs text-muted-foreground">
                                {i === 0 ? 'Available' : i === 1 ? 'In a meeting' : 'Away'}
                              </div>
                            </div>
                            <div className={`w-2 h-2 rounded-full ml-auto ${i === 0 ? 'bg-success' : i === 1 ? 'bg-warning' : 'bg-muted-foreground'}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-24 px-6 bg-card border-y border-border">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-6 bg-accent/20 text-accent-foreground">
                The Problem
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Remote coordination is <span className="text-primary">broken</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Your team has answers—but no one knows who to ask or when they're free.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Clock,
                  title: "Timezone Math",
                  description: "\"Is 3pm my time or yours?\" Constantly calculating offsets and missing availability windows.",
                },
                {
                  icon: Search,
                  title: "Hidden Expertise",
                  description: "Knowledge lives in people's heads. Someone knows the answer—but who?",
                },
                {
                  icon: MessageCircle,
                  title: "Slack Chaos",
                  description: "DMs flying everywhere, threads buried. More time coordinating than getting help.",
                },
              ].map((problem, index) => (
                <motion.div
                  key={problem.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-2xl p-6 bg-background border border-border"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-primary/10">
                    <problem.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{problem.title}</h3>
                  <p className="text-muted-foreground">{problem.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6 bg-primary/10 text-primary">
                Features
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Everything you need to <span className="text-primary">coordinate</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Visual availability, smart nudges, and Slack integration—all in one place.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: Calendar,
                  title: "Visual Availability Grid",
                  description: "See your team's availability at a glance. Timezone-aware and always up to date.",
                  features: ["Auto-detect timezone", "\"Available now\" status", "See overlap with teammates"],
                  color: "primary",
                },
                {
                  icon: Zap,
                  title: "Smart Nudges",
                  description: "Send help requests with context. Choose meeting length, suggest times automatically.",
                  features: ["15min to 1hr options", "Auto-suggest times", "Async option for different shifts"],
                  color: "accent",
                },
                {
                  icon: Search,
                  title: "Knowledge Discovery",
                  description: "Simple \"I know X\" tags. Search for expertise and find who can help.",
                  features: ["Lightweight tagging", "Fuzzy search", "No complex skill databases"],
                  color: "primary",
                },
                {
                  icon: Slack,
                  title: "Slack Native",
                  description: "Nudges delivered as Slack DMs. Works where your team already communicates.",
                  features: ["Direct messages", "One-click OAuth", "Meeting links included"],
                  color: "accent",
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-2xl p-8 bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.color === 'primary' ? 'bg-primary/10' : 'bg-accent/20'}`}>
                    <feature.icon className={`w-7 h-7 ${feature.color === 'primary' ? 'text-primary' : 'text-accent'}`} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.features.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 px-6 bg-card border-y border-border">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6 bg-primary/10 text-primary">
                How It Works
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Up and running in <span className="text-primary">3 minutes</span>
              </h2>
              <p className="text-lg text-muted-foreground">No complex setup. No training needed.</p>
            </motion.div>

            <div className="space-y-6">
              {[
                {
                  step: "01",
                  title: "Set Your Availability",
                  description: "Drag to select your available hours. Timezone auto-detected. Toggle \"available now\" when you're free.",
                  icon: Calendar,
                },
                {
                  step: "02",
                  title: "Tag Your Knowledge",
                  description: "Add simple tags for what you know: \"Salesforce API\", \"SQL debugging\", \"Tax setup\". That's it.",
                  icon: Search,
                },
                {
                  step: "03",
                  title: "Send & Receive Nudges",
                  description: "Find someone who can help, suggest a time, and they get a Slack DM with everything needed to say yes.",
                  icon: MessageCircle,
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-6 items-center p-6 rounded-2xl bg-background border border-border"
                >
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 bg-primary text-primary-foreground">
                    <item.icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-bold text-primary">{item.step}</span>
                      <h3 className="text-xl font-bold">{item.title}</h3>
                    </div>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Teams Section */}
        <section id="teams" className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6 bg-secondary text-secondary-foreground">
                For Teams
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Built for <span className="text-primary">distributed</span> teams
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Remote Startups",
                  description: "5-20 people across multiple time zones. Quick coordination without overhead.",
                  example: "Teams in Turkey, Arizona, and California",
                },
                {
                  title: "Support Teams",
                  description: "Knowledge gaps on product issues. Different shifts, need fast answers.",
                  example: "\"Who handled this tax issue before?\"",
                },
                {
                  title: "Open Source",
                  description: "Global contributors. Coordinate reviews and help requests across time zones.",
                  example: "Maintainers in EU, contributors in Asia",
                },
              ].map((audience, index) => (
                <motion.div
                  key={audience.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-2xl p-6 bg-card border border-border"
                >
                  <h3 className="text-xl font-bold mb-3 text-primary">{audience.title}</h3>
                  <p className="text-muted-foreground mb-4">{audience.description}</p>
                  <p className="text-sm italic text-muted-foreground">{audience.example}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 bg-primary/5 border-t border-border">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to fix <span className="text-primary">coordination</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
              Stop wasting time on timezone math and Slack chaos. Start coordinating in seconds.
            </p>
            <Link href="/signup">
              <Button size="lg" className="rounded-full px-10 h-14 text-lg font-semibold gap-2 shadow-lg shadow-primary/25">
                <Zap className="w-5 h-5" />
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-6">
              Free forever for small teams • No credit card required
            </p>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 bg-card border-t border-border">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-primary">Mesh</span>
              <span className="font-bold">flow</span>
              <span className="text-sm text-muted-foreground ml-2">© 2025</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-foreground transition-colors">
                Login
              </Link>
              <Link href="/signup" className="hover:text-foreground transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
