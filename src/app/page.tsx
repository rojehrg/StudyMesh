"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Zap, TrendingUp, Sparkles, MessageCircle, Target, CheckCircle2, Play } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

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

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 50]);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-teal-600 font-bold text-xl">Mesh</span>
            <span className="text-gray-900 font-bold text-xl">flow</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-28 pb-20 px-6">
        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full text-sm font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Team Knowledge Platform
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-5 leading-[1.1] tracking-tight"
            >
              Stop searching.
              <br />
              <span className="text-teal-600">Start connecting.</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Meshflow surfaces hidden expertise across your team, so the right people connect at the right time.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <Link href="/signup">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-6 h-12 text-base shadow-sm">
                  Start free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="lg" className="rounded-lg px-6 h-12 text-base border-gray-200">
                  <Play className="mr-2 h-4 w-4" />
                  See how it works
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <motion.div variants={itemVariants} className="text-center">
              <div className="text-3xl font-bold text-gray-900">3.2x</div>
              <div className="text-sm text-gray-500 mt-1">Faster resolution</div>
            </motion.div>
            <motion.div variants={itemVariants} className="text-center">
              <div className="text-3xl font-bold text-gray-900">87%</div>
              <div className="text-sm text-gray-500 mt-1">More engagement</div>
            </motion.div>
            <motion.div variants={itemVariants} className="text-center">
              <div className="text-3xl font-bold text-gray-900">92%</div>
              <div className="text-sm text-gray-500 mt-1">Knowledge retained</div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Visual Demo Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden"
          >
            {/* Browser Chrome */}
            <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-white rounded px-4 py-1 text-xs text-gray-500 border">
                  app.meshflow.io
                </div>
              </div>
            </div>

            {/* App Preview */}
            <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Match Card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Best Match</span>
                    <span className="bg-teal-100 text-teal-700 text-xs font-semibold px-2 py-1 rounded-full">92%</span>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-semibold">
                      SJ
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Sarah Johnson</p>
                      <p className="text-sm text-gray-500">Engineering</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Can help you with:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="bg-cyan-50 text-cyan-700 text-xs px-2 py-1 rounded-md">Python</span>
                      <span className="bg-cyan-50 text-cyan-700 text-xs px-2 py-1 rounded-md">SQL</span>
                    </div>
                  </div>
                </motion.div>

                {/* Nudge Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <MessageCircle className="w-4 h-4 text-teal-600" />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nudge</span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-teal-50 border border-teal-100 rounded-lg p-3">
                      <p className="text-sm text-teal-900">Hey! I can help you with SQL queries.</p>
                      <p className="text-xs text-teal-600 mt-1">From Sarah • 2m ago</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                      <p className="text-sm text-gray-700">Need help with Python?</p>
                      <p className="text-xs text-gray-500 mt-1">From Mike • 5m ago</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Everything your team needs
            </h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Simple tools that make knowledge sharing natural.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-teal-200 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Matching</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Our algorithm connects teammates based on expertise and growth areas automatically.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-teal-200 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="w-5 h-5 text-cyan-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Nudges</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Send skill-specific requests or offers. Connects to Slack for instant notifications.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-teal-200 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Pods</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Organize by project, department, or initiative. Keep knowledge sharing focused.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-teal-200 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-cyan-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Help Status</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Toggle when you're available to mentor. Be discoverable when you have bandwidth.
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-teal-200 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Skill Mapping</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                See what your team knows and what they want to learn. Find gaps at a glance.
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-teal-200 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-cyan-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Help Requests</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Post what you need help with. Get notified when someone with that skill joins.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              How it works
            </h2>
            <p className="text-lg text-gray-600">
              Three steps to better team collaboration
            </p>
          </motion.div>

          <div className="space-y-6">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex gap-5 items-start bg-white p-6 rounded-xl border border-gray-200"
            >
              <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center shrink-0 text-white font-bold">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Map your skills</h3>
                <p className="text-gray-600">
                  Everyone adds what they know and what they want to learn. Takes 2 minutes.
                </p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex gap-5 items-start bg-white p-6 rounded-xl border border-gray-200"
            >
              <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center shrink-0 text-white font-bold">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Find matches</h3>
                <p className="text-gray-600">
                  See who can help you grow and who you can mentor. Automatic matching.
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex gap-5 items-start bg-white p-6 rounded-xl border border-gray-200"
            >
              <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center shrink-0 text-white font-bold">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Connect & grow</h3>
                <p className="text-gray-600">
                  Send nudges, offer help, learn from each other. Watch your team thrive.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to unlock your team's potential?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join teams using Meshflow to build stronger, more collaborative organizations.
            </p>
            <Link href="/signup">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-8 h-12 text-base shadow-sm">
                Get started free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <p className="text-sm text-gray-500 mt-4">No credit card required</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-teal-600 font-bold text-lg">Mesh</span>
              <span className="text-gray-900 font-bold text-lg">flow</span>
              <span className="text-sm text-gray-500 ml-2">© 2025</span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Sign In
              </Link>
              <Link href="/signup" className="text-gray-600 hover:text-gray-900">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
