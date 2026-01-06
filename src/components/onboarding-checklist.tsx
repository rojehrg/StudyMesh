"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Circle, ChevronDown, ChevronUp, Sparkles, ArrowRight, X, Trophy, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  done: boolean;
  href?: string;
  action?: string;
  priority?: number; // Lower = more important
}

interface OnboardingChecklistProps {
  items: ChecklistItem[];
  onDismiss?: () => void;
  className?: string;
}

const STORAGE_KEY = "onboarding-checklist-dismissed";
const CELEBRATION_KEY = "onboarding-celebration-shown";

export function OnboardingChecklist({ items, onDismiss, className }: OnboardingChecklistProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    setMounted(true);
    const wasDismissed = localStorage.getItem(STORAGE_KEY) === "true";
    setDismissed(wasDismissed);
  }, []);

  // Add "Account created" as first item (always done - Endowed Progress Effect)
  const allItems: ChecklistItem[] = [
    {
      id: "account",
      label: "Create your account",
      description: "You're in! Welcome to Attunly.",
      done: true,
      priority: 0,
    },
    ...items.map((item, idx) => ({ ...item, priority: item.priority ?? idx + 1 })),
  ];

  const completedCount = allItems.filter(item => item.done).length;
  const totalCount = allItems.length;
  const progress = Math.round((completedCount / totalCount) * 100);
  const allComplete = completedCount === totalCount;

  // Show celebration when all complete (only once)
  useEffect(() => {
    if (allComplete && mounted) {
      const celebrationShown = localStorage.getItem(CELEBRATION_KEY) === "true";
      if (!celebrationShown) {
        setShowCelebration(true);
        localStorage.setItem(CELEBRATION_KEY, "true");
        // Auto-hide celebration after 5 seconds
        const timer = setTimeout(() => setShowCelebration(false), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [allComplete, mounted]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    localStorage.setItem(STORAGE_KEY, "true");
    onDismiss?.();
  }, [onDismiss]);

  // Don't render until mounted (prevents hydration mismatch)
  if (!mounted) return null;

  // Show celebration screen when all complete
  if (allComplete && showCelebration) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn("relative", className)}
      >
        <Card className="border-success/30 bg-gradient-to-br from-success/10 to-primary/10 overflow-hidden">
          <CardContent className="py-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center"
            >
              <Trophy className="w-10 h-10 text-success" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-foreground mb-2">
                You're all set!
              </h3>
              <p className="text-muted-foreground mb-4">
                You've completed all the setup steps. Time to start collaborating!
              </p>
              <div className="flex justify-center gap-3">
                <Button asChild>
                  <Link href="/find-help">
                    AI Match
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => setShowCelebration(false)}>
                  Dismiss
                </Button>
              </div>
            </motion.div>
            {/* Confetti-like particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 1,
                    y: "50%",
                    x: `${50 + (Math.random() - 0.5) * 20}%`,
                    scale: 0
                  }}
                  animate={{
                    opacity: 0,
                    y: "-100%",
                    x: `${50 + (Math.random() - 0.5) * 100}%`,
                    scale: 1,
                    rotate: Math.random() * 360
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    delay: i * 0.1,
                    ease: "easeOut"
                  }}
                  className={cn(
                    "absolute w-3 h-3 rounded-full",
                    i % 3 === 0 ? "bg-success" : i % 3 === 1 ? "bg-primary" : "bg-accent"
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Don't show if dismissed or all complete (and celebration already shown)
  if (dismissed || allComplete) {
    return null;
  }

  // Find the next incomplete item
  const nextItem = allItems.find(item => !item.done);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn("relative", className)}
    >
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
        {/* Progress bar at top */}
        <div className="h-1 bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Get Started with MeshFlow</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {completedCount} of {totalCount} complete
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">{progress}%</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={handleDismiss}
                title="Dismiss checklist"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="pt-2 pb-4">
                <div className="space-y-2">
                  {allItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg transition-colors",
                        item.done
                          ? "bg-success/10"
                          : item.id === nextItem?.id
                          ? "bg-primary/10 border border-primary/30"
                          : "bg-muted/50"
                      )}
                    >
                      {/* Checkbox */}
                      <div className="pt-0.5">
                        {item.done ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 rounded-full bg-success flex items-center justify-center"
                          >
                            <Check className="w-3 h-3 text-success-foreground" />
                          </motion.div>
                        ) : (
                          <Circle className={cn(
                            "w-5 h-5",
                            item.id === nextItem?.id ? "text-primary" : "text-muted-foreground"
                          )} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-medium text-sm",
                          item.done ? "text-muted-foreground line-through" : "text-foreground"
                        )}>
                          {item.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.description}
                        </p>
                      </div>

                      {/* Action button */}
                      {!item.done && item.href && (
                        <Button
                          size="sm"
                          variant={item.id === nextItem?.id ? "default" : "outline"}
                          asChild
                          className="shrink-0"
                        >
                          <Link href={item.href}>
                            {item.action || "Do it"}
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Motivational message */}
                {completedCount >= 2 && completedCount < totalCount && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-sm text-muted-foreground mt-4 pt-4 border-t"
                  >
                    You're doing great! Just {totalCount - completedCount} more step{totalCount - completedCount !== 1 ? 's' : ''} to go.
                  </motion.p>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
