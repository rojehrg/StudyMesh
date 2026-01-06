"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRightMd } from "react-coolicons";
import {
  Sparkles,
  Users,
  Clock,
  Calendar,
  MessageSquare,
  Target,
  Zap,
  Check,
  Search,
  ArrowRight,
  Star,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

// Product UI Mockup Component - realistic product preview
function ProductMockup() {
  const teammates = [
    { name: "Sarah Chen", role: "Frontend Engineer", status: "available", avatar: "SC", match: 94, skills: ["React", "TypeScript"], color: "bg-violet-600" },
    { name: "Marcus Johnson", role: "Backend Lead", status: "focus", avatar: "MJ", match: 87, skills: ["Node.js", "APIs"], color: "bg-violet-500" },
    { name: "Alex Kim", role: "Senior Designer", status: "available", avatar: "AK", match: 82, skills: ["Figma", "CSS"], color: "bg-violet-400" },
  ];

  return (
    <div className="relative">
      {/* Glow effect behind */}
      <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-violet-500/20 rounded-3xl blur-2xl" />

      {/* Main container */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200/80 overflow-hidden">
        {/* Browser chrome */}
        <div className="bg-gray-100 border-b border-gray-200 px-4 py-2.5 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-white rounded-md px-4 py-1 text-xs text-gray-500 border border-gray-200 flex items-center gap-2">
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              attunly.com/ai-match
            </div>
          </div>
        </div>

        {/* App content */}
        <div className="p-5">
          {/* Search input */}
          <div className="relative mb-5">
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 shadow-sm">
              <Search className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <span className="text-gray-800 text-sm">Need help with React performance optimization</span>
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="inline-block w-0.5 h-4 bg-violet-500 ml-0.5 align-middle"
                />
              </div>
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 shadow-sm">
                <img src="/ai-search.svg" alt="" className="w-3.5 h-3.5 brightness-0 invert" />
                AI Match
              </div>
            </div>
          </div>

          {/* Results header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">Best matches</span>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">3 available</span>
            </div>
            <span className="text-xs text-gray-400">Sorted by relevance</span>
          </div>

          {/* Results list */}
          <div className="space-y-2.5">
            {teammates.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.12 }}
                className={`group flex items-center gap-4 p-3.5 rounded-xl border transition-all cursor-pointer ${
                  t.status === "available"
                    ? "bg-gradient-to-r from-violet-50/80 to-purple-50/50 border-violet-200/80 hover:border-violet-300 hover:shadow-md"
                    : "bg-gray-50/80 border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Avatar */}
                <div className={`relative w-11 h-11 rounded-full ${t.color} flex items-center justify-center text-white font-semibold text-sm shadow-sm`}>
                  {t.avatar}
                  {t.status === "available" && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 text-sm truncate">{t.name}</p>
                    <span className="text-xs font-medium text-violet-600 bg-violet-100 px-1.5 py-0.5 rounded">
                      {t.match}% match
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{t.role}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {t.skills.map((skill, j) => (
                      <span key={j} className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status & Action */}
                <div className="flex flex-col items-end gap-2">
                  {t.status === "available" ? (
                    <>
                      <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Available now
                      </span>
                      <button className="text-xs text-violet-600 bg-violet-100 hover:bg-violet-200 px-3 py-1 rounded-lg font-medium transition-colors opacity-0 group-hover:opacity-100">
                        Connect
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        In focus mode
                      </span>
                      <span className="text-xs text-gray-400">Free in 45m</span>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// FAQ Accordion Component
function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How does AI matching actually work?",
      answer: "Just type what you need in plain English—\"I need help with our payment API\" or \"Looking for someone who understands React performance.\" Our AI analyzes your request, understands the context, and matches you with teammates based on their skills, expertise, and current availability. No tagging or complex searches required.",
    },
    {
      question: "Who is Attunly for?",
      answer: "Attunly is built for product and engineering teams of 10-500 people where finding the right person to help is getting harder. If your team has ever spent time figuring out \"who knows about X?\" or hesitated to reach out because you weren't sure if someone was available, Attunly is for you.",
    },
    {
      question: "Is there a free plan?",
      answer: "Yes! Attunly is free for teams up to 10 people with full features. For larger teams, we offer a 14-day free trial. No credit card required to get started.",
    },
    {
      question: "How does it integrate with tools we already use?",
      answer: "Attunly connects with Slack for status and messaging, Google Calendar for availability, and Zoom for meetings. Setup takes about 2 minutes—just connect your accounts and your team is ready to go. We're adding more integrations based on customer feedback.",
    },
    {
      question: "What about privacy and data security?",
      answer: "We take data security seriously. Attunly only accesses the minimum information needed (availability status, basic profile info). We never read message content or calendar event details. All data is encrypted in transit and at rest, and we're SOC 2 compliant.",
    },
    {
      question: "Do I need to set up profiles for everyone?",
      answer: "No manual setup required. When teammates connect their accounts, Attunly automatically learns about their expertise from their work patterns and interactions. The more your team uses it, the smarter the matching becomes.",
    },
  ];

  return (
    <div className="divide-y divide-gray-200 border-t border-gray-200">
      {faqs.map((faq, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.05 }}
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full py-5 flex items-center justify-between text-left group"
          >
            <span className="text-base font-medium text-gray-900 group-hover:text-violet-600 transition-colors">
              {faq.question}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                openIndex === index ? "rotate-180" : ""
              }`}
            />
          </button>
          <motion.div
            initial={false}
            animate={{
              height: openIndex === index ? "auto" : 0,
              opacity: openIndex === index ? 1 : 0,
            }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-gray-500 leading-relaxed">
              {faq.answer}
            </p>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased overflow-x-hidden">
      {/* Navigation - Linear/Vercel style */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/icon.png" alt="Attunly" className="w-6 h-6" />
            <span className="font-semibold text-lg">
              <span className="text-gray-900">Attun</span>
              <span className="text-violet-600">ly</span>
            </span>
          </Link>

          {/* Center Nav - Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <Link href="/support" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Support
            </Link>
          </div>

          {/* Right CTAs */}
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-sm text-gray-600 hover:text-gray-900">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="text-sm bg-violet-600 text-white hover:bg-violet-700 rounded-lg px-4">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 bg-gradient-to-b from-violet-50/30 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Copy */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.h1
                variants={fadeIn}
                className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6 leading-tight"
              >
                Know who to reach out to
                <br />
                <span className="text-violet-600">and when it actually makes sense.</span>
              </motion.h1>

              <motion.p
                variants={fadeIn}
                className="text-xl text-gray-500 mb-8 leading-relaxed"
              >
                Attunly helps teams understand who's available, who's relevant, and when to connect—without scheduling friction.
              </motion.p>

              {/* CTA */}
              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-start gap-4 mb-8">
                <Link href="/signup">
                  <Button className="h-12 px-8 text-base font-semibold bg-violet-600 text-white hover:bg-violet-700 rounded-xl shadow-lg shadow-violet-500/20 gap-2">
                    Get Early Access
                    <ArrowRightMd className="w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>

              {/* Metrics & Trust */}
              <motion.div variants={fadeIn} className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
                <span className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4 text-violet-500" />
                  <span><strong className="text-gray-900">5+ hours</strong> saved weekly</span>
                </span>
                <span className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4 text-violet-500" />
                  <span><strong className="text-gray-900">100+</strong> teams onboard</span>
                </span>
                <span className="flex items-center gap-2 text-gray-600">
                  <Check className="w-4 h-4 text-green-500" />
                  Free to start
                </span>
              </motion.div>
            </motion.div>

            {/* Right - Product Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hidden lg:block"
            >
              <ProductMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof Strip - Linear/Vercel style */}
      <section className="py-12 px-6 border-y border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-500 mb-6 uppercase tracking-wider font-medium">Integrates with tools you already use</p>
          <div className="flex items-center justify-center gap-12">
            <img src="/slack-icon.svg" alt="Slack" width={40} height={40} className="w-10 h-10 hover:scale-125 transition-transform duration-200 cursor-pointer" />
            <img src="/google-calendar-icon.svg" alt="Google Calendar" width={40} height={40} className="w-10 h-10 hover:scale-125 transition-transform duration-200 cursor-pointer" />
            <img src="/zoom-icon.svg" alt="Zoom" width={40} height={40} className="w-10 h-10 hover:scale-125 transition-transform duration-200 cursor-pointer" />
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Coordination is broken.
            </h2>
            <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto">
              Calendars show availability. Chat shows who's online. Neither tells you if reaching out is actually a good idea.
            </p>
          </motion.div>

          {/* Before/After Visual */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-gray-200 bg-gray-50">
                <CardContent className="p-6">
                  <div className="text-gray-400 text-sm font-medium mb-4">Without Attunly</div>
                  <div className="space-y-3 text-left">
                    {[
                      "Check calendar... seems free?",
                      "Scan Slack status... unclear",
                      "Hesitate to interrupt",
                      "Message anyway, hope for best",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-gray-500 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-violet-200 bg-violet-50/50">
                <CardContent className="p-6">
                  <div className="text-violet-600 text-sm font-medium mb-4">With Attunly</div>
                  <div className="space-y-3 text-left">
                    {[
                      "Type what you need help with",
                      "AI finds the right person",
                      "See who's actually available",
                      "Connect with confidence",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-gray-700 text-sm">
                        <Check className="w-4 h-4 text-violet-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works - 3 Steps */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-500">
              From question to connection in seconds.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                icon: MessageSquare,
                title: "Describe what you need",
                desc: "Type in plain English. \"Need help with React performance\" or \"Looking for someone who knows our payment API.\"",
              },
              {
                step: "2",
                icon: () => <img src="/ai-search.svg" alt="" className="w-10 h-10" />,
                title: "AI Match finds the right person",
                desc: "Our AI understands context, expertise, and availability to surface the right teammates instantly.",
              },
              {
                step: "3",
                icon: Users,
                title: "Connect with clarity",
                desc: "See who's available right now, respect focus time, and reach out with confidence.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gray-200">
                    <ArrowRight className="absolute -right-1 -top-2 w-4 h-4 text-gray-300" />
                  </div>
                )}

                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center relative">
                    <item.icon className="w-10 h-10 text-violet-600" />
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-violet-600 text-white text-sm font-bold flex items-center justify-center">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Moment - Emotional Hook */}
      <section className="py-24 px-6 bg-violet-600 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4 text-xl text-violet-100 mb-10"
          >
            {[
              "You need quick input, not a meeting.",
              "You're not sure who's free right now.",
              "You don't want to bug the wrong person.",
            ].map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                {line}
              </motion.p>
            ))}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold"
          >
            Attunly is built for that exact moment.
          </motion.h2>
        </div>
      </section>

      {/* Differentiation */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-gray-500 mb-4">Most tools focus on time.</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Attunly focuses on <span className="text-violet-600">decisions</span>.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Calendar, title: "Calendars", desc: "Optimize schedules", muted: true },
              { icon: MessageSquare, title: "Chat", desc: "Optimize communication", muted: true },
              { icon: Target, title: "Attunly", desc: "Optimize decisions", muted: false },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`h-full transition-all ${
                  item.muted
                    ? 'border-gray-200 bg-gray-50'
                    : 'border-violet-300 bg-violet-600 shadow-lg shadow-violet-500/20'
                }`}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                      item.muted ? 'bg-gray-200' : 'bg-white/20'
                    }`}>
                      <item.icon className={`w-6 h-6 ${item.muted ? 'text-gray-400' : 'text-white'}`} />
                    </div>
                    <h3 className={`font-semibold mb-1 ${item.muted ? 'text-gray-600' : 'text-white'}`}>
                      {item.title}
                    </h3>
                    <p className={`text-sm ${item.muted ? 'text-gray-400' : 'text-violet-100'}`}>
                      {item.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: () => <img src="/ai-search.svg" alt="" className="w-5 h-5" />, title: "AI Match", desc: "Describe what you need in plain English" },
              { icon: Users, title: "Team Availability", desc: "See who's free right now, not in 3 days" },
              { icon: Clock, title: "Focus Time Respect", desc: "Know when not to interrupt" },
              { icon: Zap, title: "Instant Connection", desc: "From question to conversation in seconds" },
              { icon: Check, title: "No Setup Required", desc: "Works alongside your existing tools" },
              { icon: Target, title: "Context-Aware", desc: "Understands expertise and availability" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-4 p-4"
              >
                <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Frequently asked questions
            </h2>
          </motion.div>

          <FAQAccordion />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-violet-600">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Less hesitation. More momentum.
            </h2>
            <p className="text-xl text-violet-100 mb-10">
              Join teams who connect with clarity.
            </p>
            <Link href="/signup">
              <Button className="h-14 px-10 text-lg font-semibold bg-white text-violet-600 hover:bg-violet-50 rounded-xl shadow-2xl shadow-violet-900/30 gap-2">
                Get Early Access
                <ArrowRightMd className="w-5 h-5" />
              </Button>
            </Link>
            <p className="mt-6 text-violet-200 text-sm">
              Free for small teams. No credit card required.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <img src="/icon.png" alt="Attunly" className="w-6 h-6" />
              <span className="font-bold text-lg">
                <span className="text-gray-900">Attun</span>
                <span className="text-violet-600">ly</span>
              </span>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-500">
              <Link href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
              <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms</Link>
              <Link href="mailto:support@attunly.com" className="hover:text-gray-900 transition-colors">Contact</Link>
            </div>
            <div className="text-sm text-gray-400">
              © 2025 Attunly
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
