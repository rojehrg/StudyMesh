"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Zap, TrendingUp, Sparkles, MessageCircle, Target, CheckCircle2 } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

// Animation variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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

const scaleOnHover = {
  scale: 1.02,
  transition: { duration: 0.2 },
};

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

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
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#FDFCFA]/80 backdrop-blur-md border-b border-gray-200/50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center cursor-pointer select-none hover:opacity-90 transition-opacity">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="text-teal-600 font-bold text-2xl"
            >
              Mesh
            </motion.span>
            <span className="text-gray-900 font-bold text-2xl">flow</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl shadow-sm">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-32 pb-20 px-6">
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="max-w-6xl mx-auto text-center"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-medium border border-teal-200">
                <Sparkles className="w-4 h-4" />
                Smart Team Enablement Platform
              </span>
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-6 leading-tight tracking-tight"
            >
              Close knowledge gaps.<br />
              <span className="text-teal-600">Outperform</span> together.
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              Meshflow helps teams discover hidden expertise, share knowledge instantly,
              and build a culture of collaboration that drives real results.
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/signup">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
                    Start for free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link href="#how-it-works">
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Button variant="outline" size="lg" className="rounded-xl px-8 py-6 text-lg border-2">
                    See how it works
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Floating Cards Visual */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-20 relative"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Stat Card 1 */}
              <motion.div
                variants={itemVariants}
                whileHover={scaleOnHover}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 cursor-default"
              >
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-4xl font-bold text-gray-900 mb-2">3.2x</h3>
                <p className="text-gray-600">Faster problem resolution</p>
              </motion.div>

              {/* Stat Card 2 */}
              <motion.div
                variants={itemVariants}
                whileHover={scaleOnHover}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 cursor-default"
              >
                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-cyan-600" />
                </div>
                <h3 className="text-4xl font-bold text-gray-900 mb-2">87%</h3>
                <p className="text-gray-600">Team engagement increase</p>
              </motion.div>

              {/* Stat Card 3 */}
              <motion.div
                variants={itemVariants}
                whileHover={scaleOnHover}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 cursor-default"
              >
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-4xl font-bold text-gray-900 mb-2">92%</h3>
                <p className="text-gray-600">Knowledge retention rate</p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Social Proof */}
      <section className="py-12 px-6 border-y border-gray-200/50">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-sm text-gray-500 mb-8 uppercase tracking-wider font-medium">
            Trusted by high-performing teams
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-40">
            <div className="text-2xl font-bold text-gray-400">Company A</div>
            <div className="text-2xl font-bold text-gray-400">Company B</div>
            <div className="text-2xl font-bold text-gray-400">Company C</div>
            <div className="text-2xl font-bold text-gray-400">Company D</div>
          </div>
        </div>
      </section>

      {/* Bento Box Features */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Everything you need to enable your team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From skill mapping to real-time collaboration, Meshflow makes knowledge sharing effortless.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Feature 1 - Large */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.1)" }}
              className="lg:col-span-2 bg-teal-50 rounded-3xl p-10 border-2 border-teal-100"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Smart Skill Matching</h3>
                  <p className="text-gray-700 text-lg">
                    Our intelligent algorithm connects teammates based on expertise and growth areas,
                    creating perfect learning pairs.
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-teal-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-sm font-bold text-teal-700">
                    A
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Alice Johnson</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">Python</span>
                      <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">SQL</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-teal-600 rotate-180" />
                    <ArrowRight className="w-4 h-4 text-teal-600 -ml-2" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Bob Smith</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">Excel</span>
                      <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">Tax</span>
                    </div>
                  </div>
                </div>
                <div className="bg-teal-600 text-white text-sm px-4 py-2 rounded-xl text-center font-medium">
                  92% Match Score
                </div>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.1)" }}
              className="bg-white rounded-3xl p-10 border-2 border-gray-100"
            >
              <div className="w-12 h-12 bg-cyan-600 rounded-2xl flex items-center justify-center mb-6">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Contextual Nudges</h3>
              <p className="text-gray-600 mb-6">
                Send skill-specific help requests or offers. No more guessing who knows what.
              </p>
              <div className="space-y-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-cyan-50 border border-cyan-200 rounded-xl p-4"
                >
                  <p className="text-sm font-medium text-cyan-900">Can you help me with Python?</p>
                  <p className="text-xs text-cyan-700 mt-1">From Alice • 2min ago</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-teal-50 border border-teal-200 rounded-xl p-4"
                >
                  <p className="text-sm font-medium text-teal-900">I can help you with Excel!</p>
                  <p className="text-xs text-teal-700 mt-1">From Bob • 5min ago</p>
                </motion.div>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.1)" }}
              className="bg-white rounded-3xl p-10 border-2 border-gray-100"
            >
              <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">"Looking to Help" Status</h3>
              <p className="text-gray-600 mb-6">
                Toggle your availability to mentor. Make yourself discoverable when you have bandwidth.
              </p>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-teal-50 border-2 border-teal-200 rounded-xl p-4 flex items-center gap-3"
              >
                <Sparkles className="w-5 h-5 text-teal-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-teal-900">You're Looking to Help</p>
                  <p className="text-xs text-teal-700">Teammates can see you're available</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Feature 4 - Large */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.1)" }}
              className="lg:col-span-2 bg-cyan-50 rounded-3xl p-10 border-2 border-cyan-100"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-cyan-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Organize with Pods</h3>
                  <p className="text-gray-700 text-lg">
                    Create focused groups by project, department, or initiative.
                    Keep knowledge sharing structured and relevant.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <motion.div whileHover={{ scale: 1.03 }} className="bg-white rounded-xl p-4 border border-cyan-100 shadow-sm">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center text-teal-700 font-bold mb-2">
                    E
                  </div>
                  <p className="text-sm font-medium text-gray-900">Engineering</p>
                  <p className="text-xs text-gray-600">12 members</p>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} className="bg-white rounded-xl p-4 border border-cyan-100 shadow-sm">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center text-cyan-700 font-bold mb-2">
                    F
                  </div>
                  <p className="text-sm font-medium text-gray-900">Finance</p>
                  <p className="text-xs text-gray-600">8 members</p>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} className="bg-white rounded-xl p-4 border border-cyan-100 shadow-sm">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center text-teal-700 font-bold mb-2">
                    S
                  </div>
                  <p className="text-sm font-medium text-gray-900">Sales</p>
                  <p className="text-xs text-gray-600">15 members</p>
                </motion.div>
              </div>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.15)" }}
              className="bg-gray-900 text-white rounded-3xl p-10"
            >
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Real-Time Insights</h3>
              <p className="text-gray-300 mb-6">
                Track team engagement, skill distribution, and collaboration patterns at a glance.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Active Collaborations</span>
                  <span className="font-bold">24</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "75%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-teal-500 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-sm mt-4">
                  <span className="text-gray-400">Skill Coverage</span>
                  <span className="font-bold">89%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "89%" }}
                    transition={{ duration: 1, delay: 0.7 }}
                    className="h-full bg-cyan-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              How Meshflow works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to transform your team's knowledge sharing
            </p>
          </motion.div>

          <div className="space-y-12">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ x: 8 }}
              className="flex items-start gap-6 bg-white p-8 rounded-2xl border-2 border-gray-100 shadow-sm"
            >
              <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-xl shadow-lg">
                1
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Map your team's skills</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Everyone lists what they know and what they want to learn.
                  We build a comprehensive skill map of your organization in minutes.
                </p>
                <div className="mt-4 flex gap-2">
                  <span className="text-xs bg-teal-100 text-teal-700 px-3 py-1 rounded-full font-medium">Expertise</span>
                  <span className="text-xs bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full font-medium">Growth Goals</span>
                  <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">Availability</span>
                </div>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ x: 8 }}
              className="flex items-start gap-6 bg-white p-8 rounded-2xl border-2 border-gray-100 shadow-sm"
            >
              <div className="w-14 h-14 bg-cyan-600 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-xl shadow-lg">
                2
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Discover perfect matches</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Our smart algorithm surfaces teammates who can help you grow and teammates you can mentor.
                  Knowledge sharing becomes effortless.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span className="text-sm text-gray-600">Fuzzy skill matching</span>
                  <CheckCircle2 className="w-4 h-4 text-teal-600 ml-4" />
                  <span className="text-sm text-gray-600">Compatibility scoring</span>
                </div>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ x: 8 }}
              className="flex items-start gap-6 bg-white p-8 rounded-2xl border-2 border-gray-100 shadow-sm"
            >
              <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-xl shadow-lg">
                3
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Collaborate & grow</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Send contextual nudges, offer help, ask questions.
                  Watch your team become more connected, capable, and productive.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-cyan-600" />
                  <span className="text-sm text-gray-600">Nudges with Slack integration</span>
                </div>
              </div>
            </motion.div>
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
            whileHover={{ scale: 1.01 }}
            className="bg-teal-600 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl"
          >
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Ready to unlock your team's potential?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-xl text-teal-50 mb-8 max-w-2xl mx-auto"
            >
              Join forward-thinking teams using Meshflow to build stronger,
              more collaborative organizations.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Link href="/signup">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-50 rounded-xl px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all font-bold">
                    Start for free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
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
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
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
