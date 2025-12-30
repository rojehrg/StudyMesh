"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Users,
  Bell,
  Calendar,
  Sparkles,
  Search,
  MessageCircle,
  FolderOpen,
  Zap,
  LucideIcon,
} from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  variant?: "default" | "minimal" | "card";
  className?: string;
}

// Pre-defined empty states for common scenarios
export const emptyStatePresets = {
  noPods: {
    icon: Users,
    title: "No pods yet",
    description: "Pods are where the magic happens. Create one or join your team's pod to start collaborating.",
    action: { label: "Create a Pod", href: "/classes/create" },
    secondaryAction: { label: "Join a Pod", href: "/classes/join" },
  },
  noNotifications: {
    icon: Bell,
    title: "All caught up!",
    description: "No new notifications. When teammates reach out or you get matched, you'll see it here.",
  },
  noMeetings: {
    icon: Calendar,
    title: "No meetings scheduled",
    description: "Your calendar is clear. Nudge a teammate to set up a quick sync!",
    action: { label: "Browse Pods", href: "/classes" },
  },
  noMatches: {
    icon: Sparkles,
    title: "No matches yet",
    description: "We're still looking for the perfect match. Add more skills to your profile to improve matching.",
    action: { label: "Update Skills", href: "/settings" },
  },
  noResults: {
    icon: Search,
    title: "No results found",
    description: "Try adjusting your search or filters to find what you're looking for.",
  },
  noMembers: {
    icon: Users,
    title: "No members yet",
    description: "Share your pod code with teammates to get started.",
  },
  noMessages: {
    icon: MessageCircle,
    title: "No messages yet",
    description: "Start the conversation! Send a nudge to connect with teammates.",
  },
  emptyFolder: {
    icon: FolderOpen,
    title: "Nothing here yet",
    description: "This space is waiting to be filled with great things.",
  },
  noAvailable: {
    icon: Zap,
    title: "No one available right now",
    description: "Everyone's busy at the moment. Check back later or set your availability to let others know when you're free.",
    action: { label: "Set Availability", href: "/settings" },
  },
};

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
  secondaryAction,
  variant = "default",
  className,
}: EmptyStateProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 15,
      },
    },
  };

  const content = (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        variant === "minimal" ? "py-8" : "py-12",
        className
      )}
    >
      <motion.div
        variants={iconVariants}
        className={cn(
          "rounded-2xl flex items-center justify-center mb-4",
          variant === "minimal"
            ? "w-12 h-12 bg-muted"
            : "w-16 h-16 bg-primary/10"
        )}
      >
        <Icon
          className={cn(
            variant === "minimal"
              ? "w-6 h-6 text-muted-foreground"
              : "w-8 h-8 text-primary"
          )}
        />
      </motion.div>

      <motion.h3
        variants={itemVariants}
        className={cn(
          "font-semibold text-foreground",
          variant === "minimal" ? "text-base" : "text-lg"
        )}
      >
        {title}
      </motion.h3>

      <motion.p
        variants={itemVariants}
        className={cn(
          "text-muted-foreground max-w-sm",
          variant === "minimal" ? "text-sm mt-1" : "text-sm mt-2"
        )}
      >
        {description}
      </motion.p>

      {(action || secondaryAction) && (
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-3 mt-6"
        >
          {action && (
            action.href ? (
              <Button asChild>
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ) : (
              <Button onClick={action.onClick}>{action.label}</Button>
            )
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <Button variant="outline" asChild>
                <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
              </Button>
            ) : (
              <Button variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )
          )}
        </motion.div>
      )}
    </motion.div>
  );

  if (variant === "card") {
    return (
      <div className="border border-dashed border-border rounded-xl bg-card/50">
        {content}
      </div>
    );
  }

  return content;
}

// Convenience component for preset empty states
export function PresetEmptyState({
  preset,
  ...overrides
}: {
  preset: keyof typeof emptyStatePresets;
} & Partial<EmptyStateProps>) {
  const presetProps = emptyStatePresets[preset];
  return <EmptyState {...presetProps} {...overrides} />;
}
