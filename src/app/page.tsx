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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ctp-base overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-ctp-base/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center">
              <span className="text-ctp-text font-semibold text-xl">Meshflow</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-ctp-subtext0 hover:text-ctp-text text-sm font-medium transition-colors">
                PRODUCT
              </Link>
              <Link href="#how-it-works" className="text-ctp-subtext0 hover:text-ctp-text text-sm font-medium transition-colors">
                HOW IT WORKS
              </Link>
              <Link href="#" className="text-ctp-subtext0 hover:text-ctp-text text-sm font-medium transition-colors">
                CONTACT
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/signup">
              <Button className="bg-ctp-peach hover:bg-peach-400 text-ctp-base font-medium px-5 rounded-full">
                Get Meshflow
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="font-medium px-5 rounded-full shadow-sm bg-ctp-surface0 text-ctp-text hover:bg-ctp-surface1 border-ctp-surface2">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Left aligned with graphic on right */}
      <section className="pt-32 pb-20 px-6 relative min-h-[90vh] flex items-center">
        {/* Colorful wave graphic - Catppuccin palette */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none hidden lg:block">
          <svg viewBox="0 0 600 800" className="h-full w-full" preserveAspectRatio="xMinYMin slice">
            {/* Lavender */}
            <path
              d="M300,0 Q450,200 350,400 T400,800 L600,800 L600,0 Z"
              fill="#b4befe"
              opacity="0.8"
            />
            {/* Peach */}
            <path
              d="M350,0 Q500,250 400,450 T450,800 L600,800 L600,0 Z"
              fill="#fab387"
              opacity="0.7"
            />
            {/* Mauve */}
            <path
              d="M400,0 Q550,200 450,400 T500,800 L600,800 L600,0 Z"
              fill="#cba6f7"
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
              <span className="inline-block bg-ctp-surface0 text-ctp-text px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                Your Team's Knowledge Hub
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeIn}
              className="text-5xl md:text-6xl font-bold text-ctp-text mb-2 leading-[1.1]"
            >
              Find Expertise.
            </motion.h1>
            <motion.h1
              variants={fadeIn}
              className="text-5xl md:text-6xl font-bold text-ctp-peach mb-8 leading-[1.1]"
            >
              Share Knowledge.
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={fadeIn}
              className="text-xl text-ctp-subtext1 mb-10 leading-relaxed max-w-lg"
            >
              Connect teammates who can help each other grow—whether you're
              onboarding new hires or building a high-performing team. Meshflow
              surfaces hidden skills across your organization.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeIn} className="flex flex-wrap gap-4">
              <Link href="/signup">
                <Button size="lg" className="bg-ctp-peach hover:bg-peach-400 text-ctp-base rounded-full px-8 h-12 text-base font-medium">
                  Get Started Free
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base font-medium text-ctp-text hover:bg-ctp-surface1 bg-ctp-surface0 shadow-sm border-ctp-surface2">
                  For Teams
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="features" className="py-24 px-6 bg-ctp-mantle">
        <div className="max-w-5xl mx-auto">
          {/* Section Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6"
          >
            <span className="inline-block bg-ctp-green/20 text-ctp-green px-4 py-2 rounded-full text-sm font-medium shadow-sm">
              Use Cases
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-ctp-text mb-4">
              Choose Your Path
            </h2>
            <p className="text-lg text-ctp-subtext0 max-w-2xl mx-auto">
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
              className="bg-ctp-surface0 rounded-3xl p-8 shadow-md hover:shadow-lg transition-shadow text-center"
            >
              <span className="inline-block bg-ctp-yellow/20 text-ctp-yellow px-3 py-1 rounded-full text-xs font-medium shadow-sm mb-6">
                Skill Matching
              </span>
              <h3 className="text-xl font-bold text-ctp-text mb-4">
                Find Your Perfect Match
              </h3>
              <p className="text-ctp-subtext0 leading-relaxed">
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
              className="bg-ctp-surface0 rounded-3xl p-8 shadow-md hover:shadow-lg transition-shadow text-center"
            >
              <span className="inline-block bg-ctp-mauve/20 text-ctp-mauve px-3 py-1 rounded-full text-xs font-medium shadow-sm mb-6">
                Team Collaboration
              </span>
              <h3 className="text-xl font-bold text-ctp-peach mb-4">
                Connect Across Teams
              </h3>
              <p className="text-ctp-subtext0 leading-relaxed">
                Create pods for projects or departments. Send nudges to connect
                instantly. Break down silos and unlock your organization's
                collective knowledge.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-ctp-base">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6"
          >
            <span className="inline-block bg-ctp-peach/20 text-ctp-peach px-4 py-2 rounded-full text-sm font-medium shadow-sm">
              Features
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-ctp-text mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-ctp-subtext0 max-w-xl mx-auto">
              Simple tools that make knowledge sharing feel natural.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Target,
                title: "Smart Matching",
                description: "AI-powered skill matching connects the right people.",
                color: "peach",
              },
              {
                icon: MessageCircle,
                title: "Quick Nudges",
                description: "Send requests to connect in one click.",
                color: "green",
              },
              {
                icon: Users,
                title: "Team Pods",
                description: "Organize by project, team, or initiative.",
                color: "mauve",
              },
              {
                icon: Sparkles,
                title: "Help Status",
                description: "Toggle when you're available to mentor.",
                color: "blue",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-ctp-surface0 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  feature.color === "peach" ? "bg-ctp-peach/20" :
                  feature.color === "green" ? "bg-ctp-green/20" :
                  feature.color === "mauve" ? "bg-ctp-mauve/20" : "bg-ctp-blue/20"
                }`}>
                  <feature.icon className={`w-6 h-6 ${
                    feature.color === "peach" ? "text-ctp-peach" :
                    feature.color === "green" ? "text-ctp-green" :
                    feature.color === "mauve" ? "text-ctp-mauve" : "text-ctp-blue"
                  }`} />
                </div>
                <h3 className="text-lg font-semibold text-ctp-text mb-2">{feature.title}</h3>
                <p className="text-ctp-subtext0 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-ctp-mantle">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6"
          >
            <span className="inline-block bg-ctp-lavender/20 text-ctp-lavender px-4 py-2 rounded-full text-sm font-medium shadow-sm">
              How It Works
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-ctp-text mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-lg text-ctp-subtext0 max-w-xl mx-auto">
              Three simple steps to unlock your team's potential.
            </p>
          </motion.div>

          <div className="space-y-12">
            {[
              {
                step: "01",
                title: "Add Your Skills",
                description: "List what you're good at and what you want to learn. It only takes 2 minutes to set up your profile.",
              },
              {
                step: "02",
                title: "Discover Matches",
                description: "Meshflow automatically finds teammates who can help you grow—and those you can mentor.",
              },
              {
                step: "03",
                title: "Start Connecting",
                description: "Send a nudge, start a conversation, share knowledge. Watch your team thrive together.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-8 items-start"
              >
                <div className="text-6xl font-bold text-ctp-surface2 shrink-0 w-24">
                  {item.step}
                </div>
                <div className="pt-3">
                  <h3 className="text-2xl font-bold text-ctp-text mb-3">{item.title}</h3>
                  <p className="text-ctp-subtext0 text-lg leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-ctp-base">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-ctp-text mb-6">
            Ready to unlock your team's potential?
          </h2>
          <p className="text-xl text-ctp-subtext0 mb-10 max-w-xl mx-auto">
            Join teams using Meshflow to build stronger, more connected organizations.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-ctp-peach hover:bg-peach-400 text-ctp-base rounded-full px-10 h-14 text-lg font-medium">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm text-ctp-overlay0 mt-6">No credit card required</p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-ctp-crust">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-ctp-text font-semibold">Meshflow</span>
            <span className="text-ctp-overlay0 text-sm">© 2025</span>
          </div>
          <div className="flex gap-8 text-sm">
            <Link href="/login" className="text-ctp-subtext0 hover:text-ctp-text transition-colors">
              Login
            </Link>
            <Link href="/signup" className="text-ctp-subtext0 hover:text-ctp-text transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
