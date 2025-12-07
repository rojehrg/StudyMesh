"use client";

import { motion } from "framer-motion";
import { Sparkles, Users, Target, Zap, Shield, TrendingUp, Network, Brain, ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";
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
        <div className="inline-flex items-center gap-2 bg-teal-50 dark:bg-teal-950 px-4 py-2 rounded-full border border-teal-200 dark:border-teal-800 mb-6">
          <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span className="text-teal-700 dark:text-teal-300 font-medium text-sm">About Meshflow</span>
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
        className="bg-teal-50 dark:bg-teal-950 rounded-2xl p-8 border-2 border-teal-100 dark:border-teal-800"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Our Mission</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Meshflow helps teams <strong className="text-teal-700 dark:text-teal-400">outperform by filling knowledge gaps</strong>.
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
          className="bg-card rounded-2xl p-6 border-2 border-border shadow-sm"
        >
          <div className="w-10 h-10 bg-red-100 dark:bg-red-950 rounded-lg flex items-center justify-center mb-4">
            <Target className="w-5 h-5 text-red-600 dark:text-red-400" />
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
          className="bg-teal-50 dark:bg-teal-950 rounded-2xl p-6 border-2 border-teal-100 dark:border-teal-800"
        >
          <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center mb-4">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Our Solution</h3>
          <p className="text-muted-foreground leading-relaxed">
            Meshflow uses intelligent matching to connect knowledge holders with knowledge seekers.
            You list what you know and what you want to learn—we handle the rest.
          </p>
        </motion.div>
      </div>

      {/* How It's Different */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Network className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          <h2 className="text-2xl font-bold text-foreground">How We're Different</h2>
        </div>

        <div className="space-y-4">
          <motion.div
            whileHover={{ x: 4 }}
            className="flex items-start gap-4 p-5 rounded-xl bg-card border-2 border-border shadow-sm"
          >
            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-950 rounded-lg flex items-center justify-center shrink-0">
              <Brain className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-1">Intelligent Matching</h4>
              <p className="text-muted-foreground text-sm">
                Our smart algorithm understands context and skill variations. Matches are based on
                complementary expertise, not rigid categories.
              </p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-1" />
          </motion.div>

          <motion.div
            whileHover={{ x: 4 }}
            className="flex items-start gap-4 p-5 rounded-xl bg-card border-2 border-border shadow-sm"
          >
            <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-950 rounded-lg flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-1">Org-Scoped Privacy</h4>
              <p className="text-muted-foreground text-sm">
                Your data stays within your organization. No external sharing, no public profiles.
                Complete security and privacy.
              </p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-1" />
          </motion.div>

          <motion.div
            whileHover={{ x: 4 }}
            className="flex items-start gap-4 p-5 rounded-xl bg-card border-2 border-border shadow-sm"
          >
            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-950 rounded-lg flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-1">Performance-Driven</h4>
              <p className="text-muted-foreground text-sm">
                Built from real-world experience: teams that consistently fill knowledge gaps
                outperform those that don't. Simple as that.
              </p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-1" />
          </motion.div>

          <motion.div
            whileHover={{ x: 4 }}
            className="flex items-start gap-4 p-5 rounded-xl bg-card border-2 border-border shadow-sm"
          >
            <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-950 rounded-lg flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-1">Slack Integration</h4>
              <p className="text-muted-foreground text-sm">
                Get notified where you already work. Nudges can trigger Slack messages so you never
                miss a collaboration opportunity.
              </p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-1" />
          </motion.div>
        </div>
      </motion.div>

      {/* Key Features Grid */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-foreground mb-6">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-muted/50 border border-border">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center mb-3">
              <Target className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">Skill Matching</h4>
            <p className="text-sm text-muted-foreground">Fuzzy matching connects similar skills automatically</p>
          </div>
          <div className="p-5 rounded-xl bg-muted/50 border border-border">
            <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center mb-3">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">Pod Organization</h4>
            <p className="text-sm text-muted-foreground">Group by project, team, or initiative</p>
          </div>
          <div className="p-5 rounded-xl bg-muted/50 border border-border">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center mb-3">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">Contextual Nudges</h4>
            <p className="text-sm text-muted-foreground">Ask for help or offer expertise directly</p>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        variants={itemVariants}
        className="bg-primary rounded-2xl p-8 text-center text-primary-foreground"
      >
        <h2 className="text-2xl font-bold mb-3">Ready to collaborate?</h2>
        <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto">
          Start mapping your skills and connecting with teammates who can help you grow.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/settings">
            <Button className="bg-white text-primary hover:bg-white/90">
              Update Your Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/groups">
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
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
