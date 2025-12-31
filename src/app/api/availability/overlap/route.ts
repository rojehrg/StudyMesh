import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Availability slot format from profiles.availability JSON
interface ProfileAvailabilitySlot {
  day: number;      // 0-6 (Mon-Sun)
  startSlot: number; // 0-47 (30-min intervals)
  endSlot: number;
}

interface TimeRange {
  start: number; // minutes from midnight
  end: number;   // minutes from midnight
}

// Convert slot number (0-47) to minutes from midnight
function slotToMinutes(slot: number): number {
  return slot * 30; // Each slot is 30 minutes
}

// Convert minutes from midnight to time string "HH:MM"
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Find overlapping time ranges
function findOverlap(ranges: TimeRange[][]): TimeRange[] {
  if (ranges.length === 0) return [];
  if (ranges.length === 1) return ranges[0];

  // Start with the first user's ranges
  let overlap = ranges[0];

  // Intersect with each subsequent user's ranges
  for (let i = 1; i < ranges.length; i++) {
    const newOverlap: TimeRange[] = [];

    for (const range1 of overlap) {
      for (const range2 of ranges[i]) {
        const start = Math.max(range1.start, range2.start);
        const end = Math.min(range1.end, range2.end);

        if (start < end) {
          newOverlap.push({ start, end });
        }
      }
    }

    overlap = newOverlap;
    if (overlap.length === 0) break;
  }

  // Merge overlapping ranges
  overlap.sort((a, b) => a.start - b.start);
  const merged: TimeRange[] = [];

  for (const range of overlap) {
    if (merged.length === 0 || merged[merged.length - 1].end < range.start) {
      merged.push(range);
    } else {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, range.end);
    }
  }

  return merged;
}

// Filter slots that can fit the required duration
function filterByDuration(ranges: TimeRange[], durationMinutes: number): TimeRange[] {
  return ranges.filter(range => (range.end - range.start) >= durationMinutes);
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userIds, dayOfWeek, durationMinutes = 30 } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "userIds array is required" }, { status: 400 });
    }

    // Get availability from profiles table (stored as JSON in availability column)
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('user_id, availability, timezone, first_name, last_name')
      .in('user_id', userIds);

    if (error) {
      throw error;
    }

    // Parse availability slots from profiles
    // The availability JSON format: { slots: [{ day, startSlot, endSlot }], currentlyAvailable, lookingToHelp }
    const userAvailabilityMap: Record<string, ProfileAvailabilitySlot[]> = {};

    for (const profile of profiles || []) {
      const availability = profile.availability as { slots?: ProfileAvailabilitySlot[] } | null;
      userAvailabilityMap[profile.user_id] = availability?.slots || [];
    }

    // Group by day
    const result: Record<number, { slots: Array<{ start: string; end: string }> }> = {};

    // Note: availability uses day 0-6 as Mon-Sun, but we need to handle this consistently
    // The frontend may pass dayOfWeek as 0-6 (Sun-Sat) or 0-6 (Mon-Sun) depending on context
    // We'll use 0-6 (Mon-Sun) to match the stored format
    const daysToProcess = dayOfWeek !== undefined ? [dayOfWeek] : [0, 1, 2, 3, 4, 5, 6];

    for (const day of daysToProcess) {
      // Group slots by user for this day
      const userSlots: Record<string, TimeRange[]> = {};

      for (const userId of userIds) {
        const slots = userAvailabilityMap[userId] || [];
        const daySlots = slots.filter(s => s.day === day);

        if (daySlots.length > 0) {
          userSlots[userId] = daySlots.map(slot => ({
            start: slotToMinutes(slot.startSlot),
            end: slotToMinutes(slot.endSlot)
          }));
        }
      }

      // Check if all requested users have availability on this day
      const usersWithAvailability = Object.keys(userSlots);
      if (usersWithAvailability.length < userIds.length) {
        result[day] = { slots: [] };
        continue;
      }

      // Find overlapping slots
      const allRanges = userIds.map(id => userSlots[id] || []);
      const overlappingRanges = findOverlap(allRanges);

      // Filter by duration
      const validSlots = filterByDuration(overlappingRanges, durationMinutes);

      // Convert back to time strings
      result[day] = {
        slots: validSlots.map(range => ({
          start: minutesToTime(range.start),
          end: minutesToTime(range.end)
        }))
      };
    }

    // We already have profiles from the initial query
    const profilesForDisplay = (profiles || []).map(p => ({
      user_id: p.user_id,
      first_name: p.first_name,
      last_name: p.last_name,
      timezone: p.timezone
    }));

    return NextResponse.json({
      success: true,
      userIds,
      durationMinutes,
      overlap: result,
      profiles: profilesForDisplay,
      // Note: dayNames index 0 = Monday since we use Mon-Sun (0-6) format
      dayNames: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    });
  } catch (error) {
    console.error("Error finding availability overlap:", error);
    return NextResponse.json(
      { error: "Failed to find availability overlap" },
      { status: 500 }
    );
  }
}
