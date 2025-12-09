"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, MessageCircle, Target, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

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

// Clean 5-color palette
const colors = {
  midnight: '#1E293B',
  sand: '#E5D3B3',
  coral: '#FB7185',
  cream: '#FFF7ED',
  espresso: '#3F2E1E',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden" style={{ backgroundColor: colors.cream }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b" style={{ backgroundColor: `${colors.cream}ee`, borderColor: `${colors.sand}` }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center">
              <span style={{ color: colors.midnight }} className="font-semibold text-xl">Mesh</span>
              <span style={{ color: colors.coral }} className="font-semibold text-xl">flow</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium transition-colors hover:opacity-70" style={{ color: colors.espresso }}>
                PRODUCT
              </Link>
              <Link href="#how-it-works" className="text-sm font-medium transition-colors hover:opacity-70" style={{ color: colors.espresso }}>
                HOW IT WORKS
              </Link>
              <Link href="#" className="text-sm font-medium transition-colors hover:opacity-70" style={{ color: colors.espresso }}>
                CONTACT
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/signup">
              <Button className="font-medium px-5 rounded-full text-white" style={{ backgroundColor: colors.midnight }}>
                Get Meshflow
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="font-medium px-5 rounded-full shadow-sm" style={{ backgroundColor: 'white', color: colors.espresso, borderColor: colors.sand }}>
                Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative min-h-[90vh] flex items-center">
        {/* Decorative shapes */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none hidden lg:block overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full opacity-20" style={{ backgroundColor: colors.coral }} />
          <div className="absolute top-40 right-40 w-96 h-96 rounded-full opacity-10" style={{ backgroundColor: colors.midnight }} />
          <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full opacity-30" style={{ backgroundColor: colors.sand }} />
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
              <span className="inline-block px-4 py-2 rounded-full text-sm font-medium shadow-sm" style={{ backgroundColor: colors.sand, color: colors.espresso }}>
                Your Team's Knowledge Hub
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeIn}
              className="text-5xl md:text-6xl font-bold mb-2 leading-[1.1]"
              style={{ color: colors.midnight }}
            >
              Find Expertise.
            </motion.h1>
            <motion.h1
              variants={fadeIn}
              className="text-5xl md:text-6xl font-bold mb-8 leading-[1.1]"
              style={{ color: colors.coral }}
            >
              Share Knowledge.
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={fadeIn}
              className="text-xl mb-10 leading-relaxed max-w-lg"
              style={{ color: colors.espresso }}
            >
              Connect teammates who can help each other grow—whether you're
              onboarding new hires or building a high-performing team. Meshflow
              surfaces hidden skills across your organization.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeIn} className="flex flex-wrap gap-4">
              <Link href="/signup">
                <Button size="lg" className="rounded-full px-8 h-12 text-base font-medium text-white" style={{ backgroundColor: colors.midnight }}>
                  Get Started Free
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base font-medium shadow-sm" style={{ backgroundColor: 'white', color: colors.espresso, borderColor: colors.sand }}>
                  For Teams
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="features" className="py-24 px-6" style={{ backgroundColor: colors.sand }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 rounded-full text-sm font-medium shadow-sm mb-6" style={{ backgroundColor: colors.cream, color: colors.espresso }}>
              Use Cases
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: colors.midnight }}>
              Choose Your Path
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.espresso }}>
              From skill discovery to team collaboration, Meshflow helps you
              connect and grow—whether you're an individual or a team.
            </p>
          </motion.div>

          {/* Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl p-8 shadow-md hover:shadow-lg transition-shadow text-center"
              style={{ backgroundColor: 'white' }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-6" style={{ backgroundColor: `${colors.coral}20`, color: colors.coral }}>
                Skill Matching
              </span>
              <h3 className="text-2xl font-bold mb-4" style={{ color: colors.midnight }}>
                Find Your Perfect Match
              </h3>
              <p className="leading-relaxed" style={{ color: colors.espresso }}>
                List your expertise and growth areas. Get matched with teammates
                who complement your skills—learn from experts, mentor others,
                and grow together.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl p-8 shadow-md hover:shadow-lg transition-shadow text-center"
              style={{ backgroundColor: 'white' }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-6" style={{ backgroundColor: `${colors.midnight}15`, color: colors.midnight }}>
                Team Collaboration
              </span>
              <h3 className="text-2xl font-bold mb-4" style={{ color: colors.coral }}>
                Connect Across Teams
              </h3>
              <p className="leading-relaxed" style={{ color: colors.espresso }}>
                Create pods for projects or departments. Send nudges to connect
                instantly. Break down silos and unlock your organization's
                collective knowledge.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6" style={{ backgroundColor: colors.cream }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 rounded-full text-sm font-medium shadow-sm mb-6" style={{ backgroundColor: `${colors.coral}20`, color: colors.coral }}>
              Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: colors.midnight }}>
              Everything You Need
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: colors.espresso }}>
              Simple tools that make knowledge sharing feel natural.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Target, title: "Smart Matching", description: "AI-powered skill matching connects the right people." },
              { icon: MessageCircle, title: "Quick Nudges", description: "Send requests to connect in one click." },
              { icon: Users, title: "Team Pods", description: "Organize by project, team, or initiative." },
              { icon: Sparkles, title: "Help Status", description: "Toggle when you're available to mentor." },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow"
                style={{ backgroundColor: 'white' }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: colors.sand }}>
                  <feature.icon className="w-6 h-6" style={{ color: colors.midnight }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: colors.midnight }}>{feature.title}</h3>
                <p className="text-sm" style={{ color: colors.espresso }}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6" style={{ backgroundColor: colors.midnight }}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-6" style={{ backgroundColor: `${colors.coral}30`, color: colors.coral }}>
              How It Works
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Get Started in Minutes
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: colors.sand }}>
              Three simple steps to unlock your team's potential.
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              { step: "01", title: "Add Your Skills", description: "List what you're good at and what you want to learn. It only takes 2 minutes.", icon: Target },
              { step: "02", title: "Discover Matches", description: "Meshflow finds teammates who can help you grow—and those you can mentor.", icon: Users },
              { step: "03", title: "Start Connecting", description: "Send a nudge, start a conversation, share knowledge. Watch your team thrive.", icon: MessageCircle },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="flex gap-6 items-center p-6 rounded-2xl"
                style={{ backgroundColor: `${colors.cream}10` }}
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: colors.coral }}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-bold" style={{ color: colors.coral }}>{item.step}</span>
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  </div>
                  <p style={{ color: colors.sand }}>{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6" style={{ backgroundColor: colors.cream }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: colors.midnight }}>
            Ready to unlock your team's potential?
          </h2>
          <p className="text-xl mb-10 max-w-xl mx-auto" style={{ color: colors.espresso }}>
            Join teams using Meshflow to build stronger, more connected organizations.
          </p>
          <Link href="/signup">
            <Button size="lg" className="rounded-full px-10 h-14 text-lg font-medium text-white" style={{ backgroundColor: colors.coral }}>
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm mt-6" style={{ color: colors.espresso }}>No credit card required</p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6" style={{ backgroundColor: colors.midnight }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Mesh</span>
            <span className="font-semibold" style={{ color: colors.coral }}>flow</span>
            <span className="text-sm ml-2" style={{ color: colors.sand }}>© 2025</span>
          </div>
          <div className="flex gap-8 text-sm">
            <Link href="/login" className="transition-colors hover:opacity-80" style={{ color: colors.sand }}>
              Login
            </Link>
            <Link href="/signup" className="transition-colors hover:opacity-80" style={{ color: colors.sand }}>
              Get Started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
