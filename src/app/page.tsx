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
  Globe,
  Code,
  Rocket,
  Check,
  HelpCircle,
  Quote,
} from "lucide-react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import startupMeetingAnimation from "../../public/animations/startup-meeting.json";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -4, transition: { duration: 0.2 } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased overflow-x-hidden">
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

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100/50">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="font-medium bg-violet-600 text-white hover:bg-violet-700 rounded-lg px-4">
                Get Early Access
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Split Layout */}
      <section className="pt-28 pb-16 px-6 bg-gradient-to-b from-violet-50/50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Copy */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              {/* Badge */}
              <motion.div variants={fadeIn} className="mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-violet-100 text-violet-700 border border-violet-200">
                  <Sparkles className="w-4 h-4" />
                  AI-Powered Coordination
                </span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                variants={fadeIn}
                className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6 leading-tight"
              >
                Know who to reach out to
                <br />
                <span className="text-violet-600">and when it actually makes sense.</span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                variants={fadeIn}
                className="text-xl text-gray-500 mb-4 leading-relaxed"
              >
                Attunly helps teams understand who's available, who's relevant, and when to connect—without scheduling friction or awkward back and forth.
              </motion.p>

              {/* Supporting line */}
              <motion.p
                variants={fadeIn}
                className="text-sm text-gray-400 mb-8"
              >
                Built for modern teams that want clarity before they hit send.
              </motion.p>

              {/* CTA */}
              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-start gap-4">
                <Link href="/signup">
                  <Button className="h-12 px-8 text-base font-semibold bg-violet-600 text-white hover:bg-violet-700 rounded-xl shadow-lg shadow-violet-500/20 gap-2">
                    Get Early Access
                    <ArrowRightMd className="w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>

              {/* Trust signals */}
              <motion.div variants={fadeIn} className="mt-8 flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Free for small teams
                </span>
                <span className="flex items-center gap-2">
                  <img src="/slack-icon.svg" alt="Slack" className="w-4 h-4" />
                  Works with Slack
                </span>
                <span className="flex items-center gap-2">
                  <img src="/google-calendar-icon.svg" alt="Google Calendar" className="w-4 h-4" />
                  Google Calendar
                </span>
              </motion.div>
            </motion.div>

            {/* Right - Lottie Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-100 to-violet-50 rounded-3xl blur-3xl opacity-50" />
                <Lottie
                  animationData={startupMeetingAnimation}
                  loop
                  className="relative w-full max-w-lg mx-auto"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Work has a coordination problem most tools ignore.
            </h2>
          </motion.div>

          {/* Problem Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              {
                icon: Calendar,
                title: "Calendars",
                desc: "Tell you when someone is free",
                color: "text-blue-500",
                bg: "bg-blue-50",
              },
              {
                icon: MessageSquare,
                title: "Chat tools",
                desc: "Show who's online",
                color: "text-green-500",
                bg: "bg-green-50",
              },
              {
                icon: HelpCircle,
                title: "Neither",
                desc: "Tells you if reaching out is a good idea",
                color: "text-amber-500",
                bg: "bg-amber-50",
                highlighted: true,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`h-full ${item.highlighted ? 'border-amber-200 bg-amber-50/50' : 'border-gray-200'}`}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-500 text-sm">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4"
          >
            <p className="text-lg text-gray-500">
              So people hesitate. They overthink. They wait. Or they interrupt the wrong person.
            </p>
            <p className="text-xl font-medium text-gray-900">
              That moment adds more friction than meetings ever will.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Moment Section */}
      <section className="py-20 px-6 bg-violet-600 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white" />
          <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-white" />
          <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-white" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <Quote className="w-12 h-12 mx-auto text-violet-300 mb-6" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-3 text-xl text-violet-100 mb-10"
          >
            {[
              "You need quick input, not a meeting.",
              "You're not sure who's free right now.",
              "You don't want to bug the wrong person.",
              "You pause before sending the message.",
            ].map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
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

      {/* What Attunly Does */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Attunly adds context to availability.
            </h2>
            <p className="text-xl text-gray-500">
              It helps teams understand:
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: "Who can help with what",
                desc: "See expertise across your team",
                color: "text-violet-600",
                bg: "bg-violet-100",
              },
              {
                icon: Clock,
                title: "Who's actually available",
                desc: "Right now, not three days from now",
                color: "text-green-600",
                bg: "bg-green-100",
              },
              {
                icon: Zap,
                title: "When reaching out makes sense",
                desc: "Timing that respects focus time",
                color: "text-amber-600",
                bg: "bg-amber-100",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="rest"
                whileHover="hover"
                variants={cardHover}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full border-gray-200 hover:border-violet-200 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                        <item.icon className={`w-7 h-7 ${item.color}`} />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 text-lg">{item.title}</h3>
                      <p className="text-gray-500">{item.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-xl text-gray-600 text-center"
          >
            So coordination feels natural instead of awkward.
          </motion.p>
        </div>
      </section>

      {/* AI Value Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-violet-100 text-violet-700 mb-6">
              <Sparkles className="w-4 h-4" />
              AI that removes guessing
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Attunly uses AI to remove the guessing teams do every day.
            </h2>
          </motion.div>

          {/* Glass Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="bg-white/80 backdrop-blur-xl border-violet-100 shadow-xl">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1 space-y-4 text-center md:text-left">
                    {[
                      "No more checking calendars.",
                      "No more scanning Slack statuses.",
                      "No more second-guessing if now is a bad time.",
                    ].map((line, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="text-lg text-gray-600 flex items-center gap-3 justify-center md:justify-start"
                      >
                        <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-green-600" />
                        </span>
                        <span className="line-through text-gray-400 decoration-violet-400 decoration-2">{line.replace("No more ", "")}</span>
                      </motion.p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 text-xl text-gray-900 text-center font-medium"
          >
            The AI works quietly in the background to surface the right people at the right moment.
          </motion.p>
        </div>
      </section>

      {/* Differentiation Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl text-gray-500 text-center mb-10"
          >
            Most tools focus on time.
          </motion.p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Calendar,
                title: "Calendars",
                desc: "Optimize schedules",
                highlighted: false,
              },
              {
                icon: MessageSquare,
                title: "Chat tools",
                desc: "Optimize communication",
                highlighted: false,
              },
              {
                icon: Target,
                title: "Attunly",
                desc: "Optimizes decisions",
                highlighted: true,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`h-full transition-all duration-300 ${
                  item.highlighted
                    ? 'border-violet-300 bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                      item.highlighted ? 'bg-white/20' : 'bg-gray-200'
                    }`}>
                      <item.icon className={`w-6 h-6 ${item.highlighted ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <h3 className={`font-semibold mb-2 ${item.highlighted ? 'text-white' : 'text-gray-700'}`}>
                      {item.title}
                    </h3>
                    <p className={`text-sm ${item.highlighted ? 'text-violet-100 font-medium' : 'text-gray-500'}`}>
                      {item.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 text-center max-w-2xl mx-auto"
          >
            It helps you decide who to reach out to and when—without adding more noise or process.
          </motion.p>
        </div>
      </section>

      {/* How It Fits */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Fits into how teams already work.
              </h2>

              <div className="space-y-4 mb-8">
                {[
                  "Works alongside your existing tools",
                  "No heavy setup",
                  "No new habits to learn",
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-lg text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>

              <p className="text-xl text-gray-900 font-medium mb-8">
                Just clearer coordination when it matters.
              </p>

              {/* Integration logos */}
              <div className="flex items-center gap-6">
                <span className="text-sm text-gray-500">Integrates with:</span>
                <div className="flex items-center gap-4">
                  <img src="/slack-icon.svg" alt="Slack" className="w-8 h-8 opacity-70 hover:opacity-100 transition-opacity" />
                  <img src="/google-calendar-icon.svg" alt="Google Calendar" className="w-8 h-8 opacity-70 hover:opacity-100 transition-opacity" />
                  <img src="/zoom-icon.svg" alt="Zoom" className="w-8 h-8 opacity-70 hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </motion.div>

            {/* Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="hidden lg:block"
            >
              <img
                src="/images/teamwork-gears.svg"
                alt="Team collaboration"
                className="w-full max-w-md mx-auto"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-4 mb-10">
            {[
              { icon: Code, label: "Product & engineering teams", color: "text-blue-600", bg: "bg-blue-50" },
              { icon: Rocket, label: "Founders & operators", color: "text-violet-600", bg: "bg-violet-50" },
              { icon: Globe, label: "Remote & async teams", color: "text-green-600", bg: "bg-green-50" },
              { icon: Clock, label: "Anyone tired of coordination overhead", color: "text-amber-600", bg: "bg-amber-50" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300">
                  <CardContent className="p-5 text-center">
                    <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <p className="text-gray-700 font-medium text-sm">{item.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-lg text-gray-600 text-center max-w-2xl mx-auto"
          >
            If your team lives in Slack and still struggles to coordinate, Attunly is for you.
          </motion.p>
        </div>
      </section>

      {/* Solo Founder Signal */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <Quote className="w-8 h-8 mx-auto text-gray-300 mb-4" />
            <p className="text-lg text-gray-600 mb-3 italic">
              Built by a solo founder who kept running into this problem himself.
            </p>
            <p className="text-sm text-gray-400">
              It started as a personal frustration and turned into a product focused on making work feel a little more human.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-violet-600 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white transform -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-2 text-xl text-violet-100 mb-8"
          >
            <p>Less hesitation.</p>
            <p>Less back and forth.</p>
            <p>More momentum.</p>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-white mb-10"
          >
            Attunly helps teams connect with clarity.
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link href="/signup">
              <Button className="h-14 px-10 text-lg font-semibold bg-white text-violet-600 hover:bg-violet-50 rounded-xl shadow-2xl shadow-violet-900/30 gap-2">
                Get Early Access
                <ArrowRightMd className="w-5 h-5" />
              </Button>
            </Link>
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
