import { createClient } from 'redis';
import env from './env.js';

/**
 * Redis is used strictly as a cache in this project (see services/cache.service.js).
 * It must never become primary storage, a session store, a queue, or a rate limiter.
 */
const redisClient = createClient({ url: env.redisUrl });

redisClient.on('error', (err) => {
  console.error('[redis] Redis client error:', err.message);
});

redisClient.on('connect', () => {
  console.log('[redis] Redis connected');
});

export async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

export async function disconnectRedis() {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
}

export default redisClient;
