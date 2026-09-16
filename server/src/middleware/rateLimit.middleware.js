import rateLimit from 'express-rate-limit';
import env from '../config/env.js';

/**
 * In-memory rate limiter applied only to the login endpoint. Redis is a
 * cache in this architecture and is intentionally never used for rate
 * limiting, sessions, or queues.
 */
export const loginRateLimiter = rateLimit({
  windowMs: env.loginRateLimit.windowMs,
  limit: env.loginRateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many login attempts. Please try again later.',
      },
    });
  },
});

export default loginRateLimiter;
