"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Celebration } from "./celebration";

interface CelebrationOptions {
  message?: string;
  subMessage?: string;
  variant?: "confetti" | "success" | "sparkle";
}

interface CelebrationContextType {
  celebrate: (options?: CelebrationOptions) => void;
  celebrateFirstNudge: () => void;
  celebrateFirstMeeting: () => void;
  celebrateProfileComplete: () => void;
  celebrateFirstPod: () => void;
  celebrateMilestone: (milestone: string) => void;
}

const CelebrationContext = createContext<CelebrationContextType | null>(null);

export function useCelebration() {
  const context = useContext(CelebrationContext);
  if (!context) {
    throw new Error("useCelebration must be used within a CelebrationProvider");
  }
  return context;
}

// Milestone messages
const MILESTONES = {
  firstNudge: {
    message: "First Nudge Sent!",
    subMessage: "You're on your way to collaborating with your team",
    variant: "confetti" as const,
  },
  firstMeeting: {
    message: "Meeting Scheduled!",
    subMessage: "Great job setting up time with your teammate",
    variant: "success" as const,
  },
  profileComplete: {
    message: "Profile Complete!",
    subMessage: "Teammates can now find you more easily",
    variant: "sparkle" as const,
  },
  firstPod: {
    message: "Welcome to Your Pod!",
    subMessage: "You're now connected with your team",
    variant: "confetti" as const,
  },
  fiveNudges: {
    message: "5 Nudges Sent!",
    subMessage: "You're becoming a collaboration pro",
    variant: "sparkle" as const,
  },
  tenNudges: {
    message: "10 Nudges!",
    subMessage: "Your team is lucky to have you",
    variant: "confetti" as const,
  },
};

export function CelebrationProvider({ children }: { children: ReactNode }) {
  const [celebrationState, setCelebrationState] = useState<{
    show: boolean;
    message?: string;
    subMessage?: string;
    variant?: "confetti" | "success" | "sparkle";
  }>({ show: false });

  const celebrate = useCallback((options?: CelebrationOptions) => {
    setCelebrationState({
      show: true,
      message: options?.message || "Amazing!",
      subMessage: options?.subMessage,
      variant: options?.variant || "confetti",
    });
  }, []);

  const dismiss = useCallback(() => {
    setCelebrationState({ show: false });
  }, []);

  const celebrateFirstNudge = useCallback(() => {
    celebrate(MILESTONES.firstNudge);
  }, [celebrate]);

  const celebrateFirstMeeting = useCallback(() => {
    celebrate(MILESTONES.firstMeeting);
  }, [celebrate]);

  const celebrateProfileComplete = useCallback(() => {
    celebrate(MILESTONES.profileComplete);
  }, [celebrate]);

  const celebrateFirstPod = useCallback(() => {
    celebrate(MILESTONES.firstPod);
  }, [celebrate]);

  const celebrateMilestone = useCallback((milestone: string) => {
    const config = MILESTONES[milestone as keyof typeof MILESTONES];
    if (config) {
      celebrate(config);
    } else {
      celebrate({ message: milestone });
    }
  }, [celebrate]);

  return (
    <CelebrationContext.Provider
      value={{
        celebrate,
        celebrateFirstNudge,
        celebrateFirstMeeting,
        celebrateProfileComplete,
        celebrateFirstPod,
        celebrateMilestone,
      }}
    >
      {children}
      <Celebration
        show={celebrationState.show}
        message={celebrationState.message}
        subMessage={celebrationState.subMessage}
        variant={celebrationState.variant}
        onComplete={dismiss}
      />
    </CelebrationContext.Provider>
  );
}
