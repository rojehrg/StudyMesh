/**
 * Who's Now Handler
 *
 * Handles the /attunly whosnow command
 * Shows who's currently online (in working hours) across the team
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq, isNotNull, and } from "drizzle-orm";
import {
  isInWorkingHours,
  isInSleepWindow,
  getCurrentHourInTimezone,
} from "@/lib/timezone-utils";
import {
  getTimezoneAbbrev,
  getCurrentTimeFormatted,
  getTeamTimezoneSpread,
  UserAvailability,
} from "@/lib/availability";

export interface WhosNowCommandParams {
  teamId: string;
  userId: string;
  channelId: string;
}

interface SlackBlock {
  type: string;
  [key: string]: unknown;
}

interface TeamMember {
  slackUserId: string;
  firstName: string | null;
  timezone: string;
  currentTime: string;
  tzAbbrev: string;
  isAvailable: boolean;
  isSleeping: boolean;
  minutesUntilWorkStart: number | null;
}

/**
 * Calculate minutes until working hours start (9 AM)
 */
function getMinutesUntilWorkStart(timezone: string): number | null {
  const currentHour = getCurrentHourInTimezone(timezone);
  const workStartHour = 9;

  // If already in working hours or past them, return null
  if (currentHour >= workStartHour && currentHour < 18) {
    return null;
  }

  let hoursUntil: number;
  if (currentHour < workStartHour) {
    // Before work hours today
    hoursUntil = workStartHour - currentHour;
  } else {
    // After work hours, calculate until tomorrow 9 AM
    hoursUntil = 24 - currentHour + workStartHour;
  }

  return hoursUntil * 60;
}

/**
 * Format minutes until available as a human-readable string
 */
function formatMinutesUntil(minutes: number): string {
  if (minutes < 60) {
    return `~${minutes} min`;
  }
  const hours = Math.round(minutes / 60);
  if (hours === 1) {
    return "~1 hour";
  }
  return `~${hours} hours`;
}

/**
 * Build the response blocks for whosnow command
 */
function buildWhosNowBlocks(
  members: TeamMember[],
  requestingUserTz: string
): SlackBlock[] {
  const blocks: SlackBlock[] = [];

  // Header
  blocks.push({
    type: "header",
    text: {
      type: "plain_text",
      text: "Who's Online Now",
      emoji: false,
    },
  });

  // Separate into available, coming soon, and sleeping
  const available = members.filter((m) => m.isAvailable);
  const comingSoon = members.filter(
    (m) =>
      !m.isAvailable &&
      !m.isSleeping &&
      m.minutesUntilWorkStart !== null &&
      m.minutesUntilWorkStart <= 120
  );
  const sleeping = members.filter((m) => m.isSleeping);
  const offline = members.filter(
    (m) =>
      !m.isAvailable &&
      !m.isSleeping &&
      (m.minutesUntilWorkStart === null || m.minutesUntilWorkStart > 120)
  );

  // Available section
  if (available.length > 0) {
    const lines = available
      .map((m) => {
        const name = m.firstName || `<@${m.slackUserId}>`;
        return `*-* <@${m.slackUserId}> - ${m.currentTime} ${m.tzAbbrev}`;
      })
      .join("\n");

    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Available (working hours):*\n${lines}`,
      },
    });
  } else {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Available (working hours):*\nNo one is in working hours right now.",
      },
    });
  }

  // Coming online soon section
  if (comingSoon.length > 0) {
    blocks.push({ type: "divider" });

    const lines = comingSoon
      .map((m) => {
        const timeUntil = m.minutesUntilWorkStart
          ? formatMinutesUntil(m.minutesUntilWorkStart)
          : "";
        return `*-* <@${m.slackUserId}> - starts in ${timeUntil}`;
      })
      .join("\n");

    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Coming online soon:*\n${lines}`,
      },
    });
  }

  // Calculate team timezone spread
  const memberAvailabilities: UserAvailability[] = members.map((m) => ({
    userId: m.slackUserId,
    timezone: m.timezone,
    slots: [], // Not needed for spread calculation
    currentlyAvailable: m.isAvailable,
  }));

  if (memberAvailabilities.length > 1) {
    const spread = getTeamTimezoneSpread(memberAvailabilities);

    blocks.push({ type: "divider" });
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `Team timezone spread: ${Math.round(spread.spreadHours)}h | Working hours overlap: ${Math.round(spread.overlappingWorkingHours)}h/day`,
        },
      ],
    });
  }

  return blocks;
}

/**
 * Handle the /attunly whosnow command
 *
 * Returns an ephemeral message showing who's currently in working hours
 */
export async function handleWhosNowCommand(
  params: WhosNowCommandParams
): Promise<NextResponse> {
  const { teamId, userId } = params;

  console.log("[WhosNow Command] Processing", { teamId, userId });

  try {
    // Get all team members with Slack connected and timezone set
    const teamMembers = await db
      .select({
        slackUserId: profiles.slackUserId,
        firstName: profiles.firstName,
        timezone: profiles.timezone,
      })
      .from(profiles)
      .where(
        and(
          eq(profiles.slackTeamId, teamId),
          eq(profiles.slackConnected, true),
          isNotNull(profiles.slackUserId),
          isNotNull(profiles.timezone)
        )
      );

    console.log("[WhosNow Command] Found team members", {
      count: teamMembers.length,
    });

    if (teamMembers.length === 0) {
      return NextResponse.json({
        response_type: "ephemeral",
        text: "No team members found with timezone information. Team members need to connect Slack and set their timezone.",
      });
    }

    // Get requesting user's timezone
    const requestingUser = teamMembers.find((m) => m.slackUserId === userId);
    const requestingUserTz = requestingUser?.timezone || "UTC";

    // Build member status list
    const members: TeamMember[] = teamMembers
      .filter((m) => m.slackUserId) // TypeScript guard
      .map((m) => {
        const tz = m.timezone || "UTC";
        const isAvailable = isInWorkingHours(tz);
        const isSleeping = isInSleepWindow(tz);

        return {
          slackUserId: m.slackUserId!,
          firstName: m.firstName,
          timezone: tz,
          currentTime: getCurrentTimeFormatted(tz),
          tzAbbrev: getTimezoneAbbrev(tz),
          isAvailable,
          isSleeping,
          minutesUntilWorkStart: getMinutesUntilWorkStart(tz),
        };
      })
      // Sort: available first, then by time until work starts
      .sort((a, b) => {
        if (a.isAvailable && !b.isAvailable) return -1;
        if (!a.isAvailable && b.isAvailable) return 1;
        if (a.minutesUntilWorkStart === null) return 1;
        if (b.minutesUntilWorkStart === null) return -1;
        return a.minutesUntilWorkStart - b.minutesUntilWorkStart;
      });

    // Build response blocks
    const blocks = buildWhosNowBlocks(members, requestingUserTz);

    const availableCount = members.filter((m) => m.isAvailable).length;
    const summaryText =
      availableCount === 0
        ? "No team members are in working hours right now."
        : `${availableCount} team member${availableCount !== 1 ? "s" : ""} in working hours.`;

    return NextResponse.json({
      response_type: "ephemeral",
      text: summaryText,
      blocks,
    });
  } catch (error) {
    console.error("[WhosNow Command] Error:", error);

    return NextResponse.json({
      response_type: "ephemeral",
      text: "Something went wrong. Please try again.",
    });
  }
}
