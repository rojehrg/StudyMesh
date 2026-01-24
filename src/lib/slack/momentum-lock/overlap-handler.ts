/**
 * Overlap Handler
 *
 * Handles the /attunly overlap @user command
 * Shows working hour overlap between two users and suggests best meeting times
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq, and, or, isNotNull } from "drizzle-orm";
import {
  getTimezoneHourDiff,
  formatRelativeTimezone,
} from "@/lib/timezone-utils";
import {
  getTimezoneAbbrev,
  getCurrentTimeFormatted,
  UserAvailability,
  findOverlappingSlots,
  suggestMeetingTimes,
} from "@/lib/availability";

export interface OverlapCommandParams {
  teamId: string;
  userId: string;
  targetUserId: string;
  channelId: string;
}

interface SlackBlock {
  type: string;
  [key: string]: unknown;
}

/**
 * Calculate working hours overlap in hours per day
 * Assumes 9 AM - 6 PM working hours (9 hours)
 */
function calculateWorkingHoursOverlap(
  userTz: string,
  targetTz: string
): number {
  const hourDiff = Math.abs(getTimezoneHourDiff(userTz, targetTz));
  const workingHours = 9; // 9 AM to 6 PM

  // If the time difference is less than working hours, there's overlap
  const overlap = Math.max(0, workingHours - hourDiff);
  return Math.round(overlap);
}

/**
 * Generate suggested meeting times based on timezone overlap
 */
function getSuggestedTimes(
  userTz: string,
  targetTz: string
): Array<{ userTime: string; targetTime: string; label: string }> {
  const suggestions: Array<{ userTime: string; targetTime: string; label: string }> = [];
  const hourDiff = getTimezoneHourDiff(userTz, targetTz);

  // Working hours: 9 AM to 6 PM
  // Find overlapping hours
  const userWorkStart = 9;
  const userWorkEnd = 18;

  // Convert to target's perspective
  const targetWorkStart = 9;
  const targetWorkEnd = 18;

  // Find overlap window
  // Target's 9 AM in user's time = 9 - hourDiff
  // Target's 6 PM in user's time = 18 - hourDiff
  const targetStartInUserTime = targetWorkStart - hourDiff;
  const targetEndInUserTime = targetWorkEnd - hourDiff;

  const overlapStart = Math.max(userWorkStart, targetStartInUserTime);
  const overlapEnd = Math.min(userWorkEnd, targetEndInUserTime);

  if (overlapStart < overlapEnd) {
    // There is overlap - suggest times in the middle of the overlap
    const midpoint = Math.floor((overlapStart + overlapEnd) / 2);

    // Suggest a few times
    const times = [overlapStart, midpoint, overlapEnd - 1].filter(
      (t, i, arr) => arr.indexOf(t) === i && t >= 9 && t < 18
    );

    for (const hour of times.slice(0, 3)) {
      const userHour = hour;
      const targetHour = hour + hourDiff;

      const formatHour = (h: number): string => {
        const adjustedHour = ((h % 24) + 24) % 24;
        const period = adjustedHour >= 12 ? "PM" : "AM";
        const displayHour = adjustedHour === 0 ? 12 : adjustedHour > 12 ? adjustedHour - 12 : adjustedHour;
        return `${displayHour}:00 ${period}`;
      };

      // Determine which day for target
      let dayLabel = "";
      if (targetHour < 0) {
        dayLabel = " (prev day)";
      } else if (targetHour >= 24) {
        dayLabel = " (next day)";
      }

      suggestions.push({
        userTime: formatHour(userHour),
        targetTime: formatHour(targetHour) + dayLabel,
        label: hour === overlapStart ? "Start of overlap" : hour === overlapEnd - 1 ? "End of overlap" : "Mid overlap",
      });
    }
  }

  return suggestions;
}

/**
 * Build the overlap response blocks
 */
