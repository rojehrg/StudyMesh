'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Settings, ArrowRightMd } from "react-coolicons";
import { CheckCircle, XCircle, Slack, Calendar, MessageSquare, Users, Clock, Zap, ArrowRight, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerContainer, StaggerItem, HoverScale, PageTransition } from '@/components/motion-wrappers';

// Animated counter for stats
function AnimatedCounter({ value, duration = 1 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setCount(0);
      return;
    }
    const steps = Math.min(value, 30);
    const stepDuration = (duration * 1000) / steps;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <>{count}</>;
}

// Sample request suggestions for first-time users
const SAMPLE_REQUESTS = [
  {
    category: "Technical Help",
    examples: [
      "Who knows how to debug memory leaks in Node.js?",
      "Need help setting up CI/CD pipelines",
      "Looking for someone familiar with GraphQL schema design",
    ],
  },
  {
    category: "Process Questions",
    examples: [
      "Who handles expense report approvals?",
      "Need guidance on the quarterly planning process",
      "Looking for help navigating vendor contracts",
    ],
  },
  {
    category: "Cross-Team Collaboration",
    examples: [
      "Who's the go-to person for marketing analytics?",
      "Need an intro to someone on the legal team",
      "Looking for design feedback on a new feature",
    ],
  },
];

interface DashboardClientProps {
  firstName?: string;
  isSlackConnected: boolean;
  isCalendarConnected: boolean;
  hasExpertise: boolean;
  nudgesSent: number;
  nudgesReceived: number;
  activeLocksCount: number;
  completedLocksCount: number;
  activationScore: number;
  isFullySetup: boolean;
  isFirstTimeUser: boolean;
  hasNoActivity: boolean;
  slackHandle?: string;
}

