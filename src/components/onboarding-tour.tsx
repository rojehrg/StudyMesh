"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Users,
  Settings,
  Bell,
  Sparkles,
  ArrowRight,
  X,
  CheckCircle2,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface TourStep {
  icon: any;
  title: string;
  description: string;
  tip?: string;
  customIcon?: string;
}

// Custom Slack icon component
function SlackIcon({ className }: { className?: string }) {
  return <img src="/slack-logo.png" alt="Slack" className={className} />;
}

const tourSteps: TourStep[] = [
  {
    icon: BookOpen,
    title: "Join or Create Pods",
    description: "Pods are groups where team members connect. Join an existing pod with a code, or create one for your project or initiative."
  },
  {
    icon: Settings,
    title: "Set Up Your Profile",
    description: "Add your expertise skills (what you're good at) and growth skills (what you want to learn). This helps us match you with the right teammates."
  },
  {
    icon: Users,
    title: "Find Your Working Circles",
    description: "Working Circles shows you teammates who can help you grow, and those you can mentor. The matching algorithm considers skills, availability, and more."
  },
  {
    icon: Bell,
    title: "Send & Receive Nudges",
    description: "Nudges are contextual requests to connect. Ask for help or offer your expertise. Recipients get notified instantly.",
    tip: "Check the bell icon in the header for nudges"
  },
  {
    icon: MessageSquare,
    title: "Connect Slack for Notifications",
    description: "Get nudges and meeting invites delivered directly to your Slack DMs. Never miss an opportunity to connect with teammates.",
    tip: "Go to Settings → Notifications to connect Slack",
    customIcon: "/slack-logo.png"
  },
  {
    icon: Sparkles,
    title: "Toggle 'Looking to Help'",
    description: "Enable this in the sidebar to signal you're available to help teammates. It boosts your visibility in Working Circles.",
    tip: "Active helpers appear higher in match results"
  }
];

export function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(true); // Start true to prevent flash
  const supabase = createClient();

  useEffect(() => {
    checkTourStatus();
  }, []);

  const checkTourStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check localStorage first for faster response
      const localKey = `attunly_tour_seen_${user.id}`;
      const localSeen = localStorage.getItem(localKey);

      if (localSeen === 'true') {
        setHasSeenTour(true);
        return;
      }

      // Check if profile exists and onboarding status
      // Use maybeSingle() to handle case where profile doesn't exist yet
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.warn("Could not fetch profile for tour status:", error.message);
        setHasSeenTour(true); // Don't show tour on error
        return;
      }

      // No profile yet - user needs to complete onboarding first
      if (!profile) {
        setHasSeenTour(true); // Don't show tour until they have a profile
        return;
      }

      if (profile) {
        // If onboarding_completed is explicitly set, respect it
        if (profile.onboarding_completed === true) {
          localStorage.setItem(localKey, 'true');
          setHasSeenTour(true);
          return;
        }

        // Show tour for users who haven't seen it
        if (profile.onboarding_completed === false || profile.onboarding_completed === null || profile.onboarding_completed === undefined) {
          setHasSeenTour(false);
          setIsOpen(true);
        }
      }
    } catch (error) {
      console.error("Error checking tour status:", error);
      setHasSeenTour(true); // Don't show on error
    }
  };

  const completeTour = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Save to localStorage for immediate future checks
      localStorage.setItem(`attunly_tour_seen_${user.id}`, 'true');

      // Save to database
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user.id);

    } catch (error) {
      console.error("Error saving tour completion:", error);
    }

    setIsOpen(false);
    setHasSeenTour(true);
  };

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    completeTour();
  };

  if (hasSeenTour && !isOpen) return null;

  const CurrentIcon = tourSteps[currentStep].icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={skipTour}
          />

          {/* Tour Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              {/* Header */}
              <div className="bg-primary/10 p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">Welcome to Attunly</span>
                  </div>
                  <button
                    onClick={skipTour}
                    className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {/* Progress dots */}
                <div className="flex gap-1.5 mt-3">
                  {tourSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === currentStep
                          ? 'bg-primary w-6'
                          : index < currentStep
                          ? 'bg-primary/50 w-3'
                          : 'bg-muted w-3'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="p-6"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    {tourSteps[currentStep].customIcon ? (
                      <img
                        src={tourSteps[currentStep].customIcon}
                        alt=""
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <CurrentIcon className="w-7 h-7 text-primary" />
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {tourSteps[currentStep].title}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {tourSteps[currentStep].description}
                  </p>

                  {tourSteps[currentStep].tip && (
                    <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg border border-border">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Pro tip:</span>{" "}
                        {tourSteps[currentStep].tip}
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Footer */}
              <div className="p-4 border-t border-border flex items-center justify-between">
                <button
                  onClick={skipTour}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip tour
                </button>

                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button variant="outline" size="sm" onClick={prevStep}>
                      Back
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={nextStep}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {currentStep === tourSteps.length - 1 ? (
                      "Get Started"
                    ) : (
                      <>
                        Next
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Manual trigger button for users who want to see the tour again
export function TourTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Sparkles className="w-4 h-4" />
        View Tour
      </Button>
    );
  }

  return <OnboardingTour />;
}
