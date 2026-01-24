"use client";

import { motion, type HTMLMotionProps, type Variants } from "framer-motion";
import React from "react";
import { cn } from "@/lib/utils";

// ===== Animation Variants =====

const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const fadeInDownVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};

const slideInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const slideInRightVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

const scaleInCenterVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

// ===== Base Props =====

interface BaseAnimationProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  once?: boolean;
}

// ===== FadeIn Component =====

type FadeInDirection = "up" | "down" | "none";

interface FadeInProps extends BaseAnimationProps {
  direction?: FadeInDirection;
  distance?: number;
}

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.4,
  direction = "up",
  distance = 20,
  once = true,
}: FadeInProps) {
  const getVariants = (): Variants => {
    switch (direction) {
      case "up":
        return {
          hidden: { opacity: 0, y: distance },
          visible: { opacity: 1, y: 0 },
        };
      case "down":
        return {
          hidden: { opacity: 0, y: -distance },
          visible: { opacity: 1, y: 0 },
        };
      case "none":
      default:
        return fadeInVariants;
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
      variants={getVariants()}
      transition={{
        delay,
        duration,
        ease: [0.25, 0.1, 0.25, 1], // Custom ease for smooth feel
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ===== SlideIn Component =====

type SlideInDirection = "left" | "right" | "up" | "down";

interface SlideInProps extends BaseAnimationProps {
  direction?: SlideInDirection;
  distance?: number;
}

export function SlideIn({
  children,
  className,
  delay = 0,
  duration = 0.4,
  direction = "left",
  distance = 30,
  once = true,
}: SlideInProps) {
  const getVariants = (): Variants => {
    switch (direction) {
      case "left":
        return {
          hidden: { opacity: 0, x: -distance },
          visible: { opacity: 1, x: 0 },
        };
      case "right":
        return {
          hidden: { opacity: 0, x: distance },
          visible: { opacity: 1, x: 0 },
        };
      case "up":
        return {
          hidden: { opacity: 0, y: distance },
          visible: { opacity: 1, y: 0 },
        };
      case "down":
        return {
          hidden: { opacity: 0, y: -distance },
          visible: { opacity: 1, y: 0 },
        };
      default:
        return slideInLeftVariants;
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
      variants={getVariants()}
      transition={{
        delay,
        duration,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ===== ScaleIn Component =====

type ScaleInOrigin = "center" | "top" | "bottom";

interface ScaleInProps extends BaseAnimationProps {
  origin?: ScaleInOrigin;
  initialScale?: number;
}

export function ScaleIn({
  children,
  className,
  delay = 0,
  duration = 0.3,
  origin = "center",
  initialScale = 0.95,
  once = true,
}: ScaleInProps) {
  const getTransformOrigin = () => {
    switch (origin) {
      case "top":
        return "top center";
      case "bottom":
        return "bottom center";
      case "center":
      default:
        return "center center";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: initialScale }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once }}
      transition={{
        delay,
        duration,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      style={{ transformOrigin: getTransformOrigin() }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ===== Stagger Container =====

interface StaggerContainerProps extends BaseAnimationProps {
  staggerDelay?: number;
}

export function StaggerContainer({
  children,
  className,
  delay = 0,
  staggerDelay = 0.1,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: delay,
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ===== Stagger Item =====

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  animation?: "fadeUp" | "fadeIn" | "slideLeft" | "slideRight" | "scale";
}

export function StaggerItem({
  children,
  className,
  animation = "fadeUp",
}: StaggerItemProps) {
  const getVariants = (): Variants => {
    switch (animation) {
      case "fadeIn":
        return fadeInVariants;
      case "slideLeft":
        return slideInLeftVariants;
      case "slideRight":
        return slideInRightVariants;
      case "scale":
        return scaleInVariants;
      case "fadeUp":
      default:
        return fadeInUpVariants;
    }
  };

  return (
    <motion.div
      variants={getVariants()}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ===== Hover Scale Wrapper =====

interface HoverScaleProps {
  children: React.ReactNode;
  className?: string;
  scale?: number;
  tapScale?: number;
}

export function HoverScale({
  children,
  className,
  scale = 1.02,
  tapScale = 0.98,
}: HoverScaleProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: tapScale }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ===== Animated Presence Wrapper =====

interface AnimatedPresenceWrapperProps {
  children: React.ReactNode;
  className?: string;
  isVisible: boolean;
  animation?: "fade" | "slideUp" | "slideDown" | "scale";
}

export function AnimatedPresenceWrapper({
  children,
  className,
  isVisible,
  animation = "fade",
}: AnimatedPresenceWrapperProps) {
  const getAnimationProps = () => {
    switch (animation) {
      case "slideUp":
        return {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -10 },
        };
      case "slideDown":
        return {
          initial: { opacity: 0, y: -10 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 10 },
        };
      case "scale":
        return {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.95 },
        };
      case "fade":
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      {...getAnimationProps()}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ===== Page Transition Wrapper =====

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ===== Floating Animation =====

interface FloatingProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  distance?: number;
}

export function Floating({
  children,
  className,
  duration = 3,
  distance = 10,
}: FloatingProps) {
  return (
    <motion.div
      animate={{
        y: [0, -distance, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ===== Pulse Animation =====

interface PulseProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  scale?: number;
}

export function Pulse({
  children,
  className,
  duration = 2,
  scale = 1.05,
}: PulseProps) {
  return (
    <motion.div
      animate={{
        scale: [1, scale, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ===== Export all variants for custom use =====

export const motionVariants = {
  fadeIn: fadeInVariants,
  fadeInUp: fadeInUpVariants,
  fadeInDown: fadeInDownVariants,
  slideInLeft: slideInLeftVariants,
  slideInRight: slideInRightVariants,
  scaleIn: scaleInVariants,
  scaleInCenter: scaleInCenterVariants,
};
