/**
 * Calendar URL Generator Utilities
 *
 * Generates URLs for adding events to various calendar providers.
 */

export interface CalendarEventParams {
  title: string;
  startTime: Date;
  durationMinutes: number;
  description?: string;
  location?: string;
}

/**
 * Format a date for Google Calendar URL (YYYYMMDDTHHMMSSZ format)
 */
function formatGoogleCalendarDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Generate a Google Calendar URL that opens the calendar with a pre-filled event
 */
export function generateGoogleCalendarUrl(params: CalendarEventParams): string {
  const { title, startTime, durationMinutes, description, location } = params;

  // Calculate end time
  const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

  const baseUrl = 'https://calendar.google.com/calendar/render';
  const urlParams = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${formatGoogleCalendarDate(startTime)}/${formatGoogleCalendarDate(endTime)}`,
    details: description || '',
    location: location || '',
  });

  return `${baseUrl}?${urlParams.toString()}`;
}
