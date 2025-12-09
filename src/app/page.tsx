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

// Catppuccin Latte colors (hardcoded for light-only landing page)
const latte = {
  rosewater: '#dc8a78',
  flamingo: '#dd7878',
  pink: '#ea76cb',
  mauve: '#8839ef',
  red: '#d20f39',
  maroon: '#e64553',
  peach: '#fe640b',
  yellow: '#df8e1d',
  green: '#40a02b',
  teal: '#179299',
  sky: '#04a5e5',
  sapphire: '#209fb5',
  blue: '#1e66f5',
  lavender: '#7287fd',
  text: '#4c4f69',
  subtext1: '#5c5f77',
  subtext0: '#6c6f85',
  overlay2: '#7c7f93',
  overlay1: '#8c8fa1',
  overlay0: '#9ca0b0',
  surface2: '#acb0be',
  surface1: '#bcc0cc',
  surface0: '#ccd0da',
  base: '#eff1f5',
  mantle: '#e6e9ef',
  crust: '#dce0e8',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden" style={{ backgroundColor: latte.base }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b" style={{ backgroundColor: `${latte.base}ee`, borderColor: `${latte.surface0}80` }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center">
              <span style={{ color: latte.mauve }} className="font-semibold text-xl">M</span>
              <span style={{ color: latte.pink }} className="font-semibold text-xl">e</span>
              <span style={{ color: latte.peach }} className="font-semibold text-xl">s</span>
              <span style={{ color: latte.yellow }} className="font-semibold text-xl">h</span>
              <span style={{ color: latte.text }} className="font-semibold text-xl">flow</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium transition-colors" style={{ color: latte.subtext0 }}>
                PRODUCT
              </Link>
              <Link href="#how-it-works" className="text-sm font-medium transition-colors" style={{ color: latte.subtext0 }}>
                HOW IT WORKS
              </Link>
              <Link href="#" className="text-sm font-medium transition-colors" style={{ color: latte.subtext0 }}>
                CONTACT
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/signup">
              <Button className="font-medium px-5 rounded-full text-white" style={{ backgroundColor: latte.mauve }}>
                Get Meshflow
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="font-medium px-5 rounded-full shadow-sm" style={{ backgroundColor: 'white', color: latte.text, borderColor: latte.surface1 }}>
                Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Left aligned with graphic on right */}
      <section className="pt-32 pb-20 px-6 relative min-h-[90vh] flex items-center">
        {/* Colorful wave graphic - Catppuccin Latte palette */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none hidden lg:block">
          <svg viewBox="0 0 600 800" className="h-full w-full" preserveAspectRatio="xMinYMin slice">
            {/* Lavender */}
            <path
              d="M300,0 Q450,200 350,400 T400,800 L600,800 L600,0 Z"
              fill={latte.lavender}
              opacity="0.8"
            />
            {/* Pink */}
            <path
              d="M350,0 Q500,250 400,450 T450,800 L600,800 L600,0 Z"
              fill={latte.pink}
              opacity="0.7"
            />
            {/* Mauve */}
            <path
              d="M400,0 Q550,200 450,400 T500,800 L600,800 L600,0 Z"
              fill={latte.mauve}
              opacity="0.8"
            />
          </svg>
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
              <span className="inline-block px-4 py-2 rounded-full text-sm font-medium shadow-sm" style={{ backgroundColor: latte.surface0, color: latte.subtext0 }}>
                Your Team's Knowledge Hub
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeIn}
              className="text-5xl md:text-6xl font-bold mb-2 leading-[1.1]"
              style={{ color: latte.text }}
            >
              Find Expertise.
            </motion.h1>
            <motion.h1
              variants={fadeIn}
              className="text-5xl md:text-6xl font-bold mb-8 leading-[1.1]"
              style={{ color: latte.mauve }}
            >
              Share Knowledge.
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={fadeIn}
              className="text-xl mb-10 leading-relaxed max-w-lg"
              style={{ color: latte.subtext0 }}
            >
              Connect teammates who can help each other grow—whether you're
              onboarding new hires or building a high-performing team. Meshflow
              surfaces hidden skills across your organization.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeIn} className="flex flex-wrap gap-4">
              <Link href="/signup">
                <Button size="lg" className="rounded-full px-8 h-12 text-base font-medium text-white" style={{ backgroundColor: latte.mauve }}>
                  Get Started Free
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base font-medium shadow-sm" style={{ backgroundColor: 'white', color: latte.text, borderColor: latte.surface1 }}>
                  For Teams
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="features" className="py-24 px-6" style={{ backgroundColor: latte.mantle }}>
        <div className="max-w-5xl mx-auto">
          {/* Section Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6"
          >
            <span className="inline-block px-4 py-2 rounded-full text-sm font-medium shadow-sm" style={{ backgroundColor: `${latte.green}20`, color: latte.green }}>
              Use Cases
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: latte.text }}>
              Choose Your Path
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: latte.subtext0 }}>
              From skill discovery to team collaboration, Meshflow helps you
              connect and grow—whether you're an individual or a team.
            </p>
          </motion.div>

          {/* Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl p-8 shadow-md hover:shadow-lg transition-shadow text-center border"
              style={{ backgroundColor: 'white', borderColor: `${latte.surface0}80` }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-6" style={{ backgroundColor: `${latte.yellow}20`, color: latte.yellow, border: `1px solid ${latte.yellow}30` }}>
                Skill Matching
              </span>
              <h3 className="text-2xl font-bold mb-4" style={{ color: latte.text }}>
                Find Your Perfect Match
              </h3>
              <p className="leading-relaxed" style={{ color: latte.subtext0 }}>
                List your expertise and growth areas. Get matched with teammates
                who complement your skills—learn from experts, mentor others,
                and grow together.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl p-8 shadow-md hover:shadow-lg transition-shadow text-center border"
              style={{ backgroundColor: 'white', borderColor: `${latte.surface0}80` }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-6" style={{ backgroundColor: `${latte.mauve}20`, color: latte.mauve, border: `1px solid ${latte.mauve}30` }}>
                Team Collaboration
              </span>
              <h3 className="text-2xl font-bold mb-4" style={{ color: latte.mauve }}>
                Connect Across Teams
              </h3>
              <p className="leading-relaxed" style={{ color: latte.subtext0 }}>
                Create pods for projects or departments. Send nudges to connect
                instantly. Break down silos and unlock your organization's
                collective knowledge.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6" style={{ backgroundColor: latte.base }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6"
          >
            <span className="inline-block px-4 py-2 rounded-full text-sm font-medium shadow-sm" style={{ backgroundColor: `${latte.pink}20`, color: latte.pink }}>
              Features
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: latte.text }}>
              Everything You Need
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: latte.subtext0 }}>
              Simple tools that make knowledge sharing feel natural.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Target,
                title: "Smart Matching",
                description: "AI-powered skill matching connects the right people.",
                color: latte.pink,
              },
              {
                icon: MessageCircle,
                title: "Quick Nudges",
                description: "Send requests to connect in one click.",
                color: latte.green,
              },
              {
                icon: Users,
                title: "Team Pods",
                description: "Organize by project, team, or initiative.",
                color: latte.mauve,
              },
              {
                icon: Sparkles,
                title: "Help Status",
                description: "Toggle when you're available to mentor.",
                color: latte.blue,
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow border"
                style={{ backgroundColor: latte.mantle, borderColor: `${latte.surface0}80` }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${feature.color}20` }}>
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: latte.text }}>{feature.title}</h3>
                <p className="text-sm" style={{ color: latte.subtext0 }}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${latte.lavender}15, ${latte.pink}10, ${latte.mauve}15)` }} />
        {/* Dot Pattern */}
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `radial-gradient(${latte.mauve}20 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />

        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6"
          >
            <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: `${latte.lavender}20`, color: latte.lavender, border: `1px solid ${latte.lavender}30` }}>
              How It Works
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: latte.text }}>
              Get Started in Minutes
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: latte.subtext0 }}>
              Three simple steps to unlock your team's potential.
            </p>
          </motion.div>

          <div className="space-y-8">
            {[
              {
                step: "01",
                title: "Add Your Skills",
                description: "List what you're good at and what you want to learn. It only takes 2 minutes to set up your profile.",
                color: latte.pink,
                icon: Target,
              },
              {
                step: "02",
                title: "Discover Matches",
                description: "Meshflow automatically finds teammates who can help you grow—and those you can mentor.",
                color: latte.mauve,
                icon: Users,
              },
              {
                step: "03",
                title: "Start Connecting",
                description: "Send a nudge, start a conversation, share knowledge. Watch your team thrive together.",
                color: latte.green,
                icon: MessageCircle,
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                whileHover={{ scale: 1.02, x: 8 }}
                className="flex gap-6 items-center p-6 rounded-2xl backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border"
                style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderColor: `${latte.surface0}80` }}
              >
                {/* Step Number with Icon */}
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 relative" style={{ background: `linear-gradient(135deg, ${item.color}, ${item.color}aa)` }}>
                  <item.icon className="w-8 h-8 text-white" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-md border" style={{ backgroundColor: 'white', color: latte.text, borderColor: latte.surface1 }}>
                    {item.step}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold mb-2" style={{ color: item.color }}>{item.title}</h3>
                  <p className="text-base md:text-lg leading-relaxed" style={{ color: latte.subtext0 }}>{item.description}</p>
                </div>

                {/* Arrow indicator */}
                <ArrowRight className="w-6 h-6 shrink-0 hidden md:block" style={{ color: `${item.color}80` }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6" style={{ backgroundColor: latte.base }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: latte.text }}>
            Ready to unlock your team's potential?
          </h2>
          <p className="text-xl mb-10 max-w-xl mx-auto" style={{ color: latte.subtext0 }}>
            Join teams using Meshflow to build stronger, more connected organizations.
          </p>
          <Link href="/signup">
            <Button size="lg" className="rounded-full px-10 h-14 text-lg font-medium text-white" style={{ backgroundColor: latte.mauve }}>
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm mt-6" style={{ color: latte.subtext0 }}>No credit card required</p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6" style={{ backgroundColor: latte.crust }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              <span style={{ color: latte.mauve }}>M</span>
              <span style={{ color: latte.pink }}>e</span>
              <span style={{ color: latte.peach }}>s</span>
              <span style={{ color: latte.yellow }}>h</span>
              <span style={{ color: latte.text }}>flow</span>
            </span>
            <span className="text-sm" style={{ color: latte.subtext0 }}>© 2025</span>
          </div>
          <div className="flex gap-8 text-sm">
            <Link href="/login" className="transition-colors hover:opacity-80" style={{ color: latte.subtext0 }}>
              Login
            </Link>
            <Link href="/signup" className="transition-colors hover:opacity-80" style={{ color: latte.subtext0 }}>
              Get Started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
