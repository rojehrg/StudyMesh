"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { getTimezoneAbbrev } from "@/lib/availability";
import {
  getTimezoneOffset,
  getCurrentHourInTimezone,
  formatTimeInTimezone,
} from "@/lib/timezone-utils";

interface TimezoneUser {
  timezone: string;
  name: string;
}

interface TimezoneOverlapProps {
  userA: TimezoneUser;
  userB: TimezoneUser;
  className?: string;
  showCurrentTime?: boolean;
}

interface HourBlock {
  hour: number;
  isWorkingA: boolean;
  isWorkingB: boolean;
  isOverlap: boolean;
  isSleepA: boolean;
  isSleepB: boolean;
}

/**
 * Visual component showing timezone overlap between two users
 * Displays a 24-hour bar with colored regions indicating:
 * - Working hours overlap (ideal for coordination)
 * - Individual working hours
 * - Sleep hours
 */
export function TimezoneOverlap({
  userA,
  userB,
  className,
  showCurrentTime = true,
}: TimezoneOverlapProps) {
  const now = new Date();

  // Calculate timezone offsets and hour blocks
  const { hourBlocks, offsetDiff, currentHourA } = useMemo(() => {
    const offsetA = getTimezoneOffset(userA.timezone, now);
    const offsetB = getTimezoneOffset(userB.timezone, now);
    const diff = (offsetB - offsetA) / 60; // Difference in hours

    const blocks: HourBlock[] = [];

    // Working hours: 9 AM - 6 PM
    // Sleep hours: 10 PM - 7 AM
    const isWorkingHour = (hour: number) => hour >= 9 && hour < 18;
    const isSleepHour = (hour: number) => hour >= 22 || hour < 7;

    for (let i = 0; i < 24; i++) {
      // Hour i in userA's timezone
      const hourInA = i;
      // Corresponding hour in userB's timezone
      let hourInB = (i + diff) % 24;
      if (hourInB < 0) hourInB += 24;

      const isWorkingA = isWorkingHour(hourInA);
      const isWorkingB = isWorkingHour(hourInB);
      const isSleepA = isSleepHour(hourInA);
      const isSleepB = isSleepHour(hourInB);

      blocks.push({
        hour: hourInA,
        isWorkingA,
        isWorkingB,
        isOverlap: isWorkingA && isWorkingB,
        isSleepA,
        isSleepB,
      });
    }

    return {
      hourBlocks: blocks,
      offsetDiff: diff,
      currentHourA: getCurrentHourInTimezone(userA.timezone),
    };
  }, [userA.timezone, userB.timezone, now]);

  // Calculate overlap hours
  const overlapHours = hourBlocks.filter((b) => b.isOverlap).length;

  // Format relative difference
  const formatDiff = () => {
    if (offsetDiff === 0) return "same timezone";
    const abs = Math.abs(offsetDiff);
    const direction = offsetDiff > 0 ? "ahead" : "behind";
    if (abs === 1) return `1 hour ${direction}`;
    if (abs % 1 !== 0) {
      const hours = Math.floor(abs);
      const mins = Math.round((abs % 1) * 60);
      return hours > 0 ? `${hours}h ${mins}m ${direction}` : `${mins}m ${direction}`;
    }
    return `${abs} hours ${direction}`;
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header with user names and timezones */}
      <div className="flex justify-between text-sm">
        <div className="space-y-0.5">
          <p className="font-medium text-coffee-espresso">{userA.name}</p>
          <p className="text-coffee-cortado">
            {getTimezoneAbbrev(userA.timezone)}
            {showCurrentTime && (
              <span className="text-coffee-latte ml-1">
                ({formatTimeInTimezone(now, userA.timezone)})
              </span>
            )}
          </p>
        </div>
        <div className="text-right space-y-0.5">
          <p className="font-medium text-coffee-espresso">{userB.name}</p>
          <p className="text-coffee-cortado">
            {getTimezoneAbbrev(userB.timezone)}
            {showCurrentTime && (
              <span className="text-coffee-latte ml-1">
                ({formatTimeInTimezone(now, userB.timezone)})
              </span>
            )}
          </p>
        </div>
      </div>

      {/* 24-hour visualization bar */}
      <div className="relative">
        {/* Hour blocks */}
        <div className="flex h-8 rounded overflow-hidden border border-coffee-foam">
          {hourBlocks.map((block, index) => (
            <div
              key={index}
              className={cn(
                "flex-1 relative transition-colors",
                getBlockColor(block)
              )}
              title={`${formatHour(block.hour)} ${userA.name}'s time`}
            >
              {/* Current time indicator */}
              {showCurrentTime && block.hour === currentHourA && (
                <div className="absolute inset-y-0 left-1/2 w-0.5 bg-coffee-espresso z-10" />
              )}
            </div>
          ))}
        </div>

        {/* Hour labels */}
        <div className="flex justify-between mt-1 text-[10px] text-coffee-latte">
          <span>12a</span>
          <span>6a</span>
          <span>12p</span>
          <span>6p</span>
          <span>12a</span>
        </div>
      </div>

      {/* Legend and summary */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-coffee-mocha" />
          <span className="text-coffee-cortado">Overlap ({overlapHours}h)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-coffee-steamed" />
          <span className="text-coffee-cortado">Working hours</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-coffee-cream" />
          <span className="text-coffee-cortado">Off hours</span>
        </div>
      </div>

      {/* Relative timezone info */}
      <p className="text-xs text-coffee-latte">
        {userB.name} is {formatDiff()}
      </p>
    </div>
  );
}

