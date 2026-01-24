"use client";

import { cn } from "@/lib/utils";
import { getTimezoneAbbrev } from "@/lib/availability";
import { formatRelativeTimezone } from "@/lib/timezone-utils";

interface AvailableNowIndicatorProps {
  isAvailable: boolean;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** User's timezone for context display */
  timezone?: string;
  /** Viewer's timezone for relative comparison */
  viewerTimezone?: string;
  /** Show relative timezone info (e.g., "9 hours ahead") */
  showRelativeTime?: boolean;
}

export function AvailableNowIndicator({
  isAvailable,
  showLabel = false,
  size = "md",
  className,
  timezone,
  viewerTimezone,
  showRelativeTime = false,
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

  // Get timezone abbreviation if provided
  const tzAbbrev = timezone ? getTimezoneAbbrev(timezone) : null;

  // Get relative timezone difference if both timezones provided
  const relativeTz =
    showRelativeTime && timezone && viewerTimezone
      ? formatRelativeTimezone(viewerTimezone, timezone)
      : null;

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
          {tzAbbrev && (
            <span className="text-coffee-cortado font-normal ml-1">({tzAbbrev})</span>
          )}
        </span>
      )}
      {showRelativeTime && relativeTz && relativeTz !== "same timezone" && (
        <span className={cn("text-coffee-latte", labelSizeClasses[size])}>
          {relativeTz}
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

/**
 * Extended availability indicator with full timezone context
 * Shows availability status with timezone abbreviation and relative time
 */
interface AvailabilityStatusProps {
  isAvailable: boolean;
  timezone: string;
  viewerTimezone?: string;
  userName?: string;
  className?: string;
}

export function AvailabilityStatus({
  isAvailable,
  timezone,
  viewerTimezone,
  userName,
  className,
}: AvailabilityStatusProps) {
  const tzAbbrev = getTimezoneAbbrev(timezone);
  const actualViewerTz = viewerTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const relativeTz = formatRelativeTimezone(actualViewerTz, timezone);

  // Get current time in user's timezone
  const currentTime = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      {/* Primary status line */}
      <div className="flex items-center gap-2">
        {isAvailable ? (
          <>
            <span className="relative flex">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <span className="text-sm text-success font-medium">
              Available now
            </span>
          </>
        ) : (
          <>
            <span className="inline-flex h-2 w-2 rounded-full bg-coffee-steamed" />
            <span className="text-sm text-coffee-cortado">
              Not available
            </span>
          </>
        )}
        <span className="text-sm text-coffee-latte">({tzAbbrev})</span>
      </div>

      {/* Secondary info line */}
      <div className="flex items-center gap-2 text-xs text-coffee-latte">
        <span>{currentTime} local time</span>
        {relativeTz !== "same timezone" && (
          <>
            <span className="text-coffee-foam">|</span>
            <span>{relativeTz}</span>
          </>
        )}
      </div>
    </div>
  );
}
