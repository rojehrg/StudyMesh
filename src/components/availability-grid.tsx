"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Globe, Clock, Zap, ChevronDown, Check, Search, X } from "lucide-react";
import { toast } from "sonner";

// Comprehensive timezone list grouped by region
const TIMEZONE_OPTIONS = [
  // Americas
  { label: "Pacific Time (Los Angeles)", value: "America/Los_Angeles", region: "Americas" },
  { label: "Mountain Time (Denver)", value: "America/Denver", region: "Americas" },
  { label: "Central Time (Chicago)", value: "America/Chicago", region: "Americas" },
  { label: "Eastern Time (New York)", value: "America/New_York", region: "Americas" },
  { label: "Alaska (Anchorage)", value: "America/Anchorage", region: "Americas" },
  { label: "Hawaii (Honolulu)", value: "Pacific/Honolulu", region: "Americas" },
  { label: "Arizona (Phoenix)", value: "America/Phoenix", region: "Americas" },
  { label: "Atlantic (Halifax)", value: "America/Halifax", region: "Americas" },
  { label: "Newfoundland (St Johns)", value: "America/St_Johns", region: "Americas" },
  { label: "Buenos Aires", value: "America/Argentina/Buenos_Aires", region: "Americas" },
  { label: "São Paulo", value: "America/Sao_Paulo", region: "Americas" },
  { label: "Mexico City", value: "America/Mexico_City", region: "Americas" },
  { label: "Toronto", value: "America/Toronto", region: "Americas" },
  { label: "Vancouver", value: "America/Vancouver", region: "Americas" },
  { label: "Lima", value: "America/Lima", region: "Americas" },
  { label: "Bogota", value: "America/Bogota", region: "Americas" },
  { label: "Santiago", value: "America/Santiago", region: "Americas" },
  // Europe
  { label: "UTC / GMT", value: "UTC", region: "Europe" },
  { label: "London (GMT/BST)", value: "Europe/London", region: "Europe" },
  { label: "Paris (CET)", value: "Europe/Paris", region: "Europe" },
  { label: "Berlin (CET)", value: "Europe/Berlin", region: "Europe" },
  { label: "Amsterdam", value: "Europe/Amsterdam", region: "Europe" },
  { label: "Brussels", value: "Europe/Brussels", region: "Europe" },
  { label: "Madrid", value: "Europe/Madrid", region: "Europe" },
  { label: "Rome", value: "Europe/Rome", region: "Europe" },
  { label: "Zurich", value: "Europe/Zurich", region: "Europe" },
  { label: "Stockholm", value: "Europe/Stockholm", region: "Europe" },
  { label: "Oslo", value: "Europe/Oslo", region: "Europe" },
  { label: "Copenhagen", value: "Europe/Copenhagen", region: "Europe" },
  { label: "Helsinki", value: "Europe/Helsinki", region: "Europe" },
  { label: "Warsaw", value: "Europe/Warsaw", region: "Europe" },
  { label: "Prague", value: "Europe/Prague", region: "Europe" },
  { label: "Vienna", value: "Europe/Vienna", region: "Europe" },
  { label: "Athens", value: "Europe/Athens", region: "Europe" },
  { label: "Istanbul", value: "Europe/Istanbul", region: "Europe" },
  { label: "Moscow", value: "Europe/Moscow", region: "Europe" },
  { label: "Dublin", value: "Europe/Dublin", region: "Europe" },
  { label: "Lisbon", value: "Europe/Lisbon", region: "Europe" },
  // Asia & Middle East
  { label: "Dubai (GST)", value: "Asia/Dubai", region: "Asia" },
  { label: "Riyadh", value: "Asia/Riyadh", region: "Asia" },
  { label: "Tel Aviv (Jerusalem)", value: "Asia/Jerusalem", region: "Asia" },
  { label: "Mumbai (Kolkata)", value: "Asia/Kolkata", region: "Asia" },
  { label: "Bangalore", value: "Asia/Kolkata", region: "Asia" },
  { label: "Singapore", value: "Asia/Singapore", region: "Asia" },
  { label: "Hong Kong", value: "Asia/Hong_Kong", region: "Asia" },
  { label: "Shanghai", value: "Asia/Shanghai", region: "Asia" },
  { label: "Beijing", value: "Asia/Shanghai", region: "Asia" },
  { label: "Tokyo", value: "Asia/Tokyo", region: "Asia" },
  { label: "Seoul", value: "Asia/Seoul", region: "Asia" },
  { label: "Taipei", value: "Asia/Taipei", region: "Asia" },
  { label: "Manila", value: "Asia/Manila", region: "Asia" },
  { label: "Jakarta", value: "Asia/Jakarta", region: "Asia" },
  { label: "Bangkok", value: "Asia/Bangkok", region: "Asia" },
  { label: "Ho Chi Minh", value: "Asia/Ho_Chi_Minh", region: "Asia" },
  { label: "Kuala Lumpur", value: "Asia/Kuala_Lumpur", region: "Asia" },
  { label: "Karachi", value: "Asia/Karachi", region: "Asia" },
  { label: "Dhaka", value: "Asia/Dhaka", region: "Asia" },
  // Pacific & Oceania
  { label: "Sydney (AEST)", value: "Australia/Sydney", region: "Pacific" },
  { label: "Melbourne", value: "Australia/Melbourne", region: "Pacific" },
  { label: "Brisbane", value: "Australia/Brisbane", region: "Pacific" },
  { label: "Perth", value: "Australia/Perth", region: "Pacific" },
  { label: "Adelaide", value: "Australia/Adelaide", region: "Pacific" },
  { label: "Auckland", value: "Pacific/Auckland", region: "Pacific" },
  { label: "Fiji", value: "Pacific/Fiji", region: "Pacific" },
  // Africa
  { label: "Cairo", value: "Africa/Cairo", region: "Africa" },
  { label: "Johannesburg", value: "Africa/Johannesburg", region: "Africa" },
  { label: "Lagos", value: "Africa/Lagos", region: "Africa" },
  { label: "Nairobi", value: "Africa/Nairobi", region: "Africa" },
  { label: "Casablanca", value: "Africa/Casablanca", region: "Africa" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Time slot width for 30-minute intervals
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = (i % 2) * 30;
  // 12-hour format helper
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const ampm = hour < 12 ? "am" : "pm";
  return { hour, minute, label: `${hour12}:${minute === 0 ? "00" : "30"}${ampm}` };
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
  const [tzSearch, setTzSearch] = useState("");
  const [tzOpen, setTzOpen] = useState(false);

  // Filter timezones by search
  const filteredTimezones = useMemo(() => {
    if (!tzSearch) return TIMEZONE_OPTIONS;
    const search = tzSearch.toLowerCase();
    return TIMEZONE_OPTIONS.filter(
      tz => tz.label.toLowerCase().includes(search) ||
            tz.value.toLowerCase().includes(search) ||
            tz.region.toLowerCase().includes(search)
    );
  }, [tzSearch]);

  // Group filtered timezones by region
  const groupedTimezones = useMemo(() => {
    const groups: Record<string, typeof TIMEZONE_OPTIONS> = {};
    filteredTimezones.forEach(tz => {
      if (!groups[tz.region]) groups[tz.region] = [];
      groups[tz.region].push(tz);
    });
    return groups;
  }, [filteredTimezones]);

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
  const lastNotifiedRef = useRef(JSON.stringify({ timezone: value?.timezone, slots: value?.slots, currentlyAvailable: value?.currentlyAvailable }));
  const hasMountedRef = useRef(false);

  useEffect(() => {
    // Skip the very first render (mount)
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    // Only call onChange if the value has actually changed from the last notified value
    const currentValue = JSON.stringify({ timezone, slots, currentlyAvailable });
    if (currentValue !== lastNotifiedRef.current) {
      lastNotifiedRef.current = currentValue; // Update the ref BEFORE calling onChange
      onChangeRef.current?.({ timezone, slots, currentlyAvailable });
    }
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

    // If no drag movement (single click), toggle the single slot
    const { day, slot } = dragStart;
    const isSelected = isSlotSelected(day, slot);

    if (dragMode === "add" && !isSelected) {
      // Add single slot
      const filtered = slots.filter(
        (s) => s.day !== day || s.endSlot <= slot || s.startSlot > slot
      );
      setSlots([...filtered, { day, startSlot: slot, endSlot: slot + 1 }]);
    } else if (dragMode === "remove" && isSelected) {
      // Remove single slot - split or trim existing slots
      const newSlots: AvailabilitySlot[] = [];
      slots.forEach((s) => {
        if (s.day !== day || slot < s.startSlot || slot >= s.endSlot) {
          // Keep slots that don't contain this slot
          newSlots.push(s);
        } else {
          // This slot contains the clicked position - split it
          if (s.startSlot < slot) {
            newSlots.push({ day, startSlot: s.startSlot, endSlot: slot });
          }
          if (s.endSlot > slot + 1) {
            newSlots.push({ day, startSlot: slot + 1, endSlot: s.endSlot });
          }
        }
      });
      setSlots(newSlots);
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
    toast.success("Availability cleared");
  };

  const setPreset = (preset: string) => {
    const workSlots: AvailabilitySlot[] = [];

    switch (preset) {
      case "9-5":
        // 9am-5pm Mon-Fri
        for (let day = 0; day < 5; day++) {
          workSlots.push({ day, startSlot: 18, endSlot: 34 }); // 9:00 - 17:00
        }
        toast.success("Availability set to 9-5 Mon-Fri");
        break;
      case "10-6":
        // 10am-6pm Mon-Fri
        for (let day = 0; day < 5; day++) {
          workSlots.push({ day, startSlot: 20, endSlot: 36 }); // 10:00 - 18:00
        }
        toast.success("Availability set to 10-6 Mon-Fri");
        break;
      case "8-4":
        // 8am-4pm Mon-Fri
        for (let day = 0; day < 5; day++) {
          workSlots.push({ day, startSlot: 16, endSlot: 32 }); // 8:00 - 16:00
        }
        toast.success("Availability set to 8-4 Mon-Fri");
        break;
      case "evenings":
        // 6pm-10pm Mon-Fri
        for (let day = 0; day < 5; day++) {
          workSlots.push({ day, startSlot: 36, endSlot: 44 }); // 18:00 - 22:00
        }
        toast.success("Availability set to evenings (6-10pm) Mon-Fri");
        break;
      case "mornings":
        // 6am-12pm Mon-Fri
        for (let day = 0; day < 5; day++) {
          workSlots.push({ day, startSlot: 12, endSlot: 24 }); // 6:00 - 12:00
        }
        toast.success("Availability set to mornings (6am-12pm) Mon-Fri");
        break;
      case "weekends":
        // 10am-6pm Sat-Sun
        workSlots.push({ day: 5, startSlot: 20, endSlot: 36 }); // Saturday
        workSlots.push({ day: 6, startSlot: 20, endSlot: 36 }); // Sunday
        toast.success("Availability set to weekends 10-6");
        break;
      case "flexible":
        // 10am-8pm every day
        for (let day = 0; day < 7; day++) {
          workSlots.push({ day, startSlot: 20, endSlot: 40 }); // 10:00 - 20:00
        }
        toast.success("Availability set to flexible (10am-8pm daily)");
        break;
      default:
        // Default 9-5
        for (let day = 0; day < 5; day++) {
          workSlots.push({ day, startSlot: 18, endSlot: 34 });
        }
    }

    setSlots(workSlots);
  };

  // Legacy function for backward compatibility
  const setWorkHours = () => setPreset("9-5");

  // Format slot to time string (12-hour format)
  const formatSlotTime = (slot: number) => {
    const hour = Math.floor(slot / 2);
    const minute = (slot % 2) * 30;
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const ampm = hour < 12 ? "am" : "pm";
    return `${hour12}:${minute === 0 ? "00" : "30"}${ampm}`;
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
        {/* Timezone Selector - Searchable */}
        <Popover open={tzOpen} onOpenChange={setTzOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={tzOpen}
              className="w-[240px] justify-between font-normal"
              disabled={readOnly}
            >
              <div className="flex items-center gap-2 truncate">
                <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="truncate">
                  {TIMEZONE_OPTIONS.find((tz) => tz.value === timezone)?.label || timezone}
                </span>
              </div>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0" align="start">
            <div className="flex items-center border-b px-3 py-2">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder="Search timezone..."
                value={tzSearch}
                onChange={(e) => setTzSearch(e.target.value)}
                className="h-8 border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto p-1">
              {Object.entries(groupedTimezones).map(([region, timezones]) => (
                <div key={region}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    {region}
                  </div>
                  {timezones.map((tz) => (
                    <button
                      key={`${tz.value}-${tz.label}`}
                      onClick={() => {
                        setTimezone(tz.value);
                        setTzOpen(false);
                        setTzSearch("");
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground",
                        timezone === tz.value && "bg-accent"
                      )}
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          timezone === tz.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="truncate">{tz.label}</span>
                    </button>
                  ))}
                </div>
              ))}
              {filteredTimezones.length === 0 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No timezone found.
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

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
        <div className="flex flex-wrap gap-2">
          <Select onValueChange={setPreset}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Quick presets..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="9-5">9-5 Mon-Fri</SelectItem>
              <SelectItem value="10-6">10-6 Mon-Fri</SelectItem>
              <SelectItem value="8-4">8-4 Mon-Fri</SelectItem>
              <SelectItem value="mornings">Mornings (6am-12pm)</SelectItem>
              <SelectItem value="evenings">Evenings (6-10pm)</SelectItem>
              <SelectItem value="weekends">Weekends only</SelectItem>
              <SelectItem value="flexible">Flexible (10am-8pm daily)</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={clearAll}>
            Clear All
          </Button>
        </div>
      )}

      {/* Grid - GitHub contribution style */}
      <div className="bg-card rounded-xl border border-border p-4">
        {/* Hour Headers */}
        <div className="flex items-center mb-2">
          <div className="w-12 shrink-0" />
          <div className="flex-1 flex justify-between px-0.5">
            {[0, 6, 12, 18, 23].map((hour) => {
              const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
              const ampm = hour < 12 ? "am" : "pm";
              return (
                <span key={hour} className="text-[10px] text-muted-foreground font-medium">
                  {hour12}{ampm}
                </span>
              );
            })}
          </div>
        </div>

        {/* Day Rows */}
        <div className="space-y-1">
          {DAYS.map((day, dayIndex) => (
            <div key={day} className="flex items-center gap-1">
              {/* Day Label */}
              <div className="w-12 shrink-0 text-xs font-medium text-muted-foreground">
                {day}
              </div>
              {/* Time Slots - grouped by hour for better visual */}
              <div className="flex-1 flex gap-px">
                {TIME_SLOTS.map((slot, slotIndex) => {
                  const isSelected = isSlotSelected(dayIndex, slotIndex);
                  const isCurrentSlot = getCurrentDay() === dayIndex && getCurrentTimeSlot() === slotIndex;

                  return (
                    <div
                      key={slotIndex}
                      className={cn(
                        "flex-1 h-6 rounded-sm transition-colors cursor-pointer select-none",
                        isSelected
                          ? "bg-primary hover:bg-primary/80"
                          : "bg-muted hover:bg-accent",
                        isCurrentSlot && !isSelected && "ring-2 ring-primary/50",
                        readOnly && "cursor-default"
                      )}
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
      </div>

      {/* Legend & Summary */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-primary" />
            <span className="text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-muted" />
            <span className="text-muted-foreground">Busy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-muted ring-2 ring-primary/50" />
            <span className="text-muted-foreground">Current time</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="font-medium">
            {slots.reduce((acc, s) => acc + (s.endSlot - s.startSlot) / 2, 0)} hrs/week
          </span>
        </div>
      </div>

      {/* Slot Summary */}
      {slots.length > 0 && (
        <div className="text-sm space-y-1">
          <p className="font-medium text-foreground">Your availability: <span className="text-xs text-muted-foreground font-normal">(click to remove)</span></p>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day, dayIndex) => {
              const daySlots = slots.filter((s) => s.day === dayIndex);
              if (daySlots.length === 0) return null;

              return daySlots.map((slot, slotIdx) => (
                <Badge
                  key={`${day}-${slotIdx}`}
                  variant="secondary"
                  className={cn(
                    "font-normal gap-1 pr-1 rounded bg-muted/80 text-muted-foreground border border-border/50",
                    !readOnly && "cursor-pointer hover:bg-destructive/20 hover:text-destructive"
                  )}
                  onClick={() => {
                    if (readOnly) return;
                    setSlots(slots.filter((s) => !(s.day === dayIndex && s.startSlot === slot.startSlot && s.endSlot === slot.endSlot)));
                  }}
                >
                  {day}: {formatSlotTime(slot.startSlot)}-{formatSlotTime(slot.endSlot)}
                  {!readOnly && <X className="w-3 h-3 ml-1" />}
                </Badge>
              ));
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
