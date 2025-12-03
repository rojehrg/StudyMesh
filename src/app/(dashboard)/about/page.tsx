"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Users, Target, Zap, Shield, TrendingUp, Network, Brain } from "lucide-react";

export default function AboutPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 max-w-5xl mx-auto"
    >
      <div className="text-center space-y-4 py-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-teal-50 px-4 py-2 rounded-full border border-teal-200"
        >
          <Sparkles className="w-5 h-5 text-teal-600" />
          <span className="text-teal-700 font-medium text-sm">About Meshflow</span>
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          The Intelligent Enablement Platform
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Built for high-performing teams that know knowledge flow is the key to outperformance
        </p>
      </div>

      <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 shadow-lg hover-lift">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            Our Mission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-800 leading-relaxed text-lg">
            Meshflow helps teams <strong className="text-teal-700">outperform by filling knowledge gaps</strong>. The best teams aren't just skilled—they're connected. When expertise flows freely between teammates, blockers disappear, delivery accelerates, and everyone grows.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="hover-lift h-full bg-white shadow-md border-2 border-gray-100">
            <CardHeader>
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-3">
                <Target className="w-6 h-6 text-rose-600" />
              </div>
              <CardTitle className="text-xl">The Problem</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Teams struggle with knowledge silos. Someone has the answer, but no one knows who to ask. Projects stall. Frustration builds. Potential goes unrealized.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="hover-lift h-full bg-teal-50 shadow-md border-2 border-teal-200">
            <CardHeader>
              <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center mb-3">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Our Solution</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                Meshflow uses intelligent matching to connect knowledge holders with knowledge seekers. You list what you know and what you want to learn—we handle the rest.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card className="shadow-lg border-2 border-gray-100">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Network className="w-6 h-6 text-teal-600" />
            How We're Different
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex items-start gap-4 p-4 rounded-xl bg-teal-50/50 border border-teal-100"
          >
            <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center shrink-0">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1 text-lg">Intelligent Matching</h3>
              <p className="text-gray-700">
                Our smart algorithm understands context and skill variations. Matches are based on complementary expertise, not rigid categories.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-start gap-4 p-4 rounded-xl bg-cyan-50/50 border border-cyan-100"
          >
            <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1 text-lg">Org-Scoped Privacy</h3>
              <p className="text-gray-700">
                Your data stays within your organization. No external sharing, no public profiles. Complete security and privacy.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex items-start gap-4 p-4 rounded-xl bg-teal-50/50 border border-teal-100"
          >
            <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1 text-lg">Performance-Driven</h3>
              <p className="text-gray-700">
                Built from real-world experience: teams that consistently fill knowledge gaps outperform those that don't. Simple as that.
              </p>
            </div>
          </motion.div>
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-dashed">
        <CardHeader>
          <CardTitle>Built for B2B Teams</CardTitle>
          <CardDescription>From enterprise orgs to specialized teams</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 leading-relaxed">
            Whether you're a large organization with multiple departments or a smaller team with diverse specializations—Meshflow helps you stay connected, unblocked, and moving fast.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

