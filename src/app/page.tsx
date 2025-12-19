"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Clock, Zap, Sparkles, Globe, MessageCircle, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDFCFA] font-sans relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="animated-grid" />
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* Content Wrapper */}
      <div className="relative z-10 min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FDFCFA]/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center cursor-pointer select-none hover:opacity-90 transition-opacity">
            <span className="text-teal-600 font-bold text-2xl">Mesh</span>
            <span className="text-gray-900 font-bold text-2xl">flow</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl shadow-sm">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-medium text-teal-700">Free for remote teams</span>
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
              Coordinate help<br />
              across <span className="text-teal-600">time zones</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              See who's available when. Coordinate help in seconds. Connect on Slack.<br />
              <span className="text-gray-500">No Calendly. No DM chaos.</span>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
                  Start for free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="rounded-xl px-8 py-6 text-lg border-2">
                  See how it works
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Problem Statements */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 relative"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Pain Point 1 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Time zone math is hard</h3>
                <p className="text-gray-600 text-sm">Team in Turkey, Arizona, California? Finding overlapping time is painful.</p>
              </div>

              {/* Pain Point 2 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Who do I even ask?</h3>
                <p className="text-gray-600 text-sm">Deep product knowledge isn't googleable. But your teammate knows it.</p>
              </div>

              {/* Pain Point 3 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Slack is chaos</h3>
                <p className="text-gray-600 text-sm">DMs everywhere. No context. Hard to schedule. Calendly costs $100/month.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 px-6 border-y border-gray-200/50">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-sm text-gray-500 mb-8 uppercase tracking-wider font-medium">
            Built for distributed teams
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12">
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Remote Startups
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Support Teams
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Open Source Communities
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Consulting Teams
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Everything you need to coordinate
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Visual availability, contextual nudges, and Slack integration. That's it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 - Large */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl p-10 border border-teal-100 hover:shadow-xl transition-all"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Visual Availability Grid</h3>
                  <p className="text-gray-700 text-lg">
                    See when your whole team is free at a glance. Automatic time zone conversion.
                    No more mental math.
                  </p>
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/60">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-sm font-bold text-teal-700">
                      A
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Alice (California)</p>
                      <div className="flex gap-1 mt-1">
                        {[...Array(24)].map((_, i) => (
                          <div key={i} className={`w-2 h-6 rounded-sm ${i >= 9 && i <= 17 ? 'bg-teal-500' : 'bg-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center text-sm font-bold text-cyan-700">
                      B
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Bob (Turkey)</p>
                      <div className="flex gap-1 mt-1">
                        {[...Array(24)].map((_, i) => (
                          <div key={i} className={`w-2 h-6 rounded-sm ${i >= 18 || i <= 2 ? 'bg-cyan-500' : 'bg-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-teal-600 text-white text-sm px-4 py-2 rounded-xl text-center font-medium">
                  ✓ Overlapping time: 6-7 PM California = 4-5 AM Turkey
                </div>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-3xl p-10 border border-gray-200 hover:shadow-xl transition-all"
            >
              <div className="w-12 h-12 bg-cyan-600 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Who's Free Now?</h3>
              <p className="text-gray-600 mb-6">
                Live status indicators. See who's available right this second for quick questions.
              </p>
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Sarah Chen</p>
                    <p className="text-xs text-green-700">Available now</p>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-3 h-3 bg-gray-400 rounded-full" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Tom Wilson</p>
                    <p className="text-xs text-gray-600">Free in 2 hours</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-3xl p-10 border border-gray-200 hover:shadow-xl transition-all"
            >
              <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Contextual Nudges</h3>
              <p className="text-gray-600 mb-6">
                Send help requests with context. "Need 15 min to talk about Rippling tax setup."
              </p>
              <div className="space-y-3">
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <p className="text-sm font-medium text-purple-900">📅 15 min meeting</p>
                  <p className="text-xs text-purple-700 mt-1">Topic: Rippling tax reconciliation</p>
                  <p className="text-xs text-purple-600 mt-2">Suggested: Today 2-3 PM PT</p>
                </div>
              </div>
            </motion.div>

            {/* Feature 4 - Large */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-10 border border-purple-100 hover:shadow-xl transition-all"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Manager-Controlled Pods</h3>
                  <p className="text-gray-700 text-lg">
                    One pod per team. Manager creates it, invites members.
                    No chaos of overlapping groups.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/60">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center text-teal-700 font-bold mb-2">
                    CS
                  </div>
                  <p className="text-sm font-medium text-gray-900">Customer Support</p>
                  <p className="text-xs text-gray-600">8 members</p>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/60">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center text-cyan-700 font-bold mb-2">
                    E
                  </div>
                  <p className="text-sm font-medium text-gray-900">Engineering</p>
                  <p className="text-xs text-gray-600">12 members</p>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/60">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 font-bold mb-2">
                    F
                  </div>
                  <p className="text-sm font-medium text-gray-900">Finance</p>
                  <p className="text-xs text-gray-600">5 members</p>
                </div>
              </div>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-3xl p-10 hover:shadow-xl transition-all"
            >
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Slack Integration</h3>
              <p className="text-gray-300 mb-6">
                Nudges go straight to Slack. Conversation happens there. We don't replace your tools.
              </p>
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <p className="text-sm font-medium mb-2">💬 Slack message sent</p>
                <p className="text-xs text-gray-300">"@sarah needs 15 min help with Rippling tax reconciliation. Free today 2-3 PM PT?"</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Dead simple workflow
            </h2>
            <p className="text-xl text-gray-600">
              No training needed. Your team will get it immediately.
            </p>
          </div>

          <div className="space-y-16">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-start gap-8"
            >
              <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-2xl shadow-lg">
                1
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">Set your availability</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Visual grid shows when you're free. Automatically detects your time zone.
                  Toggle "Available now" when you have bandwidth.
                </p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-start gap-8"
            >
              <div className="w-16 h-16 bg-cyan-600 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-2xl shadow-lg">
                2
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">See who's free when</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  View your team's availability grid. Filter by "Available now" or see overlapping time slots.
                  Search who knows what with lightweight tags.
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-start gap-8"
            >
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-2xl shadow-lg">
                3
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">Send a nudge</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Click "Nudge" → Add topic → Choose meeting length → Get suggested times → Send.
                  They get a Slack message. Done in 10 seconds.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Who is this for?
            </h2>
            <p className="text-xl text-gray-600">
              Built for teams where time zones and deep knowledge are challenges
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 border-2 border-teal-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Remote Startups (5-20 people)</h3>
              <p className="text-gray-600 mb-4">
                Team spread across time zones. Can't afford Calendly ($100/month).
                Need quick coordination for daily stand-ups and ad-hoc help.
              </p>
              <p className="text-sm text-teal-700 font-medium">
                Perfect for: Distributed early-stage companies
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-cyan-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Customer Support Teams</h3>
              <p className="text-gray-600 mb-4">
                Knowledge gaps on product-specific issues. Remote shifts.
                "Who handled the Rippling tax reconciliation issue before?"
              </p>
              <p className="text-sm text-cyan-700 font-medium">
                Perfect for: Support, success, account management teams
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-purple-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Open Source Communities</h3>
              <p className="text-gray-600 mb-4">
                Global contributors. No formal Slack org.
                Need to coordinate code reviews and mentorship across 12 time zones.
              </p>
              <p className="text-sm text-purple-700 font-medium">
                Perfect for: Open source projects, volunteer orgs
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-amber-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Consulting/Agency Teams</h3>
              <p className="text-gray-600 mb-4">
                Multiple projects, siloed knowledge. Need to borrow expertise across accounts.
                Billable hours = fast answers are critical.
              </p>
              <p className="text-sm text-amber-700 font-medium">
                Perfect for: Agencies, consultancies, professional services
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Why not just use...
            </h2>
            <p className="text-xl text-gray-600">
              Good question. Here's how we're different.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                  <Calendar className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Google Workspace?</h3>
                  <p className="text-gray-600 mb-3">
                    Great for documents and email. But checking 10 calendars manually for availability?
                    No concept of "who knows what."
                  </p>
                  <p className="text-sm font-medium text-teal-600">
                    ✓ Meshflow: One glance at visual availability grid. Searchable knowledge tags.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Calendly?</h3>
                  <p className="text-gray-600 mb-3">
                    $100/month for basic team features. Only does scheduling.
                    Doesn't help with "who should I even schedule with?"
                  </p>
                  <p className="text-sm font-medium text-teal-600">
                    ✓ Meshflow: Free. Shows who knows what + when they're free.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                  <MessageCircle className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Slack?</h3>
                  <p className="text-gray-600 mb-3">
                    Perfect for messaging. But "Does anyone know how to...?" in #general?
                    No visibility into availability or expertise.
                  </p>
                  <p className="text-sm font-medium text-teal-600">
                    ✓ Meshflow: Integrates with Slack. Adds the coordination layer on top.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Start coordinating better
            </h2>
            <p className="text-xl text-teal-50 mb-8 max-w-2xl mx-auto">
              Free for remote teams. Set up in 5 minutes.
              No credit card required.
            </p>
            <Link href="/signup">
              <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-50 rounded-xl px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all font-bold">
                Get started free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-sm text-teal-100 mt-4">
              Used by distributed startups, support teams, and open source communities
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center">
              <span className="text-teal-600 font-bold text-xl">Mesh</span>
              <span className="text-gray-900 font-bold text-xl">flow</span>
              <span className="ml-3 text-sm text-gray-500">© 2025 All rights reserved</span>
            </div>
            <div className="flex gap-8">
              <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                About
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="text-gray-600 hover:text-gray-900 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
