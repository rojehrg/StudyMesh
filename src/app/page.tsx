"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  UsersGroup,
  WifiHigh,
  Calendar,
  Globe,
  ChatCircle,
  Play,
  SearchMagnifyingGlass,
  Clock,
  Bell,
  Star,
  ChevronDown,
  ArrowRightMd,
} from "react-coolicons";
import { motion, AnimatePresence } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

// Static availability data for visual preview (GitHub-style grid)
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];

// Availability pattern for demo
const availabilityPattern: Record<number, number[]> = {
  0: [9, 10, 11, 14, 15],      // Mon
  1: [10, 11, 12, 13, 14],     // Tue
  2: [9, 10, 15, 16, 17],      // Wed
  3: [11, 12, 13, 14, 15, 16], // Thu
  4: [9, 10, 11],              // Fri
  5: [],                       // Sat
  6: [],                       // Sun
};

// Features for accordion
const features = [
  {
    id: "skills",
    title: "Expertise Directory",
    description: "Everyone tags what they know. When you need help with billing systems or React hooks, instantly see who has that expertise—across all teams.",
    icon: Star,
  },
  {
    id: "pods",
    title: "Cross-Team Pods",
    description: "Group people across departments, orgs, and timezones. Internal teams, external contractors, offshore partners—all in one view.",
    icon: UsersGroup,
  },
  {
    id: "availability",
    title: "Visual Availability Grid",
    description: "See when everyone's free at a glance. No more guessing who's online in which timezone. Find the 2-hour overlap that actually works.",
    icon: Calendar,
  },
  {
    id: "nudges",
    title: "Contextual Nudges",
    description: "\"Need 15 min on the payment API\" — ping the right person with context. They accept, you schedule. No Slack threads that go nowhere.",
    icon: Bell,
  },
  {
    id: "slack",
    title: "Native Slack Integration",
    description: "Nudges land in Slack DMs. Accept with one click, schedule instantly. No new app for your team to check—it meets them where they work.",
    icon: ChatCircle,
  },
  {
    id: "timezones",
    title: "Timezone Intelligence",
    description: "Automatic detection across your distributed team. See overlapping hours instantly. Stop doing timezone math in your head.",
    icon: Globe,
  },
];

