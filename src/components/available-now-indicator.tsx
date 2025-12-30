"use client";

import { cn } from "@/lib/utils";

interface AvailableNowIndicatorProps {
  isAvailable: boolean;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AvailableNowIndicator({
  isAvailable,
  showLabel = false,
  size = "md",
  className,
}: AvailableNowIndicatorProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  };

  const labelSizeClasses = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  };

  if (!isAvailable) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="relative flex">
        {/* Pulse animation */}
        <span
          className={cn(
            "animate-ping absolute inline-flex rounded-full bg-success opacity-75",
            sizeClasses[size]
          )}
        />
        {/* Solid dot */}
        <span
          className={cn(
            "relative inline-flex rounded-full bg-success",
            sizeClasses[size]
          )}
        />
      </span>
      {showLabel && (
        <span className={cn("text-success font-medium", labelSizeClasses[size])}>
          Available now
        </span>
      )}
    </div>
  );
}

// Simplified dot-only version for avatars
export function AvailableDot({
  isAvailable,
  className,
}: {
  isAvailable: boolean;
  className?: string;
}) {
  if (!isAvailable) return null;

  return (
    <span
      className={cn(
        "absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-success ring-2 ring-background",
        className
      )}
    >
      <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-75" />
    </span>
  );
}
