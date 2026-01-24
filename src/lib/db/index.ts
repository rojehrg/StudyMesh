import { drizzle } from "drizzle-orm/postgres-js";
import { eq, inArray, and, sql } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "./schema";
import {
  cacheDelete,
  cacheInvalidatePattern,
  cacheKey,
  cacheGetOrSet,
  CACHE_NAMESPACE,
  CACHE_TTL,
} from "../cache";
import { logger } from "../logger";

const connectionString = process.env.DATABASE_URL!;

/**
 * Connection pool configuration for Supabase
 *
 * These settings are optimized for Supabase's Supavisor connection pooler:
 * - max: Maximum connections in the pool (Supabase free tier allows up to 60)
 * - idle_timeout: Close idle connections after this many seconds
 * - connect_timeout: Timeout for establishing new connections
 * - prepare: Disabled for Transaction pool mode compatibility
 */
export const client = postgres(connectionString, {
  prepare: false, // Required for Supabase Transaction pool mode
  max: 10, // Connection pool size (adjust based on your Supabase tier)
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
  max_lifetime: 60 * 30, // Max connection lifetime (30 minutes)
});
export const db = drizzle(client, { schema });

// ============================================
// RETRY LOGIC FOR TRANSIENT DATABASE ERRORS
// ============================================

/**
 * Transient error codes that should trigger a retry
 * These are temporary errors that may resolve on their own
 */
const TRANSIENT_ERROR_CODES = [
  '40001', // Serialization failure
  '40P01', // Deadlock detected
  '08006', // Connection failure
  '08001', // Unable to establish connection
  '08004', // Rejected connection
  '57P01', // Admin shutdown
  '57P02', // Crash shutdown
  '57P03', // Cannot connect now
  'ECONNRESET', // Connection reset
  'ETIMEDOUT', // Connection timeout
  'ENOTFOUND', // DNS lookup failure
];

/**
 * Check if an error is transient and should be retried
 */
