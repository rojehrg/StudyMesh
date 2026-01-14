/**
 * Weekly Digest Cron Job
 *
 * Sends weekly activity summaries to all users.
 * Should be triggered once per week (e.g., Monday morning).
 *
 * Run with: GET /api/cron/digest?secret=<CRON_SECRET>
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { isNotNull } from "drizzle-orm";
import { processWeeklyDigests } from "@/lib/slack/digest";
import { createLogger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes max

const log = createLogger({ service: "digest" });

/**
 * Verify the cron request is legitimate
 */
function verifyCronRequest(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const vercelCron = request.headers.get("x-vercel-cron");

  // In development, allow all requests
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  // Production: require CRON_SECRET
  if (!cronSecret) {
    log.error("CRON_SECRET not configured");
    return false;
  }

  // Accept requests with valid Bearer token
  if (authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  // Accept Vercel cron with secret in query params
  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret");
  if (vercelCron === "1" && querySecret === cronSecret) {
    return true;
  }

  log.warn("Unauthorized cron request");
  return false;
}

export async function GET(request: Request) {
  // Verify request
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  log.info("Weekly digest cron started");

  try {
    // Get all organizations with Slack connected
    const orgs = await db
      .select({ id: organizations.id, name: organizations.name })
      .from(organizations)
      .where(isNotNull(organizations.slackTeamId));

    log.info("Found organizations with Slack", { count: orgs.length });

    const results: Array<{
      orgId: string;
      orgName: string;
      sent: number;
      failed: number;
    }> = [];

    // Process each organization
    for (const org of orgs) {
      const result = await processWeeklyDigests(org.id);
      results.push({
        orgId: org.id,
        orgName: org.name,
        sent: result.sent,
        failed: result.failed,
      });
    }

    const totalSent = results.reduce((acc, r) => acc + r.sent, 0);
    const totalFailed = results.reduce((acc, r) => acc + r.failed, 0);

    log.info("Weekly digest cron completed", { totalSent, totalFailed });

    return NextResponse.json({
      success: true,
      summary: {
        organizations: orgs.length,
        digestsSent: totalSent,
        digestsFailed: totalFailed,
      },
      results,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    log.error("Weekly digest cron failed", { error: errorMessage });
    return NextResponse.json(
      { error: "Internal error", message: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Also allow POST for flexibility
  return GET(request);
}
