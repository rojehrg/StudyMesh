/**
 * Timezone Utilities
 *
 * Functions for:
 * - Getting working hours boundaries
 * - Detecting sleep windows
 * - Formatting relative timezone differences
 * - Checking if currently in working hours
 */

/**
 * Get the UTC offset in minutes for a timezone at a given date
 */
export function getTimezoneOffset(timezone: string, date: Date = new Date()): number {
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const tzDate = new Date(date.toLocaleString("en-US", { timeZone: timezone }));
  return (tzDate.getTime() - utcDate.getTime()) / 60000;
}

/**
 * Get the current hour (0-23) in a specific timezone
 */
export function getCurrentHourInTimezone(timezone: string): number {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    hour12: false,
  });
  return parseInt(formatter.format(now), 10);
}

/**
 * Get working hours end time for a timezone (default: 6:00 PM local)
 * Returns time string like "6:00 PM"
 */
export function getWorkingHoursEnd(timezone: string, endHour: number = 18): string {
  const now = new Date();
  const tzDate = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  tzDate.setHours(endHour, 0, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(tzDate);
}

/**
 * Get working hours start time for a timezone (default: 9:00 AM local)
 * Returns time string like "9:00 AM"
 */
export function getWorkingHoursStart(timezone: string, startHour: number = 9): string {
  const now = new Date();
  const tzDate = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  tzDate.setHours(startHour, 0, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(tzDate);
}

/**
 * Get sleep window start time (default: 10:00 PM local)
 * Returns time string like "10:00 PM"
 */
export function getSleepWindowStart(timezone: string, sleepHour: number = 22): string {
  const now = new Date();
  const tzDate = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  tzDate.setHours(sleepHour, 0, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(tzDate);
}

/**
 * Get sleep window end time (default: 7:00 AM local)
 * Returns time string like "7:00 AM"
 */
export function getSleepWindowEnd(timezone: string, wakeHour: number = 7): string {
  const now = new Date();
  const tzDate = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  tzDate.setHours(wakeHour, 0, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(tzDate);
}

/**
 * Check if current time is within working hours (default: 9 AM - 6 PM local)
 */
export function isInWorkingHours(
  timezone: string,
  startHour: number = 9,
  endHour: number = 18
): boolean {
  const currentHour = getCurrentHourInTimezone(timezone);
  return currentHour >= startHour && currentHour < endHour;
}

/**
 * Check if current time is within sleep window (default: 10 PM - 7 AM local)
 */
export function isInSleepWindow(
  timezone: string,
  sleepStartHour: number = 22,
  sleepEndHour: number = 7
): boolean {
  const currentHour = getCurrentHourInTimezone(timezone);
  // Sleep window spans midnight
  return currentHour >= sleepStartHour || currentHour < sleepEndHour;
}

/**
 * Format relative timezone difference between two timezones
 * Returns string like "9 hours ahead" or "3 hours behind" or "same timezone"
 */
export function formatRelativeTimezone(fromTz: string, toTz: string): string {
  const now = new Date();
  const fromOffset = getTimezoneOffset(fromTz, now);
  const toOffset = getTimezoneOffset(toTz, now);

  const diffMinutes = toOffset - fromOffset;

  if (diffMinutes === 0) {
    return "same timezone";
  }

  const diffHours = Math.abs(diffMinutes) / 60;
  const direction = diffMinutes > 0 ? "ahead" : "behind";

  // Handle half-hour timezones
  if (diffHours % 1 !== 0) {
    const hours = Math.floor(diffHours);
    const minutes = Math.round((diffHours % 1) * 60);
    if (hours === 0) {
      return `${minutes} min ${direction}`;
    }
    return `${hours}h ${minutes}m ${direction}`;
  }

  if (diffHours === 1) {
    return `1 hour ${direction}`;
  }

  return `${Math.round(diffHours)} hours ${direction}`;
}

/**
 * Get the hour offset difference between two timezones
 * Positive means toTz is ahead of fromTz
 */
export function getTimezoneHourDiff(fromTz: string, toTz: string): number {
  const now = new Date();
  const fromOffset = getTimezoneOffset(fromTz, now);
  const toOffset = getTimezoneOffset(toTz, now);
  return (toOffset - fromOffset) / 60;
}

/**
 * Convert a Date to a specific timezone and return a formatted string
 */
export function formatTimeInTimezone(
  date: Date,
  timezone: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  return new Intl.DateTimeFormat("en-US", { ...defaultOptions, ...options }).format(date);
}

/**
 * Format a date with both local and remote timezone displays
 * Returns object with both time strings and timezone abbreviations
 */
export function formatDualTimezone(
  date: Date,
  localTz: string,
  remoteTz: string,
  getAbbrev: (tz: string) => string
): {
  localTime: string;
  remoteTime: string;
  localTzAbbrev: string;
  remoteTzAbbrev: string;
} {
  return {
    localTime: formatTimeInTimezone(date, localTz),
    remoteTime: formatTimeInTimezone(date, remoteTz),
    localTzAbbrev: getAbbrev(localTz),
    remoteTzAbbrev: getAbbrev(remoteTz),
  };
}

/**
 * Get the next occurrence of a specific hour in a timezone
 * Useful for "end of their day" type calculations
 */
export function getNextOccurrenceOfHour(
  timezone: string,
  targetHour: number,
  baseDate: Date = new Date()
): Date {
  // Get current time in target timezone
  const tzDateStr = baseDate.toLocaleString("en-US", { timeZone: timezone });
  const currentTzDate = new Date(tzDateStr);
  const currentHour = currentTzDate.getHours();

  // Calculate hours until target
  let hoursUntil = targetHour - currentHour;
  if (hoursUntil <= 0) {
    hoursUntil += 24; // Next day
  }

  // Create result date
  const result = new Date(baseDate);
  result.setTime(result.getTime() + hoursUntil * 60 * 60 * 1000);

  // Set to exact hour in target timezone
  const resultTzStr = result.toLocaleString("en-US", { timeZone: timezone });
  const resultTzDate = new Date(resultTzStr);
  const minuteOffset = resultTzDate.getMinutes();
  const secondOffset = resultTzDate.getSeconds();

  result.setTime(result.getTime() - minuteOffset * 60 * 1000 - secondOffset * 1000);

  return result;
}

/**
 * Get suggested deadline times based on owner's timezone
 * Returns array of deadline options with labels
 */
export function getSuggestedDeadlines(
  ownerTimezone: string,
  requesterTimezone: string,
  getAbbrev: (tz: string) => string
): Array<{
  label: string;
  date: Date;
  ownerTime: string;
  requesterTime: string;
}> {
  const now = new Date();
  const suggestions: Array<{
    label: string;
    date: Date;
    ownerTime: string;
    requesterTime: string;
  }> = [];

  // End of their working day (6 PM owner time)
  const endOfDay = getNextOccurrenceOfHour(ownerTimezone, 18, now);
  suggestions.push({
    label: "End of their day",
    date: endOfDay,
    ownerTime: `6:00 PM ${getAbbrev(ownerTimezone)}`,
    requesterTime: formatTimeInTimezone(endOfDay, requesterTimezone) + ` ${getAbbrev(requesterTimezone)}`,
  });

  // Tomorrow morning (9 AM owner time, next day)
  const tomorrowMorning = getNextOccurrenceOfHour(ownerTimezone, 9, now);
  if (tomorrowMorning.getTime() - now.getTime() < 12 * 60 * 60 * 1000) {
    // If less than 12 hours away, push to next day
    tomorrowMorning.setTime(tomorrowMorning.getTime() + 24 * 60 * 60 * 1000);
  }
  suggestions.push({
    label: "Tomorrow morning (their time)",
    date: tomorrowMorning,
    ownerTime: `9:00 AM ${getAbbrev(ownerTimezone)}`,
    requesterTime: formatTimeInTimezone(tomorrowMorning, requesterTimezone) + ` ${getAbbrev(requesterTimezone)}`,
  });

  // 24 hours from now
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  suggestions.push({
    label: "In 24 hours",
    date: in24Hours,
    ownerTime: formatTimeInTimezone(in24Hours, ownerTimezone) + ` ${getAbbrev(ownerTimezone)}`,
    requesterTime: formatTimeInTimezone(in24Hours, requesterTimezone) + ` ${getAbbrev(requesterTimezone)}`,
  });

  // 48 hours from now
  const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  suggestions.push({
    label: "In 48 hours",
    date: in48Hours,
    ownerTime: formatTimeInTimezone(in48Hours, ownerTimezone) + ` ${getAbbrev(ownerTimezone)}`,
    requesterTime: formatTimeInTimezone(in48Hours, requesterTimezone) + ` ${getAbbrev(requesterTimezone)}`,
  });

  // End of week (Friday 6 PM owner time)
  const endOfWeek = getNextFridayEvening(ownerTimezone);
  if (endOfWeek.getTime() > now.getTime() + 24 * 60 * 60 * 1000) {
    suggestions.push({
      label: "End of week",
      date: endOfWeek,
      ownerTime: `Friday 6:00 PM ${getAbbrev(ownerTimezone)}`,
      requesterTime: formatTimeInTimezone(endOfWeek, requesterTimezone) + ` ${getAbbrev(requesterTimezone)}`,
    });
  }

  return suggestions;
}

/**
 * Get next Friday 6 PM in a timezone
 */
function getNextFridayEvening(timezone: string): Date {
  const now = new Date();
  const tzDateStr = now.toLocaleString("en-US", { timeZone: timezone });
  const tzDate = new Date(tzDateStr);

  const currentDay = tzDate.getDay(); // 0 = Sunday, 5 = Friday
  let daysUntilFriday = (5 - currentDay + 7) % 7;

  // If it's Friday but past 6 PM, go to next Friday
  if (daysUntilFriday === 0 && tzDate.getHours() >= 18) {
    daysUntilFriday = 7;
  }

  const fridayEvening = new Date(now);
  fridayEvening.setTime(fridayEvening.getTime() + daysUntilFriday * 24 * 60 * 60 * 1000);

  // Set to 6 PM in target timezone
  return getNextOccurrenceOfHour(timezone, 18, new Date(fridayEvening.getTime() - 6 * 60 * 60 * 1000));
}