function isTransientError(error: unknown): boolean {
  if (error instanceof Error) {
    const errorCode = (error as { code?: string }).code;
    if (errorCode && TRANSIENT_ERROR_CODES.includes(errorCode)) {
      return true;
    }
    // Check for common transient error messages
    const message = error.message.toLowerCase();
    if (
      message.includes('connection') ||
      message.includes('timeout') ||
      message.includes('econnreset') ||
      message.includes('socket')
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Configuration for retry behavior
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Initial delay between retries in milliseconds */
  initialDelayMs?: number;
  /** Maximum delay between retries in milliseconds */
  maxDelayMs?: number;
  /** Multiplier for exponential backoff */
  backoffMultiplier?: number;
}

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
};

/**
 * Execute a database operation with automatic retry for transient errors
 *
 * Uses exponential backoff with jitter to avoid thundering herd
 *
 * @param operation - The database operation to execute
 * @param config - Optional retry configuration
 * @returns The result of the operation
 * @throws The last error if all retries fail
 *
 * @example
 * const user = await withRetry(() =>
 *   db.select().from(profiles).where(eq(profiles.userId, userId))
 * );
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const { maxRetries, initialDelayMs, maxDelayMs, backoffMultiplier } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let lastError: unknown;
  let delay = initialDelayMs;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry non-transient errors
      if (!isTransientError(error)) {
        throw error;
      }

      // Don't retry if we've exhausted attempts
      if (attempt >= maxRetries) {
        logger.error('Database operation failed after max retries', {
          service: 'api',
          attempt: attempt + 1,
          maxRetries,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }

      // Log the retry attempt
      logger.warn('Retrying database operation after transient error', {
        service: 'api',
        attempt: attempt + 1,
        maxRetries,
        delayMs: delay,
        error: error instanceof Error ? error.message : String(error),
      });

      // Wait with jitter before retrying
      const jitter = Math.random() * 0.3 * delay; // Up to 30% jitter
      await new Promise((resolve) => setTimeout(resolve, delay + jitter));

      // Increase delay for next retry (exponential backoff)
      delay = Math.min(delay * backoffMultiplier, maxDelayMs);
    }
  }

  throw lastError;
}

// ============================================
// CACHED QUERY HELPERS
// ============================================

/**
 * Fetch a user profile by user ID with caching (5-minute TTL)
 *
 * @param userId - The Supabase Auth user ID
 * @returns The profile or null if not found
 */
export async function getCachedUserProfile(userId: string) {
  const key = cacheKey(CACHE_NAMESPACE.USER_PROFILE, userId);

  return cacheGetOrSet(
    key,
    async () => {
      const result = await withRetry(() =>
        db.select().from(schema.profiles).where(eq(schema.profiles.userId, userId))
      );
      return result[0] || null;
    },
    { ttlSeconds: CACHE_TTL.STANDARD }
  );
}

/**
 * Invalidate the cached user profile
 * Call this after updating a user's profile
 *
 * @param userId - The Supabase Auth user ID
 */
export function invalidateUserProfileCache(userId: string): void {
  const key = cacheKey(CACHE_NAMESPACE.USER_PROFILE, userId);
  cacheDelete(key);
}

/**
 * Fetch organization settings by ID with caching (5-minute TTL)
 *
 * @param organizationId - The organization UUID
 * @returns The organization or null if not found
 */
export async function getCachedOrganization(organizationId: string) {
  const key = cacheKey(CACHE_NAMESPACE.ORGANIZATION, organizationId);

  return cacheGetOrSet(
    key,
    async () => {
      const result = await withRetry(() =>
        db.select().from(schema.organizations).where(eq(schema.organizations.id, organizationId))
      );
      return result[0] || null;
    },
    { ttlSeconds: CACHE_TTL.STANDARD }
  );
}

/**
 * Invalidate the cached organization settings
 * Call this after updating organization settings
 *
 * @param organizationId - The organization UUID
 */
export function invalidateOrganizationCache(organizationId: string): void {
  const key = cacheKey(CACHE_NAMESPACE.ORGANIZATION, organizationId);
  cacheDelete(key);
}

// ============================================
// BATCH QUERY HELPERS
// ============================================

/**
 * Fetch multiple momentum locks by IDs efficiently
 *
 * @param lockIds - Array of lock UUIDs to fetch
 * @returns Map of lock ID to lock object
 */
export async function batchGetMomentumLocks(lockIds: string[]) {
  if (lockIds.length === 0) {
    return new Map<string, schema.MomentumLock>();
  }

  const locks = await withRetry(() =>
    db.select().from(schema.momentumLocks).where(inArray(schema.momentumLocks.id, lockIds))
  );

  return new Map(locks.map((lock) => [lock.id, lock]));
}

/**
 * Fetch momentum locks for a workspace with optional status filter
 *
 * @param workspaceId - The Slack workspace ID
 * @param status - Optional status filter (e.g., 'active', 'done')
 * @param limit - Maximum number of locks to return
 * @returns Array of momentum locks
 */
export async function getMomentumLocksByWorkspace(
  workspaceId: string,
  status?: schema.MomentumLockStatusType,
  limit = 100
) {
  const conditions = [eq(schema.momentumLocks.workspaceId, workspaceId)];
  if (status) {
    conditions.push(eq(schema.momentumLocks.status, status));
  }

  return withRetry(() =>
    db
      .select()
      .from(schema.momentumLocks)
      .where(and(...conditions))
      .orderBy(schema.momentumLocks.createdAt)
      .limit(limit)
  );
}

/**
 * Fetch momentum locks for an owner with optional status filter
 *
 * @param ownerUserId - The Slack user ID of the lock owner
 * @param status - Optional status filter
 * @param limit - Maximum number of locks to return
 * @returns Array of momentum locks
 */
export async function getMomentumLocksByOwner(
  ownerUserId: string,
  status?: schema.MomentumLockStatusType,
  limit = 100
) {
  const conditions = [eq(schema.momentumLocks.ownerUserId, ownerUserId)];
  if (status) {
    conditions.push(eq(schema.momentumLocks.status, status));
  }

  return withRetry(() =>
    db
      .select()
      .from(schema.momentumLocks)
      .where(and(...conditions))
      .orderBy(schema.momentumLocks.createdAt)
      .limit(limit)
  );
}

/**
 * Fetch momentum lock events for a lock ordered by creation time
 *
 * @param lockId - The momentum lock UUID
 * @returns Array of lock events
 */
export async function getMomentumLockEvents(lockId: string) {
  return withRetry(() =>
    db
      .select()
      .from(schema.momentumLockEvents)
      .where(eq(schema.momentumLockEvents.lockId, lockId))
      .orderBy(schema.momentumLockEvents.createdAt)
  );
}

/**
 * Fetch locks with approaching deadlines for cron job processing
 * Uses the deadline_at index for efficient querying
 *
 * @param beforeTime - Fetch locks with deadlines before this time
 * @param statuses - Array of statuses to include
 * @returns Array of momentum locks
 */
export async function getLocksApproachingDeadline(
  beforeTime: Date,
  statuses: schema.MomentumLockStatusType[] = ['active', 'started']
) {
  return withRetry(() =>
    db
      .select()
      .from(schema.momentumLocks)
      .where(
        and(
          inArray(schema.momentumLocks.status, statuses),
          sql`${schema.momentumLocks.deadlineAt} <= ${beforeTime.toISOString()}`
        )
      )
      .orderBy(schema.momentumLocks.deadlineAt)
  );
}

// ============================================
// PREPARED STATEMENTS
// ============================================

/**
 * Prepared statement for fetching a profile by Slack user ID
 * More efficient for repeated queries with different parameters
 */
export const getProfileBySlackUserId = db
  .select()
  .from(schema.profiles)
  .where(eq(schema.profiles.slackUserId, sql.placeholder('slackUserId')))
  .prepare('get_profile_by_slack_user_id');

/**
 * Prepared statement for fetching a momentum lock by ID
 */
export const getMomentumLockById = db
  .select()
  .from(schema.momentumLocks)
  .where(eq(schema.momentumLocks.id, sql.placeholder('lockId')))
  .prepare('get_momentum_lock_by_id');

/**
 * Prepared statement for fetching an organization by Slack team ID
 */
export const getOrganizationBySlackTeamId = db
  .select()
  .from(schema.organizations)
  .where(eq(schema.organizations.slackTeamId, sql.placeholder('slackTeamId')))
  .prepare('get_organization_by_slack_team_id');

// ============================================
// UTILITY EXPORTS
// ============================================

/**
 * Invalidate all cache entries for a specific user
 * Call this when a user is deleted or their data changes significantly
 */
export function invalidateAllUserCache(userId: string): number {
  return cacheInvalidatePattern(`*:${userId}`);
}

/**
 * Invalidate all cache entries for an organization
 */
export function invalidateAllOrganizationCache(organizationId: string): number {
  return cacheInvalidatePattern(`org:*:${organizationId}`);
}

// Re-export schema for convenience
export { schema };
