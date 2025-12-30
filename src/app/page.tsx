"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AvailabilityGrid } from "@/components/availability-grid";
import {
  ArrowRight,
  Users,
  Zap,
  Calendar,
  Globe,
  MessageSquare,
  Play,
  Timer,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

// Demo availability data for the landing page preview
const DEMO_AVAILABILITY = {
  timezone: "America/New_York",
  slots: [
    { day: 0, startSlot: 4, endSlot: 6 },    // Mon 2:00-3:00
    { day: 1, startSlot: 4, endSlot: 5 },    // Tue 2:00-2:30
    { day: 1, startSlot: 8, endSlot: 10 },   // Tue 4:00-5:00
    { day: 1, startSlot: 16, endSlot: 18 },  // Tue 8:00-9:00
    { day: 2, startSlot: 2, endSlot: 4 },    // Wed 1:00-2:00
    { day: 3, startSlot: 10, endSlot: 12 },  // Thu 5:00-6:00
    { day: 3, startSlot: 14, endSlot: 16 },  // Thu 7:00-8:00
    { day: 4, startSlot: 2, endSlot: 4 },    // Fri 1:00-2:00
    { day: 4, startSlot: 22, endSlot: 24 },  // Fri 11:00-12:00
  ],
  currentlyAvailable: false,
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F4] text-gray-900 antialiased">
      {/* Navigation - Minimal, sticky */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F8F7F4]/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-0.5">
            <span className="font-bold text-xl text-violet-600">Mesh</span>
            <span className="font-bold text-xl text-gray-900">flow</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              How it works
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100/50">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="font-medium bg-violet-600 text-white hover:bg-violet-700 rounded-lg px-4">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Social Proof Kicker */}
            <motion.div variants={fadeIn} className="mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-violet-50 text-violet-700 border border-violet-100">
                <Users className="w-4 h-4" />
                Built for distributed teams
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={fadeIn}
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6"
            >
              See when your team
              <br />
              <span className="text-violet-600">is available. Instantly.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeIn}
              className="text-xl md:text-2xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Stop the endless "when are you free?" messages. Meshflow shows real-time
              team availability so you coordinate meetings, not calendars.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Link href="/signup">
                <Button className="h-14 px-8 text-base font-semibold bg-violet-600 text-white hover:bg-violet-700 rounded-xl shadow-lg shadow-violet-500/20 gap-2">
                  Start Free — No Credit Card
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="h-14 px-8 text-base font-semibold rounded-xl bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 gap-2"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Objection Handler */}
            <motion.p variants={fadeIn} className="text-sm text-gray-400">
              Free forever for small teams. Setup takes 2 minutes.
            </motion.p>
          </motion.div>

          {/* Product Screenshot */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-16 max-w-5xl mx-auto"
          >
            <div className="rounded-2xl bg-white border border-gray-200 shadow-2xl shadow-gray-300/30 overflow-hidden">
              {/* Browser Chrome */}
              <div className="px-4 py-3 bg-[#F8F7F4] border-b border-gray-200 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 bg-white rounded-md text-xs text-gray-500 font-medium border border-gray-100">
                    meshflow.io/dashboard
                  </div>
                </div>
              </div>

              {/* App Preview */}
              <div className="p-6 bg-[#FAFAF8]">
                <div className="grid grid-cols-3 gap-4">
                  {/* Availability Grid Preview - Using actual component */}
                  <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <AvailabilityGrid
                      value={DEMO_AVAILABILITY}
                      readOnly={true}
                      compact={true}
                    />
                  </div>

                  {/* Online Now Preview */}
                  <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Zap className="w-5 h-5 text-green-500" />
                      <span className="font-semibold text-gray-900">Available Now</span>
                    </div>
                    <div className="space-y-3">
                      {[
                        { initials: "SK", name: "Sarah K.", role: "Design Lead", available: true },
                        { initials: "MR", name: "Mike R.", role: "Engineer", available: true },
                        { initials: "AT", name: "Alex T.", role: "Product", available: false },
                      ].map((person, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-semibold">
                            {person.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{person.name}</div>
                            <div className="text-xs text-gray-400">{person.role}</div>
                          </div>
                          <div className={`w-2.5 h-2.5 rounded-full ${person.available ? "bg-green-500" : "bg-gray-300"}`} />
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="text-xs text-gray-400 mb-2">Looking to help</div>
                      <div className="flex -space-x-2">
                        {["JD", "KL", "NP"].map((initials, i) => (
                          <div key={i} className="w-7 h-7 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-[10px] font-semibold border-2 border-white">
                            {initials}
                          </div>
                        ))}
                        <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] font-semibold border-2 border-white">
                          +2
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <span className="text-sm font-semibold text-violet-600 uppercase tracking-wider">The Problem</span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-6">
                Coordination is killing your team's productivity
              </h2>
              <p className="text-xl text-gray-500">
                Distributed teams waste hours every week just trying to find time to meet.
                There's a better way.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <Image
                src="/images/online-group-meeting.png"
                alt="Team struggling with coordination"
                width={400}
                height={300}
                className="object-contain"
              />
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MessageSquare,
                title: "Endless back-and-forth",
                description: "\"When works for you?\" messages ping-ponging across Slack, email, and DMs.",
              },
              {
                icon: Globe,
                title: "Time zone chaos",
                description: "Distributed teams struggle to find overlapping hours across different locations.",
              },
              {
                icon: Search,
                title: "Who knows what?",
                description: "Someone on your team has the answer, but who? And are they even available?",
              },
            ].map((problem, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#F8F7F4] rounded-2xl p-8"
              >
                <div className="w-12 h-12 rounded-xl bg-red-100 text-red-500 flex items-center justify-center mb-5">
                  <problem.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{problem.title}</h3>
                <p className="text-gray-500">{problem.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution / Features Section */}
      <section id="features" className="py-24 px-6 bg-[#F8F7F4]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex justify-center order-2 md:order-1"
            >
              <Image
                src="/images/teamwork-gears.png"
                alt="Team working together"
                width={350}
                height={350}
                className="object-contain"
              />
            </motion.div>
            <div className="order-1 md:order-2">
              <span className="text-sm font-semibold text-violet-600 uppercase tracking-wider">The Solution</span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-6">
                One glance. Full visibility.
              </h2>
              <p className="text-xl text-gray-500">
                Meshflow gives your entire team real-time visibility into who's available,
                when they're free, and what they can help with.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Calendar,
                title: "Visual availability grid",
                description: "See your entire team's availability at a glance. No more asking around — just look.",
                color: "violet",
              },
              {
                icon: Zap,
                title: "Real-time status",
                description: "Know who's online and ready to help right now. Toggle your availability with one click.",
                color: "green",
              },
              {
                icon: Users,
                title: "Smart skill matching",
                description: "Find teammates who can help with specific topics. Expertise tagging makes it easy.",
                color: "blue",
              },
              {
                icon: Timer,
                title: "Timezone-aware",
                description: "Automatic timezone detection and conversion. Stop doing mental math.",
                color: "amber",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                  feature.color === "violet" ? "bg-violet-100 text-violet-600" :
                  feature.color === "green" ? "bg-green-100 text-green-600" :
                  feature.color === "blue" ? "bg-blue-100 text-blue-600" :
                  "bg-amber-100 text-amber-600"
                }`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <span className="text-sm font-semibold text-violet-600 uppercase tracking-wider">How It Works</span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-6">
                Up and running in 2 minutes
              </h2>
              <p className="text-xl text-gray-500">
                No complex setup. No calendar permissions required. Just instant team visibility.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <Image
                src="/images/remote-working.png"
                alt="Remote collaboration"
                width={400}
                height={300}
                className="object-contain"
              />
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create your pod",
                description: "Set up a workspace for your team in seconds. Invite members with a simple code.",
              },
              {
                step: "02",
                title: "Set your availability",
                description: "Mark when you're typically free. Update your real-time status with one click.",
              },
              {
                step: "03",
                title: "Start coordinating",
                description: "See who's available, find the right expert, and connect without the chaos.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-6xl font-bold text-violet-100 mb-4">{item.step}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-violet-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to end coordination chaos?
          </h2>
          <p className="text-xl text-violet-100 mb-10">
            Start free, no credit card required. Your team will thank you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button className="h-14 px-8 text-base font-semibold bg-white text-violet-600 hover:bg-violet-50 rounded-xl shadow-lg gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="h-14 px-8 text-base font-semibold rounded-xl bg-transparent border-white/30 text-white hover:bg-white/10">
                Log in to your team
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-violet-200">
            Free forever for small teams • No credit card required • Setup in 2 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-[#F8F7F4] border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-0.5">
              <span className="font-bold text-xl text-violet-600">Mesh</span>
              <span className="font-bold text-xl text-gray-900">flow</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-500">
              <Link href="#" className="hover:text-gray-900 transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-gray-900 transition-colors">Terms</Link>
              <Link href="#" className="hover:text-gray-900 transition-colors">Contact</Link>
            </div>
            <div className="text-sm text-gray-400">
              © 2025 Meshflow. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
