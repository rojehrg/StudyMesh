import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface AvailabilitySlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
  label?: string;
}

interface TimeRange {
  start: number; // minutes from midnight
  end: number;   // minutes from midnight
}

// Convert time string "HH:MM" to minutes from midnight
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
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

    // Get availability for all users
    const { data: availabilities, error } = await supabase
      .from('availability_schedules')
      .select('user_id, day_of_week, start_time, end_time, label')
      .in('user_id', userIds);

    if (error) {
      throw error;
    }

    // Group by day
    const result: Record<number, { slots: Array<{ start: string; end: string }> }> = {};

    // If specific day is requested
    const daysToProcess = dayOfWeek !== undefined ? [dayOfWeek] : [0, 1, 2, 3, 4, 5, 6];

    for (const day of daysToProcess) {
      // Group slots by user for this day
      const userSlots: Record<string, TimeRange[]> = {};

      for (const slot of availabilities || []) {
        if (slot.day_of_week !== day) continue;

        const userId = slot.user_id;
        if (!userSlots[userId]) {
          userSlots[userId] = [];
        }

        userSlots[userId].push({
          start: timeToMinutes(slot.start_time),
          end: timeToMinutes(slot.end_time)
        });
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

    // Get user profiles for display
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name, timezone')
      .in('user_id', userIds);

    return NextResponse.json({
      success: true,
      userIds,
      durationMinutes,
      overlap: result,
      profiles: profiles || [],
      dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    });
  } catch (error) {
    console.error("Error finding availability overlap:", error);
    return NextResponse.json(
      { error: "Failed to find availability overlap" },
      { status: 500 }
    );
  }
}
