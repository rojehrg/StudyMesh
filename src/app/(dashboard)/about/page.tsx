"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Users,
  Target,
  Zap,
  Shield,
  TrendingUp,
  Brain,
  ArrowRight,
  MessageSquare,
  Clock,
  Lightbulb,
  Network,
  Calendar,
  Bell,
  Search,
  Handshake,
  Building2,
  Globe,
  Lock,
  BarChart3,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const stats = [
  { value: "10x", label: "Faster knowledge discovery" },
  { value: "85%", label: "Reduction in knowledge silos" },
  { value: "3hrs", label: "Saved per employee weekly" },
];

const principles = [
  {
    icon: Brain,
    title: "Intelligence First",
    description: "Smart matching algorithms understand context, not just keywords. Find the right expert even when terminology differs.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Your knowledge stays within your organization. SOC 2 compliant infrastructure with end-to-end encryption.",
  },
  {
    icon: Zap,
    title: "Zero Friction",
    description: "No training needed. Integrates with Slack, calendar, and existing workflows. Teams are productive in minutes.",
  },
  {
    icon: TrendingUp,
    title: "Measurable Impact",
    description: "Track knowledge flow, identify gaps, and measure collaboration metrics that matter to your business.",
  },
];

const workflow = [
  {
    step: "01",
    title: "Define Your Expertise",
    description: "Share what you know and what you want to learn. Our AI categorizes and connects related skills automatically.",
    icon: Lightbulb,
    color: "primary",
  },
  {
    step: "02",
    title: "Discover Matches",
    description: "Find teammates with complementary knowledge. See availability, expertise depth, and collaboration history.",
    icon: Search,
    color: "primary",
  },
  {
    step: "03",
    title: "Connect with a Nudge",
    description: "Send a nudge to request help or offer expertise. Specify topics, time needed, and preferred communication.",
    icon: Bell,
    color: "primary",
  },
  {
    step: "04",
    title: "Schedule & Collaborate",
    description: "Pick from suggested times based on mutual availability. Meet, share knowledge, and accelerate outcomes.",
    icon: Calendar,
    color: "primary",
  },
];

export default function AboutPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto space-y-16 pb-12"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants} className="relative pt-8">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium text-sm">The Intelligent Enablement Platform</span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
            Where Knowledge
            <span className="block mt-1 bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
              Meets Opportunity
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Attunly connects expertise with need across your organization.
            Stop searching, start collaborating.
          </p>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-card border border-border/50 rounded-2xl p-6 text-center hover:border-primary/30 transition-colors duration-300">
                <p className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Mission Statement */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 via-card to-primary/5 border border-border/50 p-8 md:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary uppercase tracking-wider">Our Mission</p>
              </div>
            </div>

            <blockquote className="text-2xl md:text-3xl font-semibold text-foreground leading-relaxed">
              &ldquo;The best teams aren&apos;t just skilled—they&apos;re <span className="text-primary">connected</span>.
              When expertise flows freely, blockers disappear, delivery accelerates, and everyone grows.&rdquo;
            </blockquote>

            <p className="text-muted-foreground text-lg max-w-3xl">
              We built Attunly because we&apos;ve seen firsthand how knowledge silos cripple even the most talented teams.
              Someone always has the answer—the challenge is finding them.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Core Principles */}
      <motion.div variants={itemVariants} className="space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-foreground">Built for Enterprise Teams</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Four principles guide everything we build
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {principles.map((principle, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -4 }}
              className="group relative bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <principle.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">{principle.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{principle.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div variants={itemVariants} className="space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-foreground">How Attunly Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From signup to collaboration in four simple steps
          </p>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-8 top-16 bottom-16 w-px bg-gradient-to-b from-primary/50 via-primary/30 to-primary/50 hidden md:block" />

          <div className="space-y-6">
            {workflow.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.15 }}
                className="relative"
              >
                <div className="flex items-start gap-6">
                  {/* Step indicator */}
                  <div className="relative z-10 shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-card border-2 border-primary/30 flex items-center justify-center shadow-lg shadow-primary/10">
                      <item.icon className="w-7 h-7 text-primary" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/20 transition-colors">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Features Highlight */}
      <motion.div variants={itemVariants}>
        <div className="bg-card border border-border/50 rounded-3xl p-8 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left side - Feature list */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Everything You Need</h2>
                <p className="text-muted-foreground">Powerful features designed for modern teams</p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: Network, text: "Intelligent skill matching with fuzzy search" },
                  { icon: Users, text: "Pod-based organization for teams & projects" },
                  { icon: MessageSquare, text: "Slack integration for real-time notifications" },
                  { icon: Clock, text: "Smart scheduling based on availability" },
                  { icon: BarChart3, text: "Analytics dashboard for team insights" },
                  { icon: Lock, text: "Enterprise-grade security & privacy" },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground font-medium">{feature.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right side - Key concepts */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Key Concepts
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {[
                  { term: "Pod", definition: "A group of teammates working together. Join with a unique 6-character code." },
                  { term: "Nudge", definition: "A request to connect—either asking for help or offering your expertise." },
                  { term: "Knowledge Areas", definition: "Topics you can help with, from technical skills to domain expertise." },
                  { term: "Availability", definition: "Weekly time slots when you're open to collaboration sessions." },
                ].map((concept, index) => (
                  <div key={index} className="bg-muted/50 rounded-xl p-4">
                    <p className="font-semibold text-foreground text-sm">{concept.term}</p>
                    <p className="text-muted-foreground text-sm mt-1">{concept.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Trust Badges */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-wrap items-center justify-center gap-8 py-6">
          {[
            { icon: Building2, text: "Built for B2B" },
            { icon: Globe, text: "Remote-First" },
            { icon: Shield, text: "SOC 2 Ready" },
            { icon: Lock, text: "GDPR Compliant" },
          ].map((badge, index) => (
            <div key={index} className="flex items-center gap-2 text-muted-foreground">
              <badge.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{badge.text}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-10 md:p-14 text-center">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }} />
          </div>

          <div className="relative space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <Handshake className="w-4 h-4 text-primary-foreground" />
              <span className="text-primary-foreground/90 font-medium text-sm">Start collaborating today</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
              Ready to unlock your team&apos;s potential?
            </h2>

            <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">
              Join teams who&apos;ve transformed how they share knowledge and accelerate growth.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link href="/settings">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-xl shadow-black/20 font-semibold px-8">
                  Update Your Profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/find-help">
                <Button size="lg" variant="outline" className="border-2 border-white/30 text-primary-foreground bg-white/10 hover:bg-white/20 font-semibold px-8">
                  Find Matches
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div variants={itemVariants} className="text-center">
        <p className="text-sm text-muted-foreground">
          Built with care for teams that value knowledge sharing
        </p>
      </motion.div>
    </motion.div>
  );
}