export function DashboardClient({
  firstName,
  isSlackConnected,
  isCalendarConnected,
  hasExpertise,
  nudgesSent,
  nudgesReceived,
  activeLocksCount,
  completedLocksCount,
  activationScore,
  isFullySetup,
  isFirstTimeUser,
  hasNoActivity,
  slackHandle,
}: DashboardClientProps) {
  return (
    <PageTransition>
      <div className="max-w-xl mx-auto space-y-6 py-8">
        {/* Welcome Header */}
        <FadeIn>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-coffee-espresso tracking-tight text-balance">
              {isFirstTimeUser && isSlackConnected ? "Ready to get started" : isFullySetup ? "You're all set" : "Welcome"}{firstName ? `, ${firstName}` : ''}!
            </h1>
            <p className="text-coffee-cortado mt-2">
              {isFullySetup ? (
                <>Use <code className="bg-coffee-foam/60 px-2 py-0.5 rounded text-sm font-mono text-coffee-mocha">/attunly</code> in Slack to ask for help</>
              ) : (
                "Complete your setup to start using Attunly."
              )}
            </p>
          </div>
        </FadeIn>

        {/* Activation Progress - Show for partially set up users */}
        {isSlackConnected && activationScore < 100 && (
          <FadeIn delay={0.1}>
            <div className="bg-coffee-cream/30 rounded-xl border border-coffee-foam p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-coffee-espresso">Getting started</h3>
                <span className="text-xs text-coffee-cortado">{activationScore}% complete</span>
              </div>
              <div className="h-1.5 bg-coffee-foam rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-coffee-espresso rounded-full transition-all duration-500"
                  style={{ width: `${activationScore}%` }}
                />
              </div>
              <div className="space-y-2">
                {!hasExpertise && (
                  <Link href="/settings" className="flex items-center gap-3 p-2 rounded-lg hover:bg-coffee-foam/50 transition-colors group">
                    <div className="w-6 h-6 rounded-full border-2 border-dashed border-coffee-oat flex items-center justify-center">
                      <Target className="w-3 h-3 text-coffee-oat" />
                    </div>
                    <span className="text-sm text-coffee-cortado group-hover:text-coffee-espresso flex-1">Describe your expertise so others can find you</span>
                    <ArrowRight className="w-4 h-4 text-coffee-latte group-hover:text-coffee-cortado" />
                  </Link>
                )}
                {!isCalendarConnected && (
                  <Link href="/settings" className="flex items-center gap-3 p-2 rounded-lg hover:bg-coffee-foam/50 transition-colors group">
                    <div className="w-6 h-6 rounded-full border-2 border-dashed border-coffee-oat flex items-center justify-center">
                      <Calendar className="w-3 h-3 text-coffee-oat" />
                    </div>
                    <span className="text-sm text-coffee-cortado group-hover:text-coffee-espresso flex-1">Connect your calendar to show availability</span>
                    <ArrowRight className="w-4 h-4 text-coffee-latte group-hover:text-coffee-cortado" />
                  </Link>
                )}
                {nudgesSent === 0 && (
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-coffee-foam/30">
                    <div className="w-6 h-6 rounded-full border-2 border-dashed border-coffee-oat flex items-center justify-center">
                      <Zap className="w-3 h-3 text-coffee-oat" />
                    </div>
                    <span className="text-sm text-coffee-cortado flex-1">Send your first request using <code className="bg-coffee-foam/80 px-1 py-0.5 rounded text-xs font-mono">/attunly</code></span>
                  </div>
                )}
              </div>
            </div>
          </FadeIn>
        )}

        {/* Connection Status Cards */}
        <StaggerContainer className="grid gap-4" staggerDelay={0.08}>
          {/* Slack Connection */}
          <StaggerItem>
            <HoverScale scale={1.01}>
              <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
                isSlackConnected ? "border-coffee-foam" : "border-coffee-oat"
              }`}>
                <div className="p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-lg bg-[#4A154B]/10 flex items-center justify-center shrink-0">
                    <Slack className="w-5 h-5 text-[#4A154B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-coffee-espresso">Slack</h3>
                      {isSlackConnected ? (
                        <CheckCircle className="w-4 h-4 text-coffee-mocha" />
                      ) : (
                        <XCircle className="w-4 h-4 text-coffee-oat" />
                      )}
                    </div>
                    <p className="text-sm text-coffee-cortado">
                      {isSlackConnected
                        ? `Connected as @${slackHandle || 'user'}`
                        : "Required for /attunly command"
                      }
                    </p>
                  </div>
                  {!isSlackConnected && (
                    <Button asChild size="sm" className="bg-[#4A154B] hover:bg-[#3a1039] text-white">
                      <Link href="/settings">
                        Connect
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </HoverScale>
          </StaggerItem>

          {/* Calendar Connection */}
          <StaggerItem>
            <HoverScale scale={1.01}>
              <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
                isCalendarConnected ? "border-coffee-foam" : "border-coffee-foam/50"
              }`}>
                <div className="p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-lg bg-coffee-cream flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-coffee-mocha" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-coffee-espresso">Calendar</h3>
                      {isCalendarConnected ? (
                        <CheckCircle className="w-4 h-4 text-coffee-mocha" />
                      ) : (
                        <span className="text-xs text-coffee-latte">Optional</span>
                      )}
                    </div>
                    <p className="text-sm text-coffee-cortado">
                      {isCalendarConnected
                        ? "Syncing your availability"
                        : "Sync to show when you're free"
                      }
                    </p>
                  </div>
                  {!isCalendarConnected && (
                    <Button asChild size="sm" variant="outline">
                      <Link href="/settings">
                        Connect
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </HoverScale>
          </StaggerItem>
        </StaggerContainer>

        {/* Active Momentum Locks - Quick Access */}
        {isFullySetup && activeLocksCount > 0 && (
          <FadeIn delay={0.2}>
            <HoverScale scale={1.01}>
              <Link href="/requests" className="block group">
                <div className="bg-coffee-cream/40 rounded-xl border border-coffee-foam p-5 hover:border-coffee-steamed hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-coffee-foam flex items-center justify-center">
                        <Clock className="w-5 h-5 text-coffee-mocha" />
                      </div>
                      <div>
                        <h3 className="font-medium text-coffee-espresso">
                          {activeLocksCount} active request{activeLocksCount !== 1 ? 's' : ''}
                        </h3>
                        <p className="text-sm text-coffee-cortado">View status and timeline</p>
                      </div>
                    </div>
                    <ArrowRightMd className="w-4 h-4 text-coffee-steamed group-hover:text-coffee-cortado transition-colors" />
                  </div>
                </div>
              </Link>
            </HoverScale>
          </FadeIn>
        )}

        {/* Activity Stats - For established users */}
        {isFullySetup && !hasNoActivity && (
          <FadeIn delay={0.25}>
            <div className="bg-white rounded-xl border border-coffee-foam shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-coffee-mocha">This week</h3>
                <Link href="/requests" className="text-xs text-coffee-cortado hover:text-coffee-espresso transition-colors">
                  View all activity
                </Link>
              </div>
              <StaggerContainer className="grid grid-cols-3 gap-4" staggerDelay={0.08}>
                <StaggerItem>
                  <div className="flex flex-col items-center p-3 bg-coffee-cream/30 rounded-lg">
                    <p className="text-2xl font-semibold text-coffee-espresso">
                      <AnimatedCounter value={nudgesSent} />
                    </p>
                    <p className="text-xs text-coffee-cortado text-center">asks sent</p>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div className="flex flex-col items-center p-3 bg-coffee-cream/30 rounded-lg">
                    <p className="text-2xl font-semibold text-coffee-espresso">
                      <AnimatedCounter value={nudgesReceived} />
                    </p>
                    <p className="text-xs text-coffee-cortado text-center">people helped</p>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div className="flex flex-col items-center p-3 bg-coffee-cream/30 rounded-lg">
                    <p className="text-2xl font-semibold text-coffee-espresso">
                      <AnimatedCounter value={completedLocksCount} />
                    </p>
                    <p className="text-xs text-coffee-cortado text-center">completed</p>
                  </div>
                </StaggerItem>
              </StaggerContainer>
            </div>
          </FadeIn>
        )}

        {/* First-Time User: Sample Request Suggestions */}
        {isFullySetup && isFirstTimeUser && (
          <FadeIn delay={0.3}>
            <div className="bg-white rounded-xl border border-coffee-foam shadow-sm overflow-hidden">
              <div className="p-5 pb-4">
                <h3 className="text-sm font-medium text-coffee-mocha mb-1">Try asking for help</h3>
                <p className="text-xs text-coffee-cortado">Copy one of these to Slack and type <code className="bg-coffee-foam/80 px-1 py-0.5 rounded font-mono">/attunly</code></p>
              </div>
              <div className="border-t border-coffee-foam/50">
                {SAMPLE_REQUESTS.map((category, idx) => (
                  <div key={category.category} className={idx > 0 ? "border-t border-coffee-foam/50" : ""}>
                    <div className="px-5 py-2 bg-coffee-cream/20">
                      <span className="text-xs font-medium text-coffee-mocha">{category.category}</span>
                    </div>
                    <div className="divide-y divide-coffee-foam/30">
                      {category.examples.map((example) => (
                        <div key={example} className="px-5 py-3 hover:bg-coffee-cream/20 transition-colors cursor-pointer group">
                          <p className="text-sm text-coffee-cortado group-hover:text-coffee-espresso">{example}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        )}

        {/* How it works - Only show if not fully set up */}
        {!isFullySetup && (
          <FadeIn delay={0.15}>
            <div className="bg-coffee-cream/40 rounded-xl border border-coffee-foam/50 p-5">
              <h3 className="text-sm font-medium text-coffee-mocha mb-4">How to use Attunly</h3>
              <div className="space-y-3 text-sm text-coffee-cortado">
                <div className="flex gap-3 items-start">
                  <span className="w-5 h-5 rounded-full bg-coffee-foam text-coffee-mocha flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">1</span>
                  <p>Type <code className="bg-coffee-foam/80 px-1.5 py-0.5 rounded text-xs font-mono text-coffee-mocha">/attunly</code> followed by what you need help with</p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="w-5 h-5 rounded-full bg-coffee-foam text-coffee-mocha flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">2</span>
                  <p>Review the AI-generated message and pick who to ask</p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="w-5 h-5 rounded-full bg-coffee-foam text-coffee-mocha flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">3</span>
                  <p>Click send - they'll get a low-pressure DM</p>
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Quick Actions */}
        <StaggerContainer className="grid gap-3" staggerDelay={0.06}>
          {/* Request History Link */}
          {isFullySetup && (
            <StaggerItem>
              <HoverScale scale={1.01}>
                <Link href="/requests" className="block group">
                  <div className="bg-white rounded-xl border border-coffee-foam/50 p-4 hover:border-coffee-steamed hover:shadow-sm transition-all flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-coffee-cream/60 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-coffee-mocha" />
                      </div>
                      <div>
                        <h3 className="font-medium text-coffee-espresso text-sm">Request History</h3>
                        <p className="text-xs text-coffee-latte">View all your requests and their status</p>
                      </div>
                    </div>
                    <ArrowRightMd className="w-4 h-4 text-coffee-steamed group-hover:text-coffee-cortado transition-colors" />
                  </div>
                </Link>
              </HoverScale>
            </StaggerItem>
          )}

          {/* Settings Link */}
          <StaggerItem>
            <HoverScale scale={1.01}>
              <Link href="/settings" className="block group">
                <div className="bg-white rounded-xl border border-coffee-foam/50 p-4 hover:border-coffee-steamed hover:shadow-sm transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-coffee-cream/60 rounded-lg flex items-center justify-center">
                      <Settings className="w-4 h-4 text-coffee-mocha" />
                    </div>
                    <div>
                      <h3 className="font-medium text-coffee-espresso text-sm">Settings</h3>
                      <p className="text-xs text-coffee-latte">Manage your profile and integrations</p>
                    </div>
                  </div>
                  <ArrowRightMd className="w-4 h-4 text-coffee-steamed group-hover:text-coffee-cortado transition-colors" />
                </div>
              </Link>
            </HoverScale>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </PageTransition>
  );
}
