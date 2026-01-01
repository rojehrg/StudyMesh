"use client";

import { motion } from "framer-motion";
import { Sparkles, Users, Target, Zap, Shield, TrendingUp, Network, Brain, ArrowRight, CheckCircle2, MessageCircle, UserPlus, Settings, Eye, Bell, Calendar, Handshake, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

export default function AboutPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-12"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants} className="text-center py-8">
        <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full mb-6">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-accent font-medium text-sm">About Attunly</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          The Intelligent Enablement Platform
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Built for high-performing teams that know knowledge flow is the key to outperformance
        </p>
      </motion.div>

      {/* Mission Card */}
      <motion.div
        variants={itemVariants}
        className="bg-accent/10 rounded-2xl p-8 shadow-md"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Our Mission</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Attunly helps teams <strong className="text-accent">outperform by filling knowledge gaps</strong>.
              The best teams aren't just skilled—they're connected. When expertise flows freely between
              teammates, blockers disappear, delivery accelerates, and everyone grows.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Problem & Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4 }}
          className="bg-card rounded-2xl p-6 shadow-md"
        >
          <div className="w-10 h-10 bg-destructive/20 rounded-lg flex items-center justify-center mb-4">
            <Target className="w-5 h-5 text-destructive" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">The Problem</h3>
          <p className="text-muted-foreground leading-relaxed">
            Teams struggle with knowledge silos. Someone has the answer, but no one knows who to ask.
            Projects stall. Frustration builds. Potential goes unrealized.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4 }}
          className="bg-accent/10 rounded-2xl p-6 shadow-md"
        >
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center mb-4">
            <Zap className="w-5 h-5 text-accent-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Our Solution</h3>
          <p className="text-muted-foreground leading-relaxed">
            Attunly uses intelligent matching to connect knowledge holders with knowledge seekers.
            You list what you know and what you want to learn—we handle the rest.
          </p>
        </motion.div>
      </div>

      {/* How It's Different */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Network className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold text-foreground">How We're Different</h2>
        </div>

        <div className="space-y-4">
          <motion.div
            whileHover={{ x: 4 }}
            className="flex items-start gap-4 p-5 rounded-xl bg-card shadow-md"
          >
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center shrink-0">
              <Brain className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-1">Intelligent Matching</h4>
              <p className="text-muted-foreground text-sm">
                Our smart algorithm understands context and skill variations. Matches are based on
                complementary expertise, not rigid categories.
              </p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-1" />
          </motion.div>

          <motion.div
            whileHover={{ x: 4 }}
            className="flex items-start gap-4 p-5 rounded-xl bg-card shadow-md"
          >
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-1">Org-Scoped Privacy</h4>
              <p className="text-muted-foreground text-sm">
                Your data stays within your organization. No external sharing, no public profiles.
                Complete security and privacy.
              </p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-1" />
          </motion.div>

          <motion.div
            whileHover={{ x: 4 }}
            className="flex items-start gap-4 p-5 rounded-xl bg-card shadow-md"
          >
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-1">Performance-Driven</h4>
              <p className="text-muted-foreground text-sm">
                Built from real-world experience: teams that consistently fill knowledge gaps
                outperform those that don't. Simple as that.
              </p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-1" />
          </motion.div>

          <motion.div
            whileHover={{ x: 4 }}
            className="flex items-start gap-4 p-5 rounded-xl bg-card shadow-md"
          >
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-1">Slack Integration</h4>
              <p className="text-muted-foreground text-sm">
                Get notified where you already work. Nudges can trigger Slack messages so you never
                miss a collaboration opportunity.
              </p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-1" />
          </motion.div>
        </div>
      </motion.div>

      {/* Key Features Grid */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-foreground mb-6">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-card shadow-md">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center mb-3">
              <Target className="w-4 h-4 text-accent-foreground" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">Skill Matching</h4>
            <p className="text-sm text-muted-foreground">Fuzzy matching connects similar skills automatically</p>
          </div>
          <div className="p-5 rounded-xl bg-card shadow-md">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mb-3">
              <Users className="w-4 h-4 text-primary-foreground" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">Pod Organization</h4>
            <p className="text-sm text-muted-foreground">Group by project, team, or initiative</p>
          </div>
          <div className="p-5 rounded-xl bg-card shadow-md">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center mb-3">
              <Sparkles className="w-4 h-4 text-accent-foreground" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">Contextual Nudges</h4>
            <p className="text-sm text-muted-foreground">Ask for help or offer expertise directly</p>
          </div>
        </div>
      </motion.div>

      {/* User Flow / How It Works */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <ArrowRight className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold text-foreground">How MeshFlow Works</h2>
        </div>
        <p className="text-muted-foreground">
          A typical user journey through MeshFlow - from joining to collaborating:
        </p>

        {/* Flow Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Step 1 */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative p-5 rounded-xl bg-card shadow-md border-2 border-transparent hover:border-primary/30"
          >
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
              1
            </div>
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mb-3">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <h4 className="font-bold text-foreground mb-1">Join a Pod</h4>
            <p className="text-sm text-muted-foreground">
              Sign up and join your team's Pod using a 6-character code, or create a new Pod for your team.
            </p>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground hidden md:block" />
          </motion.div>

          {/* Step 2 */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative p-5 rounded-xl bg-card shadow-md border-2 border-transparent hover:border-primary/30"
          >
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
              2
            </div>
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center mb-3">
              <Settings className="w-5 h-5 text-accent" />
            </div>
            <h4 className="font-bold text-foreground mb-1">Set Your Profile</h4>
            <p className="text-sm text-muted-foreground">
              Add your knowledge areas, set weekly availability, and optionally connect Slack for notifications.
            </p>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground hidden md:block lg:hidden" />
          </motion.div>

          {/* Step 3 */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative p-5 rounded-xl bg-card shadow-md border-2 border-transparent hover:border-primary/30"
          >
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
              3
            </div>
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mb-3">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <h4 className="font-bold text-foreground mb-1">Browse Your Pod</h4>
            <p className="text-sm text-muted-foreground">
              See teammates' skills and availability. Find who can help with what you need or who needs your expertise.
            </p>
          </motion.div>

          {/* Step 4 */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative p-5 rounded-xl bg-card shadow-md border-2 border-transparent hover:border-accent/30"
          >
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm">
              4
            </div>
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center mb-3">
              <Bell className="w-5 h-5 text-accent" />
            </div>
            <h4 className="font-bold text-foreground mb-1">Send a Nudge</h4>
            <p className="text-sm text-muted-foreground">
              Click "Nudge" to ask for help or offer help. Specify the topic, time needed, and optional message.
            </p>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground hidden md:block" />
          </motion.div>

          {/* Step 5 */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative p-5 rounded-xl bg-card shadow-md border-2 border-transparent hover:border-accent/30"
          >
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm">
              5
            </div>
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <h4 className="font-bold text-foreground mb-1">Schedule Meeting</h4>
            <p className="text-sm text-muted-foreground">
              MeshFlow suggests times based on overlapping availability. Pick a time and send an invite.
            </p>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground hidden md:block lg:hidden" />
          </motion.div>

          {/* Step 6 */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative p-5 rounded-xl bg-accent/10 shadow-md border-2 border-accent/30"
          >
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm">
              6
            </div>
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center mb-3">
              <Handshake className="w-5 h-5 text-accent-foreground" />
            </div>
            <h4 className="font-bold text-foreground mb-1">Collaborate & Grow</h4>
            <p className="text-sm text-muted-foreground">
              Meet, share knowledge, solve problems together. The more you help, the stronger your team becomes.
            </p>
          </motion.div>
        </div>

        {/* Flow Summary */}
        <div className="bg-muted/50 rounded-xl p-6">
          <h4 className="font-bold text-foreground mb-3">Key Concepts</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-foreground font-medium">Pod</p>
              <p className="text-muted-foreground">A group of teammates working together. Join with a 6-letter code (e.g., ABC123).</p>
            </div>
            <div>
              <p className="text-foreground font-medium">Nudge</p>
              <p className="text-muted-foreground">A request to connect - either asking for help or offering to help someone.</p>
            </div>
            <div>
              <p className="text-foreground font-medium">Knowledge Areas</p>
              <p className="text-muted-foreground">Topics you can help with (e.g., React, SQL, Sales Strategy).</p>
            </div>
            <div>
              <p className="text-foreground font-medium">Availability</p>
              <p className="text-muted-foreground">Weekly time slots when you're open to meetings. Used for smart scheduling.</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        variants={itemVariants}
        className="bg-primary rounded-2xl p-8 text-center"
      >
        <h2 className="text-2xl font-bold mb-3 text-primary-foreground">Ready to collaborate?</h2>
        <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto">
          Start mapping your skills and connecting with teammates who can help you grow.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/settings">
            <Button className="bg-card text-primary hover:bg-card/90 shadow-md">
              Update Your Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/groups">
            <Button className="bg-primary-foreground/20 text-primary-foreground border-2 border-primary-foreground hover:bg-primary-foreground/30 shadow-md">
              Find Matches
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Footer note */}
      <motion.p variants={itemVariants} className="text-center text-sm text-muted-foreground pb-8">
        Built for B2B teams • From enterprise orgs to specialized teams
      </motion.p>
    </motion.div>
  );
}
