/**
 * Availability Utilities
 *
 * Functions for:
 * - Finding overlapping availability between users
 * - Suggesting meeting times
 * - Converting between timezones
 */

interface AvailabilitySlot {
  day: number; // 0-6 (Mon-Sun)
  startSlot: number; // 0-47 (30-min intervals)
  endSlot: number;
}

interface UserAvailability {
  userId: string;
  timezone: string;
  slots: AvailabilitySlot[];
  currentlyAvailable: boolean;
}

interface SuggestedMeetingTime {
  day: string;
  dayIndex: number;
  startSlot: number;
  endSlot: number;
  timeUserA: string;
  timeUserB: string;
  timezoneA: string;
  timezoneB: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/**
 * Convert a slot number to a time string in a specific timezone
 */
function slotToTime(slot: number, timezone: string): string {
  const hour = Math.floor(slot / 2);
  const minute = (slot % 2) * 30;

  // Create a date object for today at the specified time in UTC
  const now = new Date();
  const utcDate = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    hour,
    minute
  ));

  // Format in the target timezone
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  }).format(utcDate);
}

/**
 * Get timezone abbreviation
 */
function getTimezoneAbbrev(timezone: string): string {
  const abbrevMap: Record<string, string> = {
    "America/Los_Angeles": "PT",
    "America/Denver": "MT",
    "America/Chicago": "CT",
    "America/New_York": "ET",
    "UTC": "UTC",
    "Europe/London": "GMT",
    "Europe/Paris": "CET",
    "Europe/Berlin": "CET",
    "Europe/Istanbul": "TRT",
    "Asia/Dubai": "GST",
    "Asia/Kolkata": "IST",
    "Asia/Singapore": "SGT",
    "Asia/Tokyo": "JST",
    "Australia/Sydney": "AEDT",
  };
  return abbrevMap[timezone] || timezone.split("/").pop()?.slice(0, 3) || "???";
}

/**
 * Convert slots from one timezone to another
 * Note: This is a simplified conversion for display purposes
 */
function convertSlotToTimezone(
  slot: number,
  fromTimezone: string,
  toTimezone: string
): number {
  // Get the UTC offset difference between timezones
  const now = new Date();

  const fromOffset = getTimezoneOffset(fromTimezone, now);
  const toOffset = getTimezoneOffset(toTimezone, now);

  // Difference in 30-min slots
  const diffSlots = Math.round((toOffset - fromOffset) / 30);

  let newSlot = slot + diffSlots;

  // Wrap around if needed
  if (newSlot < 0) newSlot += 48;
  if (newSlot >= 48) newSlot -= 48;

  return newSlot;
}

/**
 * Get timezone offset in minutes from UTC
 */
function getTimezoneOffset(timezone: string, date: Date): number {
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const tzDate = new Date(date.toLocaleString("en-US", { timeZone: timezone }));
  return (tzDate.getTime() - utcDate.getTime()) / 60000;
}

/**
 * Find overlapping availability slots between two users
 */
export function findOverlappingSlots(
  userA: UserAvailability,
  userB: UserAvailability
): AvailabilitySlot[] {
  const overlaps: AvailabilitySlot[] = [];

  // For each day
  for (let day = 0; day < 7; day++) {
    const slotsA = userA.slots.filter((s) => s.day === day);
    const slotsB = userB.slots.filter((s) => s.day === day);

    // Convert B's slots to A's timezone for comparison
    const convertedSlotsB = slotsB.map((slot) => ({
      ...slot,
      startSlot: convertSlotToTimezone(slot.startSlot, userB.timezone, userA.timezone),
      endSlot: convertSlotToTimezone(slot.endSlot, userB.timezone, userA.timezone),
    }));

    // Find overlaps
    slotsA.forEach((slotA) => {
      convertedSlotsB.forEach((slotB) => {
        const overlapStart = Math.max(slotA.startSlot, slotB.startSlot);
        const overlapEnd = Math.min(slotA.endSlot, slotB.endSlot);

        if (overlapStart < overlapEnd) {
          overlaps.push({
            day,
            startSlot: overlapStart,
            endSlot: overlapEnd,
          });
        }
      });
    });
  }

  return overlaps;
}

/**
 * Suggest meeting times based on overlapping availability
 */
