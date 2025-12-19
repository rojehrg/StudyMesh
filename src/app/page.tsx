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
} from "lucide-react";
import { motion } from "framer-motion";
import Head from "next/head";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

// Professional color palette
const colors = {
  primary: "#0d9488", // Teal - growth, connection
  primaryLight: "#14b8a6",
  primaryDark: "#0f766e",
  accent: "#f59e0b", // Amber - energy, urgency
  background: "#fcfcfc",
  surface: "#FFFFFF",
  text: "#1a1a2e",
  textMuted: "#64748b",
  border: "#e2e8f0",
  success: "#10b981",
};

export default function LandingPage() {
  return (
    <>
      {/* SEO Meta Tags */}
      <Head>
        <title>Meshflow - Coordinate Help Across Time Zones for Remote Teams</title>
        <meta
          name="description"
          content="Visual team availability, contextual help requests, and Slack integration. Free alternative to Calendly for small remote teams."
        />
        <meta
          property="og:title"
          content="Meshflow - Remote Team Coordination Made Simple"
        />
        <meta
          property="og:description"
          content="Know who to ask, when they're free, and coordinate help in seconds. Built for distributed startups and support teams."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://meshflow.app" />
      </Head>

      <div
        className="min-h-screen overflow-hidden"
        style={{ backgroundColor: colors.background }}
      >
        {/* Navigation */}
        <nav
          className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b"
          style={{
            backgroundColor: `${colors.background}ee`,
            borderColor: colors.border,
          }}
        >
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-12">
              <Link href="/" className="flex items-center">
                <span
                  style={{ color: colors.primary }}
                  className="font-bold text-xl"
                >
                  Mesh
                </span>
                <span style={{ color: colors.text }} className="font-bold text-xl">
                  flow
                </span>
              </Link>
              <div className="hidden md:flex items-center gap-8">
                <Link
                  href="#problem"
                  className="text-sm font-medium transition-colors hover:opacity-70"
                  style={{ color: colors.text }}
                >
                  THE PROBLEM
                </Link>
                <Link
                  href="#features"
                  className="text-sm font-medium transition-colors hover:opacity-70"
                  style={{ color: colors.text }}
                >
                  FEATURES
                </Link>
                <Link
                  href="#how-it-works"
                  className="text-sm font-medium transition-colors hover:opacity-70"
                  style={{ color: colors.text }}
                >
                  HOW IT WORKS
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/signup">
                <Button
                  className="font-medium px-5 rounded-full text-white"
                  style={{ backgroundColor: colors.primary }}
                >
                  Start Free
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="font-medium px-5 rounded-full shadow-sm"
                  style={{
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                  }}
                >
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section - New Positioning */}
        <section className="pt-32 pb-20 px-6 relative min-h-[90vh] flex items-center">
          {/* Decorative elements */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none hidden lg:block overflow-hidden">
            <div
              className="absolute top-20 right-20 w-64 h-64 rounded-full opacity-10"
              style={{ backgroundColor: colors.primary }}
            />
            <div
              className="absolute top-40 right-40 w-96 h-96 rounded-full opacity-5"
              style={{ backgroundColor: colors.primaryDark }}
            />
            <div
              className="absolute bottom-40 right-10 w-48 h-48 rounded-full opacity-10"
              style={{ backgroundColor: colors.accent }}
            />
          </div>

          <div className="max-w-7xl mx-auto w-full relative z-10">
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="max-w-2xl"
            >
              {/* Badge */}
              <motion.div variants={fadeIn} className="mb-6">
                <span
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                  style={{
                    backgroundColor: `${colors.primary}15`,
                    color: colors.primary,
                  }}
                >
                  <Globe className="w-4 h-4" />
                  Built for Remote Teams
                </span>
              </motion.div>

              {/* Headline - New Value Prop */}
              <motion.h1
                variants={fadeIn}
                className="text-5xl md:text-6xl font-bold mb-2 leading-[1.1]"
                style={{ color: colors.text }}
              >
                Coordinate help
              </motion.h1>
              <motion.h1
                variants={fadeIn}
                className="text-5xl md:text-6xl font-bold mb-8 leading-[1.1]"
                style={{ color: colors.primary }}
              >
                across time zones.
              </motion.h1>

              {/* Sub-headline */}
              <motion.p
                variants={fadeIn}
                className="text-xl mb-4 leading-relaxed max-w-lg font-medium"
                style={{ color: colors.text }}
              >
                No Calendly. No Slack chaos.
              </motion.p>

              {/* Description */}
              <motion.p
                variants={fadeIn}
                className="text-lg mb-10 leading-relaxed max-w-lg"
                style={{ color: colors.textMuted }}
              >
                See who's available, send contextual help requests, and schedule
                quick calls—all without the back-and-forth. Built for distributed
                startups, support teams, and open source communities.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeIn} className="flex flex-wrap gap-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="rounded-full px-8 h-12 text-base font-medium text-white gap-2"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Zap className="w-4 h-4" />
                    Get Started Free
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full px-8 h-12 text-base font-medium shadow-sm gap-2"
                    style={{
                      backgroundColor: colors.surface,
                      color: colors.text,
                      borderColor: colors.border,
                    }}
                  >
                    See How It Works
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </motion.div>

              {/* Social Proof */}
              <motion.div
                variants={fadeIn}
                className="mt-10 flex items-center gap-4 text-sm"
                style={{ color: colors.textMuted }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className="w-4 h-4"
                    style={{ color: colors.success }}
                  />
                  <span>Free forever for small teams</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className="w-4 h-4"
                    style={{ color: colors.success }}
                  />
                  <span>Slack integration</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Problem Section */}
        <section
          id="problem"
          className="py-24 px-6"
          style={{ backgroundColor: colors.text }}
        >
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span
                className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-6"
                style={{
                  backgroundColor: `${colors.accent}30`,
                  color: colors.accent,
                }}
              >
                The Problem
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                Remote work coordination is broken
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: "#A8A29E" }}>
                Your team has answers—but no one knows who to ask or when they're
                free.
              </p>
            </motion.div>

            {/* Problem Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Clock,
                  title: "Time Zone Math",
                  description:
                    "\"Is 3pm my time or yours?\" You're constantly calculating offsets and missing each other's availability windows.",
                },
                {
                  icon: Search,
                  title: "Who Do I Ask?",
                  description:
                    "Deep product knowledge lives in people's heads. It's not on Google, Stack Overflow, or your wiki. But someone on your team knows.",
                },
                {
                  icon: MessageCircle,
                  title: "Slack Chaos",
                  description:
                    "DMs flying everywhere, threads buried, no context. You spend more time coordinating than actually getting help.",
                },
              ].map((problem, index) => (
                <motion.div
                  key={problem.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-2xl p-6"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${colors.accent}30` }}
                  >
                    <problem.icon className="w-6 h-6" style={{ color: colors.accent }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">
                    {problem.title}
                  </h3>
                  <p style={{ color: "#A8A29E" }}>{problem.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Solution / Features Section */}
        <section
          id="features"
          className="py-24 px-6"
          style={{ backgroundColor: colors.background }}
        >
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span
                className="inline-block px-4 py-2 rounded-full text-sm font-medium shadow-sm mb-6"
                style={{
                  backgroundColor: `${colors.primary}15`,
                  color: colors.primary,
                }}
              >
                The Solution
              </span>
              <h2
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{ color: colors.text }}
              >
                Meshflow makes it simple
              </h2>
              <p
                className="text-lg max-w-xl mx-auto"
                style={{ color: colors.textMuted }}
              >
                Visual availability + contextual nudges + Slack integration
              </p>
            </motion.div>

            {/* Feature Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Feature 1 - Availability Grid */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="rounded-3xl p-8 shadow-md"
                style={{ backgroundColor: colors.surface }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${colors.primary}15` }}
                >
                  <Calendar className="w-7 h-7" style={{ color: colors.primary }} />
                </div>
                <h3
                  className="text-2xl font-bold mb-3"
                  style={{ color: colors.text }}
                >
                  Visual Availability Grid
                </h3>
                <p className="mb-4" style={{ color: colors.textMuted }}>
                  See your team's availability at a glance. Timezone-aware and
                  always up to date. Know instantly who's free right now or later
                  today.
                </p>
                <ul className="space-y-2">
                  {[
                    "Auto-detect timezone",
                    "\"Currently available\" live status",
                    "See overlap with teammates",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: colors.textMuted }}
                    >
                      <CheckCircle2
                        className="w-4 h-4"
                        style={{ color: colors.success }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Feature 2 - Contextual Nudges */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="rounded-3xl p-8 shadow-md"
                style={{ backgroundColor: colors.surface }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${colors.accent}20` }}
                >
                  <Zap className="w-7 h-7" style={{ color: colors.accent }} />
                </div>
                <h3
                  className="text-2xl font-bold mb-3"
                  style={{ color: colors.text }}
                >
                  Contextual Nudges
                </h3>
                <p className="mb-4" style={{ color: colors.textMuted }}>
                  Send help requests with context. Choose meeting length, suggest
                  times from overlapping availability, preview before sending.
                </p>
                <ul className="space-y-2">
                  {[
                    "Quick call (15min) or deep dive (1hr)",
                    "Auto-suggest meeting times",
                    "Async option for different shifts",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: colors.textMuted }}
                    >
                      <CheckCircle2
                        className="w-4 h-4"
                        style={{ color: colors.success }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Feature 3 - Knowledge Tags */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="rounded-3xl p-8 shadow-md"
                style={{ backgroundColor: colors.surface }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${colors.primary}15` }}
                >
                  <Search className="w-7 h-7" style={{ color: colors.primary }} />
                </div>
                <h3
                  className="text-2xl font-bold mb-3"
                  style={{ color: colors.text }}
                >
                  Lightweight Knowledge Tags
                </h3>
                <p className="mb-4" style={{ color: colors.textMuted }}>
                  Not skills with proficiency levels. Just simple "I know X" tags.
                  Search for "Salesforce API" and find who on your team can help.
                </p>
                <ul className="space-y-2">
                  {[
                    "Tag yourself: \"Rippling tax setup\"",
                    "Search across your pod",
                    "No complex skill databases",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: colors.textMuted }}
                    >
                      <CheckCircle2
                        className="w-4 h-4"
                        style={{ color: colors.success }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Feature 4 - Slack Integration */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="rounded-3xl p-8 shadow-md"
                style={{ backgroundColor: colors.surface }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: "#4A154B20" }}
                >
                  <Slack className="w-7 h-7" style={{ color: "#4A154B" }} />
                </div>
                <h3
                  className="text-2xl font-bold mb-3"
                  style={{ color: colors.text }}
                >
                  Slack Native
                </h3>
                <p className="mb-4" style={{ color: colors.textMuted }}>
                  Nudges delivered as Slack DMs. No new app to check. Works where
                  your team already communicates.
                </p>
                <ul className="space-y-2">
                  {[
                    "Direct messages, not channels",
                    "One-click OAuth connect",
                    "Meeting links included",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: colors.textMuted }}
                    >
                      <CheckCircle2
                        className="w-4 h-4"
                        style={{ color: colors.success }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Who It's For Section */}
        <section
          className="py-24 px-6"
          style={{ backgroundColor: `${colors.primary}08` }}
        >
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span
                className="inline-block px-4 py-2 rounded-full text-sm font-medium shadow-sm mb-6"
                style={{ backgroundColor: colors.surface, color: colors.textMuted }}
              >
                Who It's For
              </span>
              <h2
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{ color: colors.text }}
              >
                Built for distributed teams
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Remote Startups",
                  description:
                    "5-20 people across multiple time zones. Can't afford Calendly. Need quick coordination without overhead.",
                  example: "Team in Turkey, Arizona, and California",
                },
                {
                  title: "Customer Support Teams",
                  description:
                    "Knowledge gaps on product-specific issues. Different shifts, remote. Need fast answers during customer calls.",
                  example: "\"Who handled this tax reconciliation issue before?\"",
                },
                {
                  title: "Open Source Communities",
                  description:
                    "Global contributors, no formal Slack. Need to coordinate reviews and help requests across time zones.",
                  example: "Maintainers in Europe, contributors in Asia",
                },
              ].map((audience, index) => (
                <motion.div
                  key={audience.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-2xl p-6 shadow-md"
                  style={{ backgroundColor: colors.surface }}
                >
                  <h3
                    className="text-xl font-bold mb-3"
                    style={{ color: colors.primary }}
                  >
                    {audience.title}
                  </h3>
                  <p className="mb-4" style={{ color: colors.textMuted }}>
                    {audience.description}
                  </p>
                  <p
                    className="text-sm italic"
                    style={{ color: colors.textMuted }}
                  >
                    {audience.example}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section
          id="how-it-works"
          className="py-24 px-6"
          style={{ backgroundColor: colors.background }}
        >
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span
                className="inline-block px-4 py-2 rounded-full text-sm font-medium shadow-sm mb-6"
                style={{
                  backgroundColor: `${colors.primary}15`,
                  color: colors.primary,
                }}
              >
                How It Works
              </span>
              <h2
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{ color: colors.text }}
              >
                Get started in 3 minutes
              </h2>
              <p className="text-lg max-w-xl mx-auto" style={{ color: colors.textMuted }}>
                No complex setup. No training needed.
              </p>
            </motion.div>

            <div className="space-y-6">
              {[
                {
                  step: "01",
                  title: "Set Your Availability",
                  description:
                    "Drag to select your available hours. Timezone auto-detected. Toggle \"available now\" when you're free to help.",
                  icon: Calendar,
                },
                {
                  step: "02",
                  title: "Tag Your Knowledge",
                  description:
                    "Add simple tags for what you know: \"Rippling setup\", \"SQL debugging\", \"Salesforce API\". No proficiency levels.",
                  icon: Search,
                },
                {
                  step: "03",
                  title: "Send & Receive Nudges",
                  description:
                    "Search for help, pick a teammate, suggest a time. They get a Slack DM with everything they need to say yes.",
                  icon: MessageCircle,
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                  className="flex gap-6 items-center p-6 rounded-2xl shadow-md"
                  style={{ backgroundColor: colors.surface }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className="text-sm font-bold"
                        style={{ color: colors.primary }}
                      >
                        {item.step}
                      </span>
                      <h3
                        className="text-xl font-bold"
                        style={{ color: colors.text }}
                      >
                        {item.title}
                      </h3>
                    </div>
                    <p style={{ color: colors.textMuted }}>{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Manager Controls Callout */}
        <section className="py-16 px-6" style={{ backgroundColor: `${colors.primary}10` }}>
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row items-center gap-8 p-8 rounded-3xl shadow-lg"
              style={{ backgroundColor: colors.surface }}
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${colors.primary}15` }}
              >
                <Users className="w-10 h-10" style={{ color: colors.primary }} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3
                  className="text-2xl font-bold mb-2"
                  style={{ color: colors.text }}
                >
                  Manager-Controlled Pods
                </h3>
                <p style={{ color: colors.textMuted }}>
                  One manager creates a pod per team. No chaos, no spam, no
                  unwanted requests. Optionally open for cross-team help.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6" style={{ backgroundColor: colors.text }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to fix coordination?
            </h2>
            <p className="text-xl mb-10 max-w-xl mx-auto" style={{ color: "#A8A29E" }}>
              Stop wasting time on timezone math and Slack chaos. Start
              coordinating help in seconds.
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                className="rounded-full px-10 h-14 text-lg font-medium text-white gap-2"
                style={{ backgroundColor: colors.primary }}
              >
                <Zap className="w-5 h-5" />
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-sm mt-6" style={{ color: "#A8A29E" }}>
              Free forever for teams under 10 • No credit card required
            </p>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6" style={{ backgroundColor: "#0f0f1a" }}>
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Mesh</span>
              <span className="font-bold" style={{ color: colors.primaryLight }}>
                flow
              </span>
              <span className="text-sm ml-2" style={{ color: "#A8A29E" }}>
                © 2025
              </span>
            </div>
            <div className="flex gap-8 text-sm">
              <Link
                href="/login"
                className="transition-colors hover:opacity-80"
                style={{ color: "#A8A29E" }}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="transition-colors hover:opacity-80"
                style={{ color: "#A8A29E" }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
