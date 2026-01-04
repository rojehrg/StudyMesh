import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decryptToken, encryptToken } from "@/lib/encryption";
import { createLogger } from "@/lib/logger";

const log = createLogger({ service: 'calendar', action: 'events' });

interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  status: string;
}

interface BusySlot {
  day: number; // 0-6 (Sun-Sat)
  startHour: number;
  endHour: number;
}

/**
 * Refresh Google access token using refresh token
 */
async function refreshGoogleToken(refreshToken: string): Promise<{ access_token: string; expires_in: number } | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

/**
 * GET /api/calendar/events
 *
 * Fetches events from Google Calendar for the current week.
 * Returns busy slots that can be used to update availability.
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get Google Calendar credentials
    const { data: credentials } = await supabase
      .from('user_provider_credentials')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'google_calendar')
      .single();

    if (!credentials) {
      return NextResponse.json({
        error: "Google Calendar not connected",
        connected: false
      }, { status: 400 });
    }

    let accessToken = decryptToken(credentials.access_token);
    const refreshToken = credentials.refresh_token ? decryptToken(credentials.refresh_token) : null;

    // Check if token is expired
    const tokenExpiry = new Date(credentials.token_expires_at);
    if (tokenExpiry < new Date()) {
      if (!refreshToken) {
        return NextResponse.json({
          error: "Token expired and no refresh token available",
          connected: false
        }, { status: 401 });
      }

      // Refresh the token
      const newTokens = await refreshGoogleToken(refreshToken);
      if (!newTokens) {
        return NextResponse.json({
          error: "Failed to refresh token",
          connected: false
        }, { status: 401 });
      }

      accessToken = newTokens.access_token;
      const newExpiry = new Date(Date.now() + newTokens.expires_in * 1000);

      // Update stored token
      await supabase
        .from('user_provider_credentials')
        .update({
          access_token: encryptToken(accessToken),
          token_expires_at: newExpiry.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('provider', 'google_calendar');
    }

    // Get events for the next 7 days
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
      new URLSearchParams({
        timeMin: startOfWeek.toISOString(),
        timeMax: endOfWeek.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '100',
      }),
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!calendarResponse.ok) {
      const errorData = await calendarResponse.json().catch(() => ({}));
      log.error('Failed to fetch calendar events', {
        status: calendarResponse.status,
        error: errorData
      });
      return NextResponse.json({
        error: "Failed to fetch calendar events",
        connected: true
      }, { status: 500 });
    }

    const calendarData = await calendarResponse.json();
    const events: CalendarEvent[] = (calendarData.items || [])
      .filter((event: any) => event.start?.dateTime && event.end?.dateTime)
      .map((event: any) => ({
        id: event.id,
        summary: event.summary || 'Busy',
        start: event.start.dateTime,
        end: event.end.dateTime,
        status: event.status,
      }));

    // Convert events to busy slots for the availability grid
    const busySlots: BusySlot[] = events
      .filter(event => event.status !== 'cancelled')
      .map(event => {
        const start = new Date(event.start);
        const end = new Date(event.end);
        return {
          day: start.getDay(),
          startHour: start.getHours(),
          endHour: end.getHours() || 24,
        };
      });

    // Aggregate busy hours per day
    const busyByDay: Record<number, Set<number>> = {};
    for (const slot of busySlots) {
      if (!busyByDay[slot.day]) {
        busyByDay[slot.day] = new Set();
      }
      for (let h = slot.startHour; h < slot.endHour; h++) {
        busyByDay[slot.day].add(h);
      }
    }

    // Convert to array format for frontend
    const busyHours = Object.entries(busyByDay).map(([day, hours]) => ({
      day: parseInt(day),
      hours: Array.from(hours).sort((a, b) => a - b),
    }));

    log.info('Fetched calendar events', {
      userId: user.id,
      eventCount: events.length
    });

    return NextResponse.json({
      success: true,
      connected: true,
      email: credentials.provider_email,
      events,
      busyHours,
    });
  } catch (error: any) {
    log.error('Calendar events error', { error: error.message });
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
