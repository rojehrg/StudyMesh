"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, MessageCircle, Target, Sparkles, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

// Smooth fade-in animation (Rooh-style: 0.8s with cubic-bezier)
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Clean & Minimal */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-0.5">
            <span className="text-teal-600 font-semibold text-xl tracking-tight">Mesh</span>
            <span className="text-gray-900 font-semibold text-xl tracking-tight">flow</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
              How it works
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 font-medium">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-4">
                Get Meshflow
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section - Bold & Clean */}
      <section className="pt-32 pb-24 px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center"
        >
          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-[1.1] tracking-tight"
          >
            Find expertise.
            <br />
            <span className="text-teal-600">Share knowledge.</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed font-light"
          >
            Connect teammates who can help each other grow.
            Meshflow surfaces hidden skills across your team.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/signup">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-8 h-14 text-base font-medium shadow-lg shadow-teal-600/20 hover:shadow-xl hover:shadow-teal-600/30 transition-all">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="ghost" size="lg" className="text-gray-600 hover:text-gray-900 rounded-full px-6 h-14 text-base font-medium">
                See how it works
                <ChevronRight className="ml-1 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Social Proof - Subtle */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-12 px-6 border-y border-gray-100"
      >
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm text-gray-400 mb-8 uppercase tracking-wider font-medium">
            Built for teams that move fast
          </p>
          <div className="grid grid-cols-3 gap-12 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-1">3x</div>
              <div className="text-sm text-gray-500">Faster onboarding</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-1">87%</div>
              <div className="text-sm text-gray-500">More connections</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-1">2min</div>
              <div className="text-sm text-gray-500">Setup time</div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features - Card Grid */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Simple tools that make knowledge sharing feel natural.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Feature Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group p-8 rounded-2xl border border-gray-100 hover:border-gray-200 bg-white hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-teal-100 transition-colors">
                <Target className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Matching</h3>
              <p className="text-gray-500 leading-relaxed">
                Our algorithm pairs teammates based on complementary skills. You teach what you know, learn what you need.
              </p>
            </motion.div>

            {/* Feature Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group p-8 rounded-2xl border border-gray-100 hover:border-gray-200 bg-white hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-cyan-100 transition-colors">
                <MessageCircle className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Quick Nudges</h3>
              <p className="text-gray-500 leading-relaxed">
                Send contextual requests to connect. Ask for help or offer your expertise—right from the dashboard.
              </p>
            </motion.div>

            {/* Feature Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="group p-8 rounded-2xl border border-gray-100 hover:border-gray-200 bg-white hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-teal-100 transition-colors">
                <Users className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Team Pods</h3>
              <p className="text-gray-500 leading-relaxed">
                Organize by project, department, or initiative. Share a code and teammates join instantly.
              </p>
            </motion.div>

            {/* Feature Card 4 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="group p-8 rounded-2xl border border-gray-100 hover:border-gray-200 bg-white hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-cyan-100 transition-colors">
                <Sparkles className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Help Status</h3>
              <p className="text-gray-500 leading-relaxed">
                Toggle when you're available to mentor. Be visible to teammates when you have bandwidth to help.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works - Clean Steps */}
      <section id="how-it-works" className="py-24 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-lg text-gray-500">
              Get your team connected in three simple steps.
            </p>
          </motion.div>

          <div className="space-y-8">
            {[
              {
                step: "01",
                title: "Add your skills",
                description: "List what you're good at and what you want to learn. Takes about 2 minutes.",
              },
              {
                step: "02",
                title: "See your matches",
                description: "Meshflow finds teammates who can help you grow—and those you can mentor.",
              },
              {
                step: "03",
                title: "Start connecting",
                description: "Send a nudge, start a conversation, share knowledge. Watch your team thrive.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex gap-6 items-start"
              >
                <div className="text-5xl font-bold text-gray-200 shrink-0 w-16">
                  {item.step}
                </div>
                <div className="pt-2">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Clean & Bold */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to unlock your team's potential?
          </h2>
          <p className="text-xl text-gray-500 mb-10 max-w-xl mx-auto">
            Join teams using Meshflow to build stronger, more connected organizations.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-10 h-14 text-lg font-medium shadow-lg shadow-teal-600/20 hover:shadow-xl hover:shadow-teal-600/30 transition-all">
              Get started free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm text-gray-400 mt-6">No credit card required</p>
        </motion.div>
      </section>

      {/* Footer - Minimal */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-teal-600 font-semibold text-lg">Mesh</span>
            <span className="text-gray-900 font-semibold text-lg">flow</span>
            <span className="text-gray-400 text-sm ml-3">© 2025</span>
          </div>
          <div className="flex gap-8 text-sm">
            <Link href="/login" className="text-gray-500 hover:text-gray-900 transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="text-gray-500 hover:text-gray-900 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
