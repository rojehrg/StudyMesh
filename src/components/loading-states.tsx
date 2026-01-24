"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { cn } from "@/lib/utils";

// Lazy load Lottie to reduce initial bundle size
const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-muted rounded-full w-full h-full" />,
});

// Lazy load animation data
const loadingAnimation = require("../../public/loading.json");

// Lottie loader component with lazy loading
export function LottieLoader({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  return (
    <div className={cn(sizeClasses[size], className)}>
      <Suspense fallback={<div className="animate-pulse bg-muted rounded-full w-full h-full" />}>
        <Lottie
          animationData={loadingAnimation}
          loop={true}
          autoplay={true}
          style={{ width: "100%", height: "100%" }}
        />
      </Suspense>
    </div>
  );
}

// Animated loader with personality
export function LoadingSpinner({
  size = "md",
  text,
  className,
}: {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}) {
  const lottieSize = size === "sm" ? "sm" : size === "lg" ? "lg" : "md";

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <LottieLoader size={lottieSize} />
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

// Full page loader
export function PageLoader({ message }: { message?: string }) {
  // Use static message to avoid SSR hydration mismatch
  const displayMessage = message || "Loading...";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <LottieLoader size="xl" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-muted-foreground"
      >
        {displayMessage}
      </motion.p>
    </div>
  );
}

// Skeleton components
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-muted",
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// Pulse dot for "live" indicators
export function PulseDot({
  color = "success",
  size = "md",
}: {
  color?: "success" | "warning" | "primary" | "accent";
  size?: "sm" | "md" | "lg";
}) {
  const colorClasses = {
    success: "bg-success",
    warning: "bg-warning",
    primary: "bg-primary",
    accent: "bg-accent",
  };

  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  };

  return (
    <span className="relative flex">
      <span
        className={cn(
          "animate-ping absolute inline-flex rounded-full opacity-75",
          colorClasses[color],
          sizeClasses[size]
        )}
      />
      <span
        className={cn(
          "relative inline-flex rounded-full",
          colorClasses[color],
          sizeClasses[size]
        )}
      />
    </span>
  );
}

// Animated number counter
export function AnimatedNumber({
  value,
  duration = 1,
}: {
  value: number;
  duration?: number;
}) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      key={value}
    >
      {value}
    </motion.span>
  );
}

// Staggered list animation wrapper
export function StaggeredList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggeredItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Fade in wrapper
export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Scale on hover wrapper
export function HoverScale({
  children,
  scale = 1.02,
  className,
}: {
  children: React.ReactNode;
  scale?: number;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Table skeleton for data tables
export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
}: {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}) {
  return (
    <div className="w-full border border-border rounded-xl overflow-hidden">
      {showHeader && (
        <div className="flex items-center gap-4 p-4 bg-muted/50 border-b border-border">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton
              key={`header-${i}`}
              className={cn(
                "h-4",
                i === 0 ? "w-1/4" : i === columns - 1 ? "w-16" : "w-1/5"
              )}
            />
          ))}
        </div>
      )}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-4 p-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={`cell-${rowIndex}-${colIndex}`}
                className={cn(
                  "h-4",
                  colIndex === 0 ? "w-1/4" : colIndex === columns - 1 ? "w-16" : "w-1/5"
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Dashboard skeleton for the main dashboard view
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border border-border rounded-xl p-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
            <ListSkeleton count={4} />
          </div>
        </div>

        {/* Sidebar content */}
        <div className="space-y-4">
          <div className="border border-border rounded-xl p-6 space-y-4">
            <Skeleton className="h-6 w-28" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Momentum Lock skeleton for lock cards
export function MomentumLockSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl p-6 space-y-4">
      {/* Header with status badge */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      {/* Lock content */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Footer with deadline and actions */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}

// Multiple Momentum Lock skeletons in a list
export function MomentumLockListSkeleton({
  count = 3,
  compact = false,
}: {
  count?: number;
  compact?: boolean;
}) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <MomentumLockSkeleton key={i} compact={compact} />
      ))}
    </div>
  );
}

// Form skeleton
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      <div className="flex justify-end gap-3 pt-4">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
    </div>
  );
}

// Navigation/Sidebar skeleton
export function SidebarSkeleton() {
  return (
    <div className="w-64 border-r border-border p-4 space-y-6">
      {/* Logo area */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="h-5 w-24" />
      </div>

      {/* Nav items */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>

      {/* Bottom section */}
      <div className="absolute bottom-4 left-4 right-4 space-y-3">
        <div className="flex items-center gap-3 p-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
