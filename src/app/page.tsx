"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Users,
  MessageCircle,
  Clock,
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

      {/* Force light mode on landing page */}
      <div className="min-h-screen overflow-hidden light" style={{ colorScheme: 'light' }}>
        <div className="min-h-screen" style={{
          backgroundColor: 'hsl(0 0% 98%)',
          color: 'hsl(240 10% 15%)'
        }}>
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl" style={{
          backgroundColor: 'hsla(0, 0%, 98%, 0.9)'
        }}>
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-10">
              <Link href="/" className="flex items-center gap-1">
                <span style={{ color: 'hsl(262 55% 55%)' }} className="font-bold text-xl">Mesh</span>
                <span className="font-bold text-xl" style={{ color: 'hsl(260 25% 18%)' }}>flow</span>
              </Link>
              <div className="hidden md:flex items-center gap-8">
                <Link
                  href="#features"
                  className="text-sm font-medium transition-colors hover:opacity-70"
                  style={{ color: 'hsl(260 10% 45%)' }}
                >
                  Features
                </Link>
                <Link
                  href="#how-it-works"
                  className="text-sm font-medium transition-colors hover:opacity-70"
                  style={{ color: 'hsl(260 10% 45%)' }}
                >
                  How it works
                </Link>
                <Link
                  href="#teams"
                  className="text-sm font-medium transition-colors hover:opacity-70"
                  style={{ color: 'hsl(260 10% 45%)' }}
                >
                  For Teams
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="font-medium hover:bg-violet-50 transition-colors"
                  style={{ color: 'hsl(240 10% 25%)' }}
                >
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="font-medium rounded-full px-5 hover:opacity-90 transition-opacity" style={{
                  backgroundColor: 'hsl(262 60% 50%)',
                  color: 'white'
                }}>
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
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl" style={{ backgroundColor: 'hsla(262, 55%, 55%, 0.08)' }} />
            <div className="absolute top-60 -left-40 w-[400px] h-[400px] rounded-full blur-3xl" style={{ backgroundColor: 'hsla(262, 45%, 70%, 0.06)' }} />
            <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full blur-3xl" style={{ backgroundColor: 'hsla(262, 55%, 55%, 0.04)' }} />
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
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium" style={{
                  backgroundColor: 'hsla(262, 55%, 55%, 0.1)',
                  color: 'hsl(262 55% 55%)'
                }}>
                  <Sparkles className="w-4 h-4" />
                  Built for remote-first teams
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={fadeIn}
                className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight"
                style={{ color: 'hsl(260 25% 18%)' }}
              >
                Stop the timezone
                <br />
                <span style={{ color: 'hsl(262 55% 55%)' }}>coordination chaos</span>
              </motion.h1>

              {/* Sub-headline */}
              <motion.p
                variants={fadeIn}
                className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed"
                style={{ color: 'hsl(260 10% 45%)' }}
              >
                See who's available, find who knows what, and schedule help—all without the endless Slack threads.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeIn} className="flex flex-wrap justify-center gap-4 mb-12">
                <Link href="/signup">
                  <Button size="lg" className="rounded-full px-8 h-14 text-base font-semibold gap-2" style={{
                    backgroundColor: 'hsl(262 55% 55%)',
                    color: 'white',
                    boxShadow: '0 8px 30px hsla(262, 55%, 55%, 0.25)'
                  }}>
                    <Zap className="w-5 h-5" />
                    Start for Free
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="rounded-full px-8 h-14 text-base font-semibold gap-2"
                    style={{ color: 'hsl(260 25% 18%)' }}
                  >
                    <Play className="w-5 h-5" />
                    See How It Works
                  </Button>
                </Link>
              </motion.div>

              {/* Value Props - Updated */}
              <motion.div
                variants={fadeIn}
                className="flex flex-wrap justify-center gap-6 text-sm"
                style={{ color: 'hsl(260 10% 45%)' }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" style={{ color: 'hsl(262 55% 55%)' }} />
                  <span>Visual availability grid</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" style={{ color: 'hsl(262 55% 55%)' }} />
                  <span>Smart nudge system</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" style={{ color: 'hsl(262 55% 55%)' }} />
                  <span>Slack integration</span>
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
              <div className="rounded-2xl overflow-hidden max-w-4xl mx-auto" style={{
                backgroundColor: 'white',
                boxShadow: '0 25px 50px -12px hsla(262, 55%, 55%, 0.15)'
              }}>
                <div className="p-1 flex items-center gap-2" style={{ backgroundColor: 'hsl(48 20% 94%)' }}>
                  <div className="flex gap-1.5 ml-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(0 55% 65%)' }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(45 70% 55%)' }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(262 45% 60%)' }} />
                  </div>
                  <div className="flex-1 text-center text-xs font-medium" style={{ color: 'hsl(260 10% 50%)' }}>
                    meshflow.app/dashboard
                  </div>
                </div>
                <div className="p-8" style={{ background: 'linear-gradient(to bottom, white, hsl(48 30% 97%))' }}>
                  <div className="grid grid-cols-3 gap-6">
                    {/* Availability Preview */}
                    <div className="col-span-2 rounded-xl p-5" style={{ backgroundColor: 'hsl(48 50% 98%)' }}>
                      <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5" style={{ color: 'hsl(262 55% 55%)' }} />
                        <span className="font-semibold" style={{ color: 'hsl(260 25% 18%)' }}>Team Availability</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                          <div key={i} className="text-center text-xs font-medium" style={{ color: 'hsl(260 10% 50%)' }}>{day}</div>
                        ))}
                        {Array.from({ length: 21 }).map((_, i) => (
                          <div
                            key={i}
                            className="h-6 rounded"
                            style={{
                              backgroundColor: [0, 1, 2, 7, 8, 9, 14, 15, 16].includes(i)
                                ? 'hsla(262, 55%, 55%, 0.3)'
                                : [3, 4, 10, 11, 17, 18].includes(i)
                                ? 'hsla(262, 55%, 55%, 0.15)'
                                : 'hsl(48 20% 92%)'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Team Members */}
                    <div className="rounded-xl p-5" style={{ backgroundColor: 'hsl(48 50% 98%)' }}>
                      <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5" style={{ color: 'hsl(262 55% 55%)' }} />
                        <span className="font-semibold" style={{ color: 'hsl(260 25% 18%)' }}>Online Now</span>
                      </div>
                      <div className="space-y-3">
                        {['Sarah', 'Mike', 'Priya'].map((name, i) => (
                          <div key={name} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style={{
                              backgroundColor: 'hsla(262, 55%, 55%, 0.15)',
                              color: 'hsl(262 55% 55%)'
                            }}>
                              {name[0]}
                            </div>
                            <div>
                              <div className="text-sm font-medium" style={{ color: 'hsl(260 25% 18%)' }}>{name}</div>
                              <div className="text-xs" style={{ color: 'hsl(260 10% 50%)' }}>
                                {i === 0 ? 'Available' : i === 1 ? 'In a meeting' : 'Away'}
                              </div>
                            </div>
                            <div className="w-2 h-2 rounded-full ml-auto" style={{
                              backgroundColor: i === 0 ? 'hsl(262 55% 55%)' : i === 1 ? 'hsl(45 70% 55%)' : 'hsl(260 10% 70%)'
                            }} />
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
        <section className="py-24 px-6" style={{ backgroundColor: 'white' }}>
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-6" style={{
                backgroundColor: 'hsla(262, 55%, 55%, 0.1)',
                color: 'hsl(262 55% 55%)'
              }}>
                The Problem
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'hsl(260 25% 18%)' }}>
                Remote coordination is <span style={{ color: 'hsl(262 55% 55%)' }}>broken</span>
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: 'hsl(260 10% 45%)' }}>
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
                  className="rounded-2xl p-6"
                  style={{ backgroundColor: 'hsl(48 50% 97%)' }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{
                    backgroundColor: 'hsla(262, 55%, 55%, 0.1)'
                  }}>
                    <problem.icon className="w-6 h-6" style={{ color: 'hsl(262 55% 55%)' }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'hsl(260 25% 18%)' }}>{problem.title}</h3>
                  <p style={{ color: 'hsl(260 10% 45%)' }}>{problem.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section - Bento Grid Style */}
        <section id="features" className="py-24 px-6" style={{ backgroundColor: 'hsl(0 0% 98%)' }}>
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'hsl(240 10% 15%)' }}>
                Powerful features,<br /><span style={{ color: 'hsl(262 60% 50%)' }}>zero complexity</span>
              </h2>
              <p className="text-lg max-w-xl mx-auto" style={{ color: 'hsl(240 5% 45%)' }}>
                Everything you need to coordinate async teams, nothing you don't.
              </p>
            </motion.div>

            {/* Bento Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Large feature card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="md:col-span-2 md:row-span-2 rounded-3xl p-8 relative overflow-hidden group"
                style={{ backgroundColor: 'hsl(262 60% 50%)', minHeight: '400px' }}
              >
                <div className="relative z-10">
                  <Calendar className="w-10 h-10 text-white/80 mb-4" />
                  <h3 className="text-3xl font-bold text-white mb-3">Visual Availability</h3>
                  <p className="text-white/80 text-lg max-w-md">
                    See your entire team's availability at a glance. Auto-detected timezones, drag-to-select scheduling.
                  </p>
                </div>
                {/* Decorative grid */}
                <div className="absolute bottom-0 right-0 w-2/3 h-2/3 opacity-20">
                  <div className="grid grid-cols-7 gap-1 p-4">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <div key={i} className="h-8 rounded bg-white/30" style={{
                        opacity: Math.random() > 0.5 ? 0.8 : 0.3
                      }} />
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Small cards */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="rounded-3xl p-6 group hover:scale-[1.02] transition-transform"
                style={{ backgroundColor: 'white', border: '1px solid hsl(240 5% 92%)' }}
              >
                <Zap className="w-8 h-8 mb-3" style={{ color: 'hsl(262 60% 50%)' }} />
                <h3 className="text-xl font-bold mb-2" style={{ color: 'hsl(240 10% 15%)' }}>Smart Nudges</h3>
                <p className="text-sm" style={{ color: 'hsl(240 5% 45%)' }}>
                  Send contextual help requests with suggested times. 15min to 1hr options.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="rounded-3xl p-6 group hover:scale-[1.02] transition-transform"
                style={{ backgroundColor: 'white', border: '1px solid hsl(240 5% 92%)' }}
              >
                <Search className="w-8 h-8 mb-3" style={{ color: 'hsl(262 60% 50%)' }} />
                <h3 className="text-xl font-bold mb-2" style={{ color: 'hsl(240 10% 15%)' }}>Knowledge Tags</h3>
                <p className="text-sm" style={{ color: 'hsl(240 5% 45%)' }}>
                  Simple "I know X" tags. Find who knows what in seconds.
                </p>
              </motion.div>

              {/* Slack integration - wide card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="md:col-span-3 rounded-3xl p-8 flex items-center justify-between group"
                style={{ backgroundColor: 'hsl(240 5% 96%)' }}
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#4A154B' }}>
                    <Slack className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-1" style={{ color: 'hsl(240 10% 15%)' }}>Native Slack Integration</h3>
                    <p style={{ color: 'hsl(240 5% 45%)' }}>Nudges delivered as DMs. One-click OAuth. Works where you already are.</p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400 group-hover:translate-x-2 transition-transform" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works - Modern Steps */}
        <section id="how-it-works" className="py-24 px-6" style={{ backgroundColor: 'white' }}>
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'hsl(240 10% 15%)' }}>
                Setup in <span style={{ color: 'hsl(262 60% 50%)' }}>under 3 minutes</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { num: "01", title: "Set availability", desc: "Drag to select hours. Timezone auto-detected." },
                { num: "02", title: "Tag knowledge", desc: "Add what you know: \"React\", \"Tax compliance\"" },
                { num: "03", title: "Start nudging", desc: "Find help, suggest times, send via Slack." },
              ].map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl font-bold" style={{
                    backgroundColor: 'hsl(262 60% 50%)',
                    color: 'white'
                  }}>
                    {step.num}
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'hsl(240 10% 15%)' }}>{step.title}</h3>
                  <p style={{ color: 'hsl(240 5% 45%)' }}>{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof / Trust */}
        <section className="py-16 px-6" style={{ backgroundColor: 'hsl(0 0% 98%)' }}>
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="text-sm font-medium mb-6" style={{ color: 'hsl(240 5% 50%)' }}>BUILT FOR TEAMS LIKE</p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
                {['Remote Startups', 'Support Teams', 'Open Source', 'Agencies'].map((team) => (
                  <span key={team} className="text-xl font-semibold" style={{ color: 'hsl(240 10% 30%)' }}>{team}</span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section - Modern gradient */}
        <section className="py-24 px-6 relative overflow-hidden" style={{ backgroundColor: 'hsl(262 60% 50%)' }}>
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-white/5" />
            <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-white/5" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center relative z-10"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Stop the coordination chaos
            </h2>
            <p className="text-xl mb-10 text-white/80">
              Join teams who've simplified how they find and help each other.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="rounded-full px-10 h-14 text-lg font-semibold gap-2 hover:scale-105 transition-transform" style={{
                  backgroundColor: 'white',
                  color: 'hsl(262 60% 50%)'
                }}>
                  <Zap className="w-5 h-5" />
                  Get Started Free
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="ghost" className="rounded-full px-10 h-14 text-lg font-semibold text-white hover:bg-white/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Footer - Minimal */}
        <footer className="py-12 px-6" style={{ backgroundColor: 'hsl(240 10% 10%)' }}>
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl text-white">Mesh</span>
                <span className="font-bold text-xl" style={{ color: 'hsl(262 60% 65%)' }}>flow</span>
              </div>
              <div className="flex gap-8 text-sm text-gray-400">
                <Link href="/login" className="hover:text-white transition-colors">Login</Link>
                <Link href="/signup" className="hover:text-white transition-colors">Get Started</Link>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
              © 2025 Meshflow. Built for distributed teams.
            </div>
          </div>
        </footer>
        </div>
      </div>
    </>
  );
}
