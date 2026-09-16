import redisClient from '../config/redis.js';

/**
 * Centralized cache service. Redis is used strictly as a cache layer here
 * (product lists/details, product reviews, admin dashboard stats, etc.).
 * It is never used as primary storage, a session store, a queue, or for
 * rate limiting. Feature modules should invalidate the keys they own
 * whenever the underlying data changes.
 */
const DEFAULT_TTL_SECONDS = 60;

export async function getCache(key) {
  const raw = await redisClient.get(key);
  return raw ? JSON.parse(raw) : null;
}

export async function setCache(key, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
  await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
}

export async function deleteCache(key) {
  await redisClient.del(key);
}

/**
 * Deletes all keys matching a prefix (e.g. "products:list:*").
 * Used to invalidate a family of cached entries at once.
 */
export async function deleteCacheByPrefix(prefix) {
  const keys = [];
  // scanIterator yields batches of keys (arrays), not one key at a time.
  for await (const batch of redisClient.scanIterator({ MATCH: `${prefix}*` })) {
    keys.push(...batch);
  }
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
}

export default { getCache, setCache, deleteCache, deleteCacheByPrefix };