/**
 * Get the background color class for an hour block
 */
function getBlockColor(block: HourBlock): string {
  if (block.isOverlap) {
    // Both users in working hours - coffee mocha (warm chocolate)
    return "bg-coffee-mocha";
  }
  if (block.isWorkingA || block.isWorkingB) {
    // One user in working hours - steamed (warm beige)
    return "bg-coffee-steamed";
  }
  if (block.isSleepA && block.isSleepB) {
    // Both sleeping - foam (light cream)
    return "bg-coffee-foam";
  }
  // Off hours - cream (warm off-white)
  return "bg-coffee-cream";
}

/**
 * Format hour for display
 */
function formatHour(hour: number): string {
  if (hour === 0 || hour === 24) return "12:00 AM";
  if (hour === 12) return "12:00 PM";
  if (hour < 12) return `${hour}:00 AM`;
  return `${hour - 12}:00 PM`;
}

/**
 * Compact version for smaller spaces
 */
export function TimezoneOverlapCompact({
  userA,
  userB,
  className,
}: Omit<TimezoneOverlapProps, "showCurrentTime">) {
  const now = new Date();

  const { overlapHours, offsetDiff } = useMemo(() => {
    const offsetA = getTimezoneOffset(userA.timezone, now);
    const offsetB = getTimezoneOffset(userB.timezone, now);
    const diff = (offsetB - offsetA) / 60;

    // Calculate working hours overlap
    let overlap = 0;
    for (let i = 0; i < 24; i++) {
      const hourA = i;
      let hourB = (i + diff) % 24;
      if (hourB < 0) hourB += 24;

      const isWorkingA = hourA >= 9 && hourA < 18;
      const isWorkingB = hourB >= 9 && hourB < 18;

      if (isWorkingA && isWorkingB) overlap++;
    }

    return { overlapHours: overlap, offsetDiff: diff };
  }, [userA.timezone, userB.timezone, now]);

  const formatDiff = () => {
    if (offsetDiff === 0) return "same TZ";
    const abs = Math.abs(offsetDiff);
    const direction = offsetDiff > 0 ? "ahead" : "behind";
    if (abs % 1 !== 0) {
      const hours = Math.floor(abs);
      const mins = Math.round((abs % 1) * 60);
      return hours > 0 ? `${hours}h${mins}m ${direction}` : `${mins}m ${direction}`;
    }
    return `${abs}h ${direction}`;
  };

  return (
    <div className={cn("flex items-center gap-2 text-xs", className)}>
      <span className="text-coffee-cortado">
        {overlapHours}h overlap
      </span>
      <span className="text-coffee-foam">|</span>
      <span className="text-coffee-latte">{formatDiff()}</span>
    </div>
  );
}
