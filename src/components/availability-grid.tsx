"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Globe, Clock, Zap } from "lucide-react";

// Common timezones grouped by region
const TIMEZONE_OPTIONS = [
  { label: "Pacific Time (PT)", value: "America/Los_Angeles" },
  { label: "Mountain Time (MT)", value: "America/Denver" },
  { label: "Central Time (CT)", value: "America/Chicago" },
  { label: "Eastern Time (ET)", value: "America/New_York" },
  { label: "UTC", value: "UTC" },
  { label: "London (GMT/BST)", value: "Europe/London" },
  { label: "Paris (CET/CEST)", value: "Europe/Paris" },
  { label: "Berlin (CET/CEST)", value: "Europe/Berlin" },
  { label: "Istanbul (TRT)", value: "Europe/Istanbul" },
  { label: "Dubai (GST)", value: "Asia/Dubai" },
  { label: "India (IST)", value: "Asia/Kolkata" },
  { label: "Singapore (SGT)", value: "Asia/Singapore" },
  { label: "Tokyo (JST)", value: "Asia/Tokyo" },
  { label: "Sydney (AEST/AEDT)", value: "Australia/Sydney" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Time slot width for 30-minute intervals
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = (i % 2) * 30;
  return { hour, minute, label: `${hour.toString().padStart(2, "0")}:${minute === 0 ? "00" : "30"}` };
});

export interface AvailabilitySlot {
  day: number; // 0-6 (Mon-Sun)
  startSlot: number; // 0-47 (30-min intervals)
  endSlot: number;
}

interface AvailabilityGridProps {
  value?: {
    timezone: string;
    slots: AvailabilitySlot[];
    currentlyAvailable: boolean;
  };
  onChange?: (value: {
    timezone: string;
    slots: AvailabilitySlot[];
    currentlyAvailable: boolean;
  }) => void;
  readOnly?: boolean;
  compact?: boolean;
}