export function suggestMeetingTimes(
  userA: UserAvailability,
  userB: UserAvailability,
  durationMinutes: 15 | 30 | 60 = 30,
  maxSuggestions: number = 3
): SuggestedMeetingTime[] {
  const durationSlots = durationMinutes / 30; // Convert to 30-min slot units
  const overlaps = findOverlappingSlots(userA, userB);
  const suggestions: SuggestedMeetingTime[] = [];

  // Get current day and time to prioritize upcoming slots
  const now = new Date();
  const currentDay = now.getDay() === 0 ? 6 : now.getDay() - 1; // Convert to Mon=0
  const currentHour = now.getHours();
  const currentSlot = currentHour * 2 + (now.getMinutes() >= 30 ? 1 : 0);

  // Sort overlaps: prioritize current day first, then upcoming days
  const sortedOverlaps = [...overlaps].sort((a, b) => {
    // Days from today (0 = today, 1 = tomorrow, etc.)
    const daysFromTodayA = (a.day - currentDay + 7) % 7;
    const daysFromTodayB = (b.day - currentDay + 7) % 7;

    if (daysFromTodayA !== daysFromTodayB) {
      return daysFromTodayA - daysFromTodayB;
    }

    // If same day, sort by start time
    return a.startSlot - b.startSlot;
  });

  for (const overlap of sortedOverlaps) {
    if (suggestions.length >= maxSuggestions) break;

    // Check if slot is long enough for the meeting
    if (overlap.endSlot - overlap.startSlot < durationSlots) continue;

    // Skip slots in the past (for today only)
    if (overlap.day === currentDay && overlap.startSlot < currentSlot) continue;

    // Find a suitable meeting time within this overlap
    let meetingStart = overlap.startSlot;

    // Prefer round hours if possible
    if (meetingStart % 2 === 1 && meetingStart + 1 + durationSlots <= overlap.endSlot) {
      meetingStart += 1;
    }

    const meetingEnd = meetingStart + durationSlots;
    if (meetingEnd > overlap.endSlot) continue;

    // Format times for both users
    const timeA = formatSlotRange(meetingStart, meetingEnd, userA.timezone);
    const timeB = formatSlotRange(meetingStart, meetingEnd, userB.timezone);

    suggestions.push({
      day: DAYS[overlap.day],
      dayIndex: overlap.day,
      startSlot: meetingStart,
      endSlot: meetingEnd,
      timeUserA: timeA,
      timeUserB: timeB,
      timezoneA: getTimezoneAbbrev(userA.timezone),
      timezoneB: getTimezoneAbbrev(userB.timezone),
    });
  }

  return suggestions;
}

/**
 * Format a slot range as a readable time string
 */
function formatSlotRange(startSlot: number, endSlot: number, timezone: string): string {
  const startHour = Math.floor(startSlot / 2);
  const startMin = (startSlot % 2) * 30;
  const endHour = Math.floor(endSlot / 2);
  const endMin = (endSlot % 2) * 30;

  const formatTime = (hour: number, min: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${min.toString().padStart(2, "0")}${period}`;
  };

  return `${formatTime(startHour, startMin)}-${formatTime(endHour, endMin)}`;
}

/**
 * Format a suggested meeting time for display
 */
export function formatSuggestedTime(suggestion: SuggestedMeetingTime): string {
  if (suggestion.timezoneA === suggestion.timezoneB) {
    return `${suggestion.day} ${suggestion.timeUserA} ${suggestion.timezoneA}`;
  }
  return `${suggestion.day} ${suggestion.timeUserA} ${suggestion.timezoneA} / ${suggestion.timeUserB} ${suggestion.timezoneB}`;
}

/**
 * Check if a user is currently in an available slot
 */
export function isCurrentlyInAvailableSlot(availability: UserAvailability): boolean {
  const now = new Date();
  const day = now.getDay() === 0 ? 6 : now.getDay() - 1; // Mon = 0
  const slot = now.getHours() * 2 + (now.getMinutes() >= 30 ? 1 : 0);

  return availability.slots.some(
    (s) => s.day === day && slot >= s.startSlot && slot < s.endSlot
  );
}

/**
 * Get a human-readable availability summary
 */
export function getAvailabilitySummary(slots: AvailabilitySlot[]): string {
  if (slots.length === 0) return "No availability set";

  const totalHours = slots.reduce((acc, s) => acc + (s.endSlot - s.startSlot) / 2, 0);
  const daysActive = new Set(slots.map((s) => s.day)).size;

  return `${totalHours}h across ${daysActive} day${daysActive === 1 ? "" : "s"}`;
}

/**
 * Get time until next available slot
 */
export function getTimeUntilNextAvailable(availability: UserAvailability): string | null {
  if (availability.slots.length === 0) return null;

  const now = new Date();
  const currentDay = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const currentSlot = now.getHours() * 2 + (now.getMinutes() >= 30 ? 1 : 0);

  // Find the next available slot
  let nearestMinutes = Infinity;

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const checkDay = (currentDay + dayOffset) % 7;
    const daySlots = availability.slots.filter((s) => s.day === checkDay);

    for (const slot of daySlots) {
      let slotStart = slot.startSlot;

      // If checking today, only consider future slots
      if (dayOffset === 0 && slotStart <= currentSlot) {
        if (currentSlot < slot.endSlot) {
          // Currently in this slot
          return "Free now";
        }
        continue;
      }

      const minutesFromNow = dayOffset * 24 * 60 + (slotStart / 2 - now.getHours()) * 60 - now.getMinutes();
      if (minutesFromNow > 0 && minutesFromNow < nearestMinutes) {
        nearestMinutes = minutesFromNow;
      }
    }
  }

  if (nearestMinutes === Infinity) return null;

  if (nearestMinutes < 60) {
    return `Free in ${Math.round(nearestMinutes)} min`;
  } else if (nearestMinutes < 24 * 60) {
    return `Free in ${Math.round(nearestMinutes / 60)} hours`;
  } else {
    return `Free in ${Math.round(nearestMinutes / (24 * 60))} days`;
  }
}
