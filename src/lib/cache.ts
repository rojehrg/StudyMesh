/**
 * Simple in-memory caching utility with TTL support
 *
 * Features:
 * - Namespaced cache keys (e.g., "user:profile:{id}")
 * - TTL (time-to-live) support with automatic expiration
 * - Pattern-based cache invalidation
 * - Periodic cleanup of expired entries
 *
 * Note: For production with multiple instances, use Redis or similar
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

// In-memory store - resets on server restart
const cacheStore = new Map<string, CacheEntry<unknown>>();

// Cleanup old entries periodically
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute
let lastCleanup = Date.now();

function cleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;
  for (const [key, entry] of cacheStore.entries()) {
    if (entry.expiresAt < now) {
      cacheStore.delete(key);
    }
  }
}

/**
 * Cache configuration options
 */
export interface CacheOptions {
  /** Time-to-live in seconds */
  ttlSeconds: number;
}

/**
 * Default TTL values for common cache scenarios
 */
export const CACHE_TTL = {
  /** Short-lived cache for frequently changing data (1 minute) */
  SHORT: 60,
  /** Standard cache for user data (5 minutes) */
  STANDARD: 300,
  /** Long-lived cache for rarely changing data (15 minutes) */
  LONG: 900,
  /** Extended cache for configuration data (1 hour) */
  EXTENDED: 3600,
} as const;

/**
 * Cache key namespaces for consistent key generation
 */
export const CACHE_NAMESPACE = {
  USER_PROFILE: 'user:profile',
  ORGANIZATION: 'org:settings',
  MOMENTUM_LOCK: 'lock',
  MOMENTUM_LOCKS_LIST: 'locks:list',
} as const;

/**
 * Generate a namespaced cache key
 * @param namespace - The cache namespace (e.g., "user:profile")
 * @param id - The unique identifier
 * @returns Formatted cache key (e.g., "user:profile:abc123")
 */
export function cacheKey(namespace: string, id: string): string {
  return `${namespace}:${id}`;
}

/**
 * Get a value from the cache
 * @param key - The cache key
 * @returns The cached value or null if not found/expired
 */
export function cacheGet<T>(key: string): T | null {
  cleanup();

  const entry = cacheStore.get(key) as CacheEntry<T> | undefined;
  if (!entry) {
    return null;
  }

  // Check if expired
  if (entry.expiresAt < Date.now()) {
    cacheStore.delete(key);
    return null;
  }

  return entry.value;
}

/**
 * Set a value in the cache with TTL
 * @param key - The cache key
 * @param value - The value to cache
 * @param options - Cache options including TTL
 */
export function cacheSet<T>(key: string, value: T, options: CacheOptions): void {
  const expiresAt = Date.now() + (options.ttlSeconds * 1000);
  cacheStore.set(key, { value, expiresAt });
}

/**
 * Delete a specific key from the cache
 * @param key - The cache key to delete
 * @returns true if the key was deleted, false if it didn't exist
 */
export function cacheDelete(key: string): boolean {
  return cacheStore.delete(key);
}

/**
 * Invalidate all cache entries matching a pattern
 * Supports simple prefix matching with wildcards
 *
 * @param pattern - Pattern to match (e.g., "user:profile:*" matches all user profiles)
 * @returns Number of entries invalidated
 *
 * @example
 * // Invalidate all user profiles
 * cacheInvalidatePattern("user:profile:*")
 *
 * // Invalidate all org-related cache
 * cacheInvalidatePattern("org:*")
 */
export function cacheInvalidatePattern(pattern: string): number {
  let invalidated = 0;

  // Convert wildcard pattern to regex
  // Escape special regex characters except *
  const regexPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');

  const regex = new RegExp(`^${regexPattern}$`);

  for (const key of cacheStore.keys()) {
    if (regex.test(key)) {
      cacheStore.delete(key);
      invalidated++;
    }
  }

  return invalidated;
}

/**
 * Clear the entire cache
 * Use sparingly - prefer targeted invalidation
 */
export function cacheClear(): void {
  cacheStore.clear();
}

/**
 * Get cache statistics for debugging
 */
export function cacheStats(): { size: number; keys: string[] } {
  cleanup();
  return {
    size: cacheStore.size,
    keys: Array.from(cacheStore.keys()),
  };
}

/**
 * Helper to get or set a cached value
 * Fetches from cache if available, otherwise calls the factory function
 * and caches the result
 *
 * @param key - The cache key
 * @param factory - Async function to generate the value if not cached
 * @param options - Cache options including TTL
 * @returns The cached or freshly generated value
 *
 * @example
 * const profile = await cacheGetOrSet(
 *   cacheKey(CACHE_NAMESPACE.USER_PROFILE, userId),
 *   () => fetchUserProfile(userId),
 *   { ttlSeconds: CACHE_TTL.STANDARD }
 * );
 */
export async function cacheGetOrSet<T>(
  key: string,
  factory: () => Promise<T>,
  options: CacheOptions
): Promise<T> {
  const cached = cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }

  const value = await factory();
  cacheSet(key, value, options);
  return value;
}

/**
 * Synchronous version of cacheGetOrSet for non-async factories
 */
export function cacheGetOrSetSync<T>(
  key: string,
  factory: () => T,
  options: CacheOptions
): T {
  const cached = cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }

  const value = factory();
  cacheSet(key, value, options);
  return value;
}