function buildOverlapBlocks(
  userId: string,
  targetUserId: string,
  userTz: string,
  targetTz: string
): SlackBlock[] {
  const blocks: SlackBlock[] = [];

  // Header
  blocks.push({
    type: "header",
    text: {
      type: "plain_text",
      text: `Overlap with @${targetUserId.substring(0, 8)}`,
      emoji: false,
    },
  });

  // Timezone comparison
  const userTime = getCurrentTimeFormatted(userTz);
  const targetTime = getCurrentTimeFormatted(targetTz);
  const userAbbrev = getTimezoneAbbrev(userTz);
  const targetAbbrev = getTimezoneAbbrev(targetTz);
  const relativeTz = formatRelativeTimezone(userTz, targetTz);

  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*Your timezones:*\n*-* You: ${userTime} ${userAbbrev} (now)\n*-* <@${targetUserId}>: ${targetTime} ${targetAbbrev} (${relativeTz})`,
    },
  });

  blocks.push({ type: "divider" });

  // Working hours overlap
  const overlapHours = calculateWorkingHoursOverlap(userTz, targetTz);

  if (overlapHours > 0) {
    // Get suggested times
    const suggestions = getSuggestedTimes(userTz, targetTz);

    if (suggestions.length > 0) {
      const suggestionLines = suggestions
        .map((s, i) => `${i + 1}. ${s.userTime} ${userAbbrev} (${s.targetTime} ${targetAbbrev} for them)`)
        .join("\n");

      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Best times to connect:*\n${suggestionLines}`,
        },
      });
    }

    blocks.push({ type: "divider" });
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `Working hours overlap: ${overlapHours}h/day`,
        },
      ],
    });
  } else {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*No working hours overlap*\n\nYou'll need to coordinate async or adjust schedules to connect live.",
      },
    });

    // Suggest async handoff
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "Tip: Use `/attunly handoff @user` for EOD handoffs to coordinate async work.",
        },
      ],
    });
  }

  return blocks;
}

/**
 * Handle the /attunly overlap @user command
 *
 * Returns an ephemeral message showing:
 * - Both users' current times and timezones
 * - Best times to connect
 * - Working hours overlap
 */
export async function handleOverlapCommand(
  params: OverlapCommandParams
): Promise<NextResponse> {
  const { teamId, userId, targetUserId, channelId } = params;

  console.log("[Overlap Command] Processing", { teamId, userId, targetUserId });

  if (userId === targetUserId) {
    return NextResponse.json({
      response_type: "ephemeral",
      text: "You're always in overlap with yourself!",
    });
  }

  try {
    // Get both users' profiles with defensive checks
    const userProfiles = await db
      .select({
        slackUserId: profiles.slackUserId,
        timezone: profiles.timezone,
        firstName: profiles.firstName,
      })
      .from(profiles)
      .where(
        and(
          eq(profiles.slackTeamId, teamId),
          isNotNull(profiles.slackUserId),
          isNotNull(profiles.timezone),
          or(
            eq(profiles.slackUserId, userId),
            eq(profiles.slackUserId, targetUserId)
          )
        )
      );

    if (userProfiles.length === 0) {
      return NextResponse.json({
        response_type: "ephemeral",
        text: "Could not find profile information. Make sure both users have connected Slack and set their timezone.",
      });
    }

    const userProfile = userProfiles.find((p) => p.slackUserId === userId);
    const targetProfile = userProfiles.find((p) => p.slackUserId === targetUserId);

    // Check if we have timezone info
    if (!userProfile?.timezone) {
      return NextResponse.json({
        response_type: "ephemeral",
        text: "Your timezone is not set. Please update your profile settings.",
      });
    }

    if (!targetProfile?.timezone) {
      return NextResponse.json({
        response_type: "ephemeral",
        text: `<@${targetUserId}> hasn't set their timezone yet.`,
      });
    }

    // Build response
    const blocks = buildOverlapBlocks(
      userId,
      targetUserId,
      userProfile.timezone,
      targetProfile.timezone
    );

    const overlapHours = calculateWorkingHoursOverlap(
      userProfile.timezone,
      targetProfile.timezone
    );

    const summaryText =
      overlapHours > 0
        ? `${overlapHours}h working hours overlap with this user.`
        : "No working hours overlap with this user.";

    return NextResponse.json({
      response_type: "ephemeral",
      text: summaryText,
      blocks,
    });
  } catch (error) {
    console.error("[Overlap Command] Error:", error);

    return NextResponse.json({
      response_type: "ephemeral",
      text: "Something went wrong. Please try again.",
    });
  }
}