export function AvailabilityGrid({
  value,
  onChange,
  readOnly = false,
  compact = false,
}: AvailabilityGridProps) {
  const [timezone, setTimezone] = useState(value?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [slots, setSlots] = useState<AvailabilitySlot[]>(value?.slots || []);
  const [currentlyAvailable, setCurrentlyAvailable] = useState(value?.currentlyAvailable || false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ day: number; slot: number } | null>(null);
  const [dragMode, setDragMode] = useState<"add" | "remove">("add");

  // Auto-detect timezone on mount
  useEffect(() => {
    if (!value?.timezone) {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(detected);
    }
  }, [value?.timezone]);

  // Notify parent of changes - use ref to avoid infinite loops with inline callbacks
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const isMountedRef = useRef(false);

  useEffect(() => {
    // Skip the initial mount call to avoid triggering unnecessary saves
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    onChangeRef.current?.({ timezone, slots, currentlyAvailable });
  }, [timezone, slots, currentlyAvailable]);

  const isSlotSelected = useCallback((day: number, slot: number) => {
    return slots.some(
      (s) => s.day === day && slot >= s.startSlot && slot < s.endSlot
    );
  }, [slots]);

  const handleMouseDown = (day: number, slot: number) => {
    if (readOnly) return;
    setIsDragging(true);
    setDragStart({ day, slot });

    // Determine if we're adding or removing
    const isSelected = isSlotSelected(day, slot);
    setDragMode(isSelected ? "remove" : "add");
  };

  const handleMouseEnter = (day: number, slot: number) => {
    if (!isDragging || !dragStart || readOnly) return;
    if (dragStart.day !== day) return; // Only allow horizontal dragging within same day

    const startSlot = Math.min(dragStart.slot, slot);
    const endSlot = Math.max(dragStart.slot, slot) + 1;

    // Update slots based on drag mode
    if (dragMode === "add") {
      // Remove any overlapping slots for this day
      const filtered = slots.filter(
        (s) => s.day !== day || s.endSlot <= startSlot || s.startSlot >= endSlot
      );
      // Add new slot
      setSlots([...filtered, { day, startSlot, endSlot }]);
    } else {
      // Remove the range from existing slots
      const newSlots: AvailabilitySlot[] = [];
      slots.forEach((s) => {
        if (s.day !== day) {
          newSlots.push(s);
        } else {
          // Split or trim existing slots
          if (s.startSlot < startSlot) {
            newSlots.push({ day, startSlot: s.startSlot, endSlot: Math.min(s.endSlot, startSlot) });
          }
          if (s.endSlot > endSlot) {
            newSlots.push({ day, startSlot: Math.max(s.startSlot, endSlot), endSlot: s.endSlot });
          }
        }
      });
      setSlots(newSlots);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging || !dragStart) {
      setIsDragging(false);
      setDragStart(null);
      return;
    }

    // If no drag movement, just toggle the single slot
    const { day, slot } = dragStart;
    const isSelected = isSlotSelected(day, slot);

    if (dragMode === "add" && !isSelected) {
      const filtered = slots.filter(
        (s) => s.day !== day || s.endSlot <= slot || s.startSlot > slot
      );
      setSlots([...filtered, { day, startSlot: slot, endSlot: slot + 1 }]);
    }

    setIsDragging(false);
    setDragStart(null);
  };

  // Merge adjacent slots for the same day
  const mergeSlots = useCallback((rawSlots: AvailabilitySlot[]) => {
    const byDay: { [key: number]: AvailabilitySlot[] } = {};
    rawSlots.forEach((s) => {
      if (!byDay[s.day]) byDay[s.day] = [];
      byDay[s.day].push(s);
    });

    const merged: AvailabilitySlot[] = [];
    Object.entries(byDay).forEach(([day, daySlots]) => {
      const sorted = daySlots.sort((a, b) => a.startSlot - b.startSlot);
      let current: AvailabilitySlot | null = null;

      sorted.forEach((slot) => {
        if (!current) {
          current = { ...slot };
        } else if (slot.startSlot <= current.endSlot) {
          current.endSlot = Math.max(current.endSlot, slot.endSlot);
        } else {
          merged.push(current);
          current = { ...slot };
        }
      });

      if (current) merged.push(current);
    });

    return merged;
  }, []);

  // Merge slots when they change
  useEffect(() => {
    const merged = mergeSlots(slots);
    if (JSON.stringify(merged) !== JSON.stringify(slots)) {
      setSlots(merged);
    }
  }, [slots, mergeSlots]);

  const clearAll = () => {
    setSlots([]);
  };

  const setWorkHours = () => {
    // Set 9am-5pm Mon-Fri
    const workSlots: AvailabilitySlot[] = [];
    for (let day = 0; day < 5; day++) {
      workSlots.push({ day, startSlot: 18, endSlot: 34 }); // 9:00 - 17:00
    }
    setSlots(workSlots);
  };

  // Format slot to time string
  const formatSlotTime = (slot: number) => {
    const hour = Math.floor(slot / 2);
    const minute = (slot % 2) * 30;
    return `${hour.toString().padStart(2, "0")}:${minute === 0 ? "00" : "30"}`;
  };

  // Get current time in user's timezone
  const getCurrentTimeSlot = () => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0");
    const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0");
    return hour * 2 + (minute >= 30 ? 1 : 0);
  };

  // Get current day of week (0 = Monday)
  const getCurrentDay = () => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday
    return day === 0 ? 6 : day - 1; // Convert to Monday = 0
  };

  if (compact) {
    // Compact view for displaying in lists
    const totalHours = slots.reduce((acc, s) => acc + (s.endSlot - s.startSlot) / 2, 0);
    const daysActive = new Set(slots.map((s) => s.day)).size;

    return (
      <div className="flex items-center gap-3">
        {currentlyAvailable && (
          <Badge className="bg-success/10 text-success border-0 gap-1">
            <Zap className="w-3 h-3" />
            Available now
          </Badge>
        )}
        <span className="text-sm text-muted-foreground">
          {totalHours > 0 ? `${totalHours}h across ${daysActive} days` : "No availability set"}
        </span>
        <span className="text-xs text-muted-foreground">
          ({TIMEZONE_OPTIONS.find((t) => t.value === timezone)?.label || timezone})
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Timezone Selector */}
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <Select value={timezone} onValueChange={setTimezone} disabled={readOnly}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONE_OPTIONS.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Currently Available Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="currently-available"
              checked={currentlyAvailable}
              onCheckedChange={setCurrentlyAvailable}
              disabled={readOnly}
            />
            <Label
              htmlFor="currently-available"
              className={cn(
                "font-medium cursor-pointer",
                currentlyAvailable ? "text-success" : "text-muted-foreground"
              )}
            >
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                Available now
              </span>
            </Label>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {!readOnly && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={setWorkHours}>
            Set 9-5 Mon-Fri
          </Button>
          <Button variant="outline" size="sm" onClick={clearAll}>
            Clear All
          </Button>
        </div>
      )}

      {/* Grid */}
      <div className="border border-border rounded-lg overflow-hidden bg-card shadow-sm">
        {/* Hour Headers */}
        <div className="flex border-b border-border bg-muted/50">
          <div className="w-16 shrink-0 p-2 text-xs font-semibold text-foreground/70 border-r border-border" />
          <div className="flex-1 flex">
            {HOURS.filter((_, i) => i % 2 === 0).map((hour) => (
              <div
                key={hour}
                className="flex-1 text-center text-xs font-semibold text-foreground/70 py-2"
                style={{ minWidth: "2rem" }}
              >
                {hour.toString().padStart(2, "0")}
              </div>
            ))}
          </div>
        </div>

        {/* Day Rows */}
        {DAYS.map((day, dayIndex) => (
          <div key={day} className="flex border-b border-border last:border-b-0">
            {/* Day Label */}
            <div className="w-16 shrink-0 p-2 text-sm font-semibold text-foreground border-r border-border bg-muted/30 flex items-center">
              {day}
            </div>
            {/* Time Slots */}
            <div className="flex-1 flex">
              {TIME_SLOTS.map((slot, slotIndex) => {
                const isSelected = isSlotSelected(dayIndex, slotIndex);
                const isCurrentSlot = getCurrentDay() === dayIndex && getCurrentTimeSlot() === slotIndex;

                return (
                  <div
                    key={slotIndex}
                    className={cn(
                      "flex-1 h-8 border-r last:border-r-0 transition-colors cursor-pointer select-none",
                      slotIndex % 2 === 0 ? "border-r-border" : "border-r-border/50",
                      isSelected
                        ? "bg-primary hover:bg-primary/80"
                        : "bg-muted/20 hover:bg-muted/60",
                      isCurrentSlot && !isSelected && "ring-2 ring-inset ring-primary/50",
                      readOnly && "cursor-default"
                    )}
                    style={{ minWidth: "0.5rem" }}
                    onMouseDown={() => handleMouseDown(dayIndex, slotIndex)}
                    onMouseEnter={() => handleMouseEnter(dayIndex, slotIndex)}
                    title={`${day} ${formatSlotTime(slotIndex)}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend & Summary */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary" />
            <span className="text-foreground/80">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted/30 border border-border" />
            <span className="text-foreground/80">Unavailable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted/30 border border-border ring-2 ring-inset ring-primary/50" />
            <span className="text-foreground/80">Now</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-foreground/80">
          <Clock className="w-4 h-4" />
          <span>
            {slots.reduce((acc, s) => acc + (s.endSlot - s.startSlot) / 2, 0)} hours/week available
          </span>
        </div>
      </div>

      {/* Slot Summary */}
      {slots.length > 0 && (
        <div className="text-sm space-y-1">
          <p className="font-medium text-foreground">Your availability:</p>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day, dayIndex) => {
              const daySlots = slots.filter((s) => s.day === dayIndex);
              if (daySlots.length === 0) return null;

              return (
                <Badge key={day} variant="secondary" className="font-normal">
                  {day}: {daySlots.map((s) => `${formatSlotTime(s.startSlot)}-${formatSlotTime(s.endSlot)}`).join(", ")}
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to convert legacy availability format to new slot format
export function convertLegacyAvailability(legacy: Record<string, string[]>): AvailabilitySlot[] {
  const dayMap: Record<string, number> = {
    Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4, Saturday: 5, Sunday: 6,
  };

  const slots: AvailabilitySlot[] = [];

  Object.entries(legacy).forEach(([day, times]) => {
    const dayIndex = dayMap[day];
    if (dayIndex === undefined) return;

    times.forEach((timeRange) => {
      const [start, end] = timeRange.split("-");
      if (!start || !end) return;

      const [startHour, startMin] = start.split(":").map(Number);
      const [endHour, endMin] = end.split(":").map(Number);

      const startSlot = startHour * 2 + (startMin >= 30 ? 1 : 0);
      const endSlot = endHour * 2 + (endMin >= 30 ? 1 : 0);

      if (startSlot < endSlot) {
        slots.push({ day: dayIndex, startSlot, endSlot });
      }
    });
  });

  return slots;
}

// Helper to convert new slot format back to legacy format for API compatibility
export function convertToLegacyAvailability(slots: AvailabilitySlot[]): Record<string, string[]> {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const result: Record<string, string[]> = {};

  slots.forEach((slot) => {
    const day = days[slot.day];
    if (!result[day]) result[day] = [];

    const startHour = Math.floor(slot.startSlot / 2);
    const startMin = (slot.startSlot % 2) * 30;
    const endHour = Math.floor(slot.endSlot / 2);
    const endMin = (slot.endSlot % 2) * 30;

    const start = `${startHour.toString().padStart(2, "0")}:${startMin === 0 ? "00" : "30"}`;
    const end = `${endHour.toString().padStart(2, "0")}:${endMin === 0 ? "00" : "30"}`;

    result[day].push(`${start}-${end}`);
  });

  return result;
}