export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState("skills");

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/icon.png" alt="Attunly" className="w-7 h-7" />
            <span className="font-bold text-xl">
              <span className="text-gray-900">Attun</span>
              <span className="text-violet-600">ly</span>
            </span>
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
      <section className="pt-28 pb-12 px-6">
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
                <UsersGroup className="w-4 h-4" />
                For teams spread across timezones and orgs
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={fadeIn}
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6"
            >
              Find the right person.
              <br />
              <span className="text-violet-600">Find the right time.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeIn}
              className="text-xl md:text-2xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Your team spans timezones, departments, and Slack channels. Attunly shows who has the expertise you need and when they're free—so you connect in minutes, not days.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Link href="/signup">
                <Button className="h-14 px-8 text-base font-semibold bg-violet-600 text-white hover:bg-violet-700 rounded-xl shadow-lg shadow-violet-500/20 gap-2">
                  Start Free — No Credit Card
                  <ArrowRightMd className="w-5 h-5" />
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
              Free forever for teams up to 10. Works with Slack. Setup takes 2 minutes.
            </motion.p>
          </motion.div>

          {/* App Preview - Static GitHub-style Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-12 max-w-5xl mx-auto"
          >
            <div className="rounded-2xl bg-white border border-gray-200 shadow-2xl shadow-gray-300/30 overflow-hidden">
              {/* Browser Chrome */}
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 bg-white rounded-md text-xs text-gray-500 font-medium border border-gray-100">
                    attunly.com/dashboard
                  </div>
                </div>
              </div>

              {/* App Preview Content */}
              <div className="p-6 bg-gray-50">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Availability Grid - GitHub Contribution Style */}
                  <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-md shadow-gray-200/50 border-l-4 border-l-violet-500">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-violet-600" />
                        <span className="font-semibold text-gray-900">Team Availability</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Eastern Time (ET)</span>
                      </div>
                    </div>

                    {/* GitHub-style Grid */}
                    <div className="space-y-1">
                      {/* Hour labels */}
                      <div className="flex items-center">
                        <div className="w-10 shrink-0" />
                        <div className="flex-1 flex justify-between px-1">
                          {[9, 11, 13, 15, 17].map((hour) => (
                            <span key={hour} className="text-[10px] text-gray-400 font-medium">
                              {hour > 12 ? `${hour - 12}pm` : hour === 12 ? "12pm" : `${hour}am`}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Day rows with cells */}
                      {DAYS.map((day, dayIndex) => (
                        <div key={day} className="flex items-center gap-1">
                          <div className="w-10 shrink-0 text-xs font-medium text-gray-500">{day}</div>
                          <div className="flex-1 flex gap-1">
                            {HOURS.map((hour) => {
                              const isAvailable = availabilityPattern[dayIndex]?.includes(hour);
                              return (
                                <div
                                  key={hour}
                                  className={`flex-1 h-7 rounded-md transition-colors ${
                                    isAvailable
                                      ? "bg-violet-500 hover:bg-violet-600"
                                      : "bg-gray-100 hover:bg-gray-200"
                                  }`}
                                />
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded bg-violet-500" /> Available
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded bg-gray-100 border border-gray-200" /> Busy
                        </span>
                      </div>
                      <span className="text-xs text-violet-600 font-medium">18 hrs/week</span>
                    </div>
                  </div>

                  {/* Right sidebar */}
                  <div className="space-y-4">
                    {/* Available Now */}
                    <div className="bg-white rounded-xl p-5 shadow-md shadow-gray-200/50 border-l-4 border-l-green-500">
                      <div className="flex items-center gap-2 mb-4">
                        <WifiHigh className="w-5 h-5 text-green-500" />
                        <span className="font-semibold text-gray-900">Available Now</span>
                      </div>
                      <div className="space-y-3">
                        {[
                          { initials: "SK", name: "Sarah K.", role: "Design", online: true },
                          { initials: "MR", name: "Mike R.", role: "Engineering", online: true },
                          { initials: "AT", name: "Alex T.", role: "Product", online: false },
                        ].map((person, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-semibold">
                                {person.initials}
                              </div>
                              {person.online && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900">{person.name}</div>
                              <div className="text-xs text-gray-400">{person.role}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white rounded-xl p-5 shadow-md shadow-gray-200/50 border-l-4 border-l-violet-400">
                      <div className="text-xs text-gray-400 mb-3">This week</div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Overlap hours</span>
                          <span className="text-sm font-semibold text-gray-900">12 hrs</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Best time</span>
                          <span className="text-sm font-semibold text-violet-600">Tue 2pm</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* GIF Placeholder - Future Demo Video */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-500 text-sm">
                <Play className="w-4 h-4" />
                <span>Demo video coming soon</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center mb-12">
            <div>
              <span className="text-sm font-semibold text-violet-600 uppercase tracking-wider">The Problem</span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-6">
                Coordination shouldn't be this hard
              </h2>
              <p className="text-xl text-gray-500">
                Teams span timezones. Knowledge is scattered. You waste hours finding who can help and when they're free. There's a better way.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <Image
                src="/images/online-group-meeting.svg"
                alt="Team coordination challenges"
                width={500}
                height={400}
                className="object-contain"
              />
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: "Timezone math is exhausting",
                description: "SF, London, Manila—finding a 30-minute overlap across three timezones shouldn't take longer than the meeting itself.",
              },
              {
                icon: SearchMagnifyingGlass,
                title: "Who even knows about this?",
                description: "Someone on your team has the answer. But who? Contractors come and go, teams change, and expertise gets buried.",
              },
              {
                icon: ChatCircle,
                title: "Endless back-and-forth",
                description: "\"When are you free?\" \"How about Tuesday?\" \"Can't, I'm in meetings.\" Three days later, you still haven't connected.",
              },
            ].map((problem, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-md shadow-gray-200/50 border-l-4 border-l-red-400"
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

      {/* Solution / Features Section - ACCORDION STYLE */}
      <section id="features" className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex justify-center order-2 md:order-1"
            >
              <Image
                src="/images/teamwork-gears.svg"
                alt="Team working together"
                width={400}
                height={400}
                className="object-contain"
              />
            </motion.div>
            <div className="order-1 md:order-2">
              <span className="text-sm font-semibold text-violet-600 uppercase tracking-wider">The Solution</span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-4">
                See who can help. See when they're free.
              </h2>
              <p className="text-xl text-gray-500">
                Attunly maps your team's expertise and availability in one place—so you find the right person and schedule time without the chaos.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Left: Accordion */}
            <div className="space-y-2">
              {features.map((feature) => (
                <motion.div
                  key={feature.id}
                  className={`rounded-xl border transition-all cursor-pointer ${
                    activeFeature === feature.id
                      ? "bg-white border-violet-200 shadow-lg shadow-violet-100/50"
                      : "bg-white/50 border-gray-200 hover:bg-white/80"
                  }`}
                  onClick={() => setActiveFeature(feature.id)}
                >
                  <div className="p-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activeFeature === feature.id
                          ? "bg-violet-600 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        <feature.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${
                          activeFeature === feature.id ? "text-gray-900" : "text-gray-600"
                        }`}>
                          {feature.title}
                        </h3>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                        activeFeature === feature.id ? "rotate-180" : ""
                      }`} />
                    </div>
                    <AnimatePresence>
                      {activeFeature === feature.id && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-gray-500 mt-3 pl-14"
                        >
                          {feature.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Right: Feature visual */}
            <div className="relative">
              <div className="sticky top-24">
                {/* Decorative blob */}
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-100/50 rounded-full blur-3xl" />

                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <AnimatePresence mode="wait">
                      {activeFeature === "skills" && (
                        <motion.div key="skills" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <Star className="w-12 h-12 text-violet-600 mb-4" />
                          <h4 className="text-xl font-bold text-gray-900 mb-2">Who knows what? Now you know.</h4>
                          <p className="text-gray-500 mb-4">Everyone tags their expertise. Search "payment API" or "Kubernetes" and find the right person instantly.</p>
                          <div className="flex justify-center py-4">
                            <Image
                              src="/images/skills-illustration.svg"
                              alt="Skills and expertise matching illustration"
                              width={300}
                              height={200}
                              className="object-contain"
                            />
                          </div>
                        </motion.div>
                      )}
                      {activeFeature === "pods" && (
                        <motion.div key="pods" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <UsersGroup className="w-12 h-12 text-violet-600 mb-4" />
                          <h4 className="text-xl font-bold text-gray-900 mb-2">One view across all teams</h4>
                          <p className="text-gray-500 mb-4">Internal, external, contractors—group everyone who needs to collaborate, regardless of org structure.</p>
                          <div className="flex justify-center py-4">
                            <Image
                              src="/images/pods-illustration.svg"
                              alt="Team collaboration illustration"
                              width={300}
                              height={200}
                              className="object-contain"
                            />
                          </div>
                        </motion.div>
                      )}
                      {activeFeature === "availability" && (
                        <motion.div key="availability" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <Calendar className="w-12 h-12 text-violet-600 mb-4" />
                          <h4 className="text-xl font-bold text-gray-900 mb-2">Find the overlap that works</h4>
                          <p className="text-gray-500 mb-4">Visual grid shows when everyone's free. No calendar permissions needed—just set your hours once.</p>
                          <div className="grid grid-cols-5 gap-1">
                            {[...Array(25)].map((_, i) => (
                              <div key={i} className={`h-8 rounded ${[0,1,5,6,10,11,15,20].includes(i) ? "bg-violet-500" : [2,7,12,16,21].includes(i) ? "bg-violet-300" : "bg-gray-100"}`} />
                            ))}
                          </div>
                        </motion.div>
                      )}
                      {activeFeature === "nudges" && (
                        <motion.div key="nudges" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <Bell className="w-12 h-12 text-violet-600 mb-4" />
                          <h4 className="text-xl font-bold text-gray-900 mb-2">Request help with context</h4>
                          <p className="text-gray-500 mb-4">No more vague Slack messages. Send a focused request, they accept, you're on a call in minutes.</p>
                          <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
                            <p className="text-sm font-medium text-gray-900">New nudge from Sarah</p>
                            <p className="text-sm text-gray-500 mt-1">"Quick question on the billing migration - 15 min?"</p>
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white text-xs">Accept</Button>
                              <Button size="sm" variant="outline" className="text-xs" style={{ color: '#4B5563', borderColor: '#D1D5DB', backgroundColor: 'white' }}>Later</Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      {activeFeature === "slack" && (
                        <motion.div key="slack" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <ChatCircle className="w-12 h-12 text-violet-600 mb-4" />
                          <h4 className="text-xl font-bold text-gray-900 mb-2">Lives in Slack, not another tab</h4>
                          <p className="text-gray-500 mb-4">Your team already lives in Slack. Nudges arrive as DMs. One click to accept, then schedule.</p>
                          <div className="flex justify-center py-4">
                            <Image
                              src="/images/slack-illustration.svg"
                              alt="Messaging and notifications illustration"
                              width={300}
                              height={200}
                              className="object-contain"
                            />
                          </div>
                        </motion.div>
                      )}
                      {activeFeature === "timezones" && (
                        <motion.div key="timezones" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <Globe className="w-12 h-12 text-violet-600 mb-4" />
                          <h4 className="text-xl font-bold text-gray-900 mb-2">Timezones, handled</h4>
                          <p className="text-gray-500 mb-4">Team in Manila? London? SF? See everyone's availability in your local time. Overlap found automatically.</p>
                          <div className="flex justify-center py-4">
                            <Image
                              src="/images/timezone-illustration.svg"
                              alt="Global timezone coordination illustration"
                              width={300}
                              height={200}
                              className="object-contain"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center mb-12">
            <div>
              <span className="text-sm font-semibold text-violet-600 uppercase tracking-wider">How It Works</span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-6">
                Set up in 2 minutes. Start connecting.
              </h2>
              <p className="text-xl text-gray-500">
                No calendar permissions. No complex integrations. Just add your team and start breaking down silos.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <Image
                src="/images/collaboration-colleagues.svg"
                alt="Remote collaboration"
                width={500}
                height={400}
                className="object-contain"
              />
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create a pod, invite your team",
                description: "Internal team, contractors, cross-functional partners—add everyone with a simple invite code.",
              },
              {
                step: "02",
                title: "Tag expertise & availability",
                description: "Everyone adds what they know. Set typical hours. Now the whole team is searchable.",
              },
              {
                step: "03",
                title: "Nudge, connect, collaborate",
                description: "Find the right expert, send a contextual request, schedule time—all in one flow.",
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
      <section className="py-16 px-6 bg-violet-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Stop wasting time coordinating. Start connecting.
          </h2>
          <p className="text-xl text-violet-100 mb-10">
            Find who has the expertise. See when they're available. Schedule in seconds. Your team will thank you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button className="h-14 px-8 text-base font-semibold bg-white text-violet-600 hover:bg-violet-50 rounded-xl shadow-lg gap-2">
                Get Started Free
                <ArrowRightMd className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="h-14 px-8 text-base font-semibold rounded-xl bg-transparent border-white/30 text-white hover:bg-white/10">
                Log in to your team
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-violet-200">
            Free for teams up to 10 • Works with Slack • Setup in 2 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <img src="/icon.png" alt="Attunly" className="w-6 h-6" />
              <span className="font-bold text-xl">
                <span className="text-gray-900">Attun</span>
                <span className="text-violet-600">ly</span>
              </span>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms</Link>
              <Link href="mailto:support@attunly.com" className="hover:text-gray-900 transition-colors">Contact</Link>
            </div>
            <div className="text-sm text-gray-400">
              © 2025 Attunly. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
