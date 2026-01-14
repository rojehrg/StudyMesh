/**
 * Slack App Home Tab Handler
 *
 * Renders the App Home tab with:
 * - Active momentum locks
 * - Quick action buttons
 * - Usage statistics
 *
 * Triggered by app_home_opened event
 */

import { NextResponse } from "next/server";
import { verifySlackRequest } from "@/lib/slack/verify-signature";
import { db } from "@/lib/db";
import { momentumLocks, momentumLockEvents, profiles } from "@/lib/db/schema";
import { eq, or, and, inArray, desc } from "drizzle-orm";
import { createLogger } from "@/lib/logger";

const log = createLogger({ service: "slack-app-home" });

// ============================================
// TYPES
// ============================================

interface SlackBlock {
  type: string;
  [key: string]: unknown;
}

interface AppHomeView {
  type: "home";
  blocks: SlackBlock[];
}

interface MomentumLockWithEvents {
  lock: typeof momentumLocks.$inferSelect;
  events: (typeof momentumLockEvents.$inferSelect)[];
}

// ============================================
// HOME VIEW BUILDER
// ============================================

/**
 * Build the App Home view blocks
 */
function buildAppHomeView(
  slackUserId: string,
  activeLocks: MomentumLockWithEvents[],
  stats: { owned: number; requested: number; completed: number }
): AppHomeView {
  const blocks: SlackBlock[] = [
    // Header
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "Attunly",
        emoji: true,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "Track your momentum locks and stay aligned with your team.",
        },
      ],
    },
    {
      type: "divider",
    },

    // Quick Actions
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Quick Actions*",
      },
    },
    {
      type: "actions",
      block_id: "quick_actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Create Momentum Lock",
            emoji: true,
          },
          style: "primary",
          action_id: "create_lock_button",
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Ask for Help",
            emoji: true,
          },
          action_id: "ask_for_help_button",
        },
      ],
    },
    {
      type: "divider",
    },
  ];

  // Stats Section
  if (stats.owned > 0 || stats.requested > 0 || stats.completed > 0) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Your Activity*\n\n*${stats.owned}* owned  |  *${stats.requested}* requested  |  *${stats.completed}* completed`,
      },
    });
    blocks.push({ type: "divider" });
  }

  // Active Locks Section
  if (activeLocks.length > 0) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Active Requests* (${activeLocks.length})`,
      },
    });

    for (const { lock } of activeLocks.slice(0, 5)) {
      const isOwner = lock.ownerUserId === slackUserId;
      const deadline = new Date(lock.deadlineAt);
      const now = new Date();
      const hoursRemaining = Math.max(0, Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60)));
      const isOverdue = deadline < now;

      let timeText: string;
      if (isOverdue) {
        timeText = "Overdue";
      } else if (hoursRemaining <= 1) {
        timeText = "< 1 hour";
      } else if (hoursRemaining < 24) {
        timeText = `${hoursRemaining}h`;
      } else {
        const days = Math.round(hoursRemaining / 24);
        timeText = `${days}d`;
      }

      const statusEmoji = {
        active: "",
        started: "[In Progress]",
        blocked: "[Blocked]",
      }[lock.status as string] || "";

      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${statusEmoji} *${lock.requiredOutcome}*\n${isOwner ? "You own" : `<@${lock.ownerUserId}> owns`} | ${isOverdue ? "*Overdue*" : `${timeText} left`}`,
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: isOwner ? "Update" : "View",
            emoji: true,
          },
          action_id: `view_lock_${lock.id}`,
          value: lock.id,
        },
      });
    }

    if (activeLocks.length > 5) {
      blocks.push({
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `_+ ${activeLocks.length - 5} more active requests_`,
          },
        ],
      });
    }
  } else {
    // Empty state
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*No Active Requests*\n\nYou don't have any pending momentum locks. Use `/attunly lock` in any channel to create one.",
      },
    });
  }

  blocks.push({ type: "divider" });

  // Help Section
  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: "Type `/attunly` in any channel to ask for help or `/attunly lock` to create a momentum lock.",
      },
    ],
  });

  return {
    type: "home",
    blocks,
  };
}

/**
 * Publish the App Home view to Slack
 */
async function publishHomeView(
  slackUserId: string,
  view: AppHomeView,
  botToken: string
): Promise<boolean> {
  try {
    const response = await fetch("https://slack.com/api/views.publish", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: slackUserId,
        view,
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      log.error("Failed to publish home view", { error: result.error });
      return false;
    }

    return true;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    log.error("Error publishing home view", { error: errorMessage });
    return false;
  }
}

// ============================================
// EVENT HANDLER
// ============================================

/**
 * Handle app_home_opened event
 */
async function handleAppHomeOpened(
  slackUserId: string,
  slackTeamId: string,
  botToken: string
): Promise<boolean> {
  log.info("App Home opened", { slackUserId, slackTeamId });

  // Fetch user's momentum locks
  const userLocks = await db
    .select()
    .from(momentumLocks)
    .where(
      and(
        eq(momentumLocks.workspaceId, slackTeamId),
        or(
          eq(momentumLocks.ownerUserId, slackUserId),
          eq(momentumLocks.requesterUserId, slackUserId)
        )
      )
    )
    .orderBy(desc(momentumLocks.createdAt))
    .limit(20);

  // Fetch events for these locks
  const lockIds = userLocks.map((l) => l.id);
  let lockEvents: (typeof momentumLockEvents.$inferSelect)[] = [];

  if (lockIds.length > 0) {
    lockEvents = await db
      .select()
      .from(momentumLockEvents)
      .where(inArray(momentumLockEvents.lockId, lockIds));
  }

  // Group events by lock
  const eventsMap = new Map<string, (typeof momentumLockEvents.$inferSelect)[]>();
  for (const event of lockEvents) {
    const existing = eventsMap.get(event.lockId) || [];
    existing.push(event);
    eventsMap.set(event.lockId, existing);
  }

  // Filter active locks and build data structure
  const activeLocks: MomentumLockWithEvents[] = userLocks
    .filter((l) => ["active", "started", "blocked"].includes(l.status))
    .map((lock) => ({
      lock,
      events: eventsMap.get(lock.id) || [],
    }));

  // Calculate stats
  const stats = {
    owned: userLocks.filter((l) => l.ownerUserId === slackUserId && ["active", "started", "blocked"].includes(l.status)).length,
    requested: userLocks.filter((l) => l.requesterUserId === slackUserId && l.ownerUserId !== slackUserId && ["active", "started", "blocked"].includes(l.status)).length,
    completed: userLocks.filter((l) => l.status === "done").length,
  };

  // Build and publish the view
  const view = buildAppHomeView(slackUserId, activeLocks, stats);
  return publishHomeView(slackUserId, view, botToken);
}

// ============================================
// ROUTE HANDLER
// ============================================

export async function POST(request: Request) {
  try {
    // Get raw body for signature verification
    const body = await request.text();

    // Verify the request came from Slack
    const isValid = await verifySlackRequest(request, body);
    if (!isValid) {
      log.error("Invalid Slack signature");
      return NextResponse.json(
        { error: "Invalid request signature" },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body);

    // Handle URL verification challenge
    if (payload.type === "url_verification") {
      return NextResponse.json({ challenge: payload.challenge });
    }

    // Handle events
    if (payload.type === "event_callback") {
      const event = payload.event;

      if (event.type === "app_home_opened") {
        const botToken = process.env.SLACK_BOT_TOKEN;
        if (!botToken) {
          log.error("SLACK_BOT_TOKEN not set");
          return new NextResponse(null, { status: 200 });
        }

        // Process asynchronously to respond quickly
        handleAppHomeOpened(
          event.user,
          payload.team_id,
          botToken
        ).catch((error) => {
          log.error("Error handling app_home_opened", { error });
        });

        // Return immediately to acknowledge
        return new NextResponse(null, { status: 200 });
      }
    }

    // Unknown event type
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    log.error("App Home handler error", { error });
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}

// Slack sends GET for challenge verification
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}
