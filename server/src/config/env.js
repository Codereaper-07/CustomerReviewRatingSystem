import 'dotenv/config';

/**
 * Centralized, validated access to environment variables.
 * Fail fast on startup if required configuration is missing,
 * rather than surfacing confusing errors deep in the app.
 */

// Required in every environment: there is no safe default for a JWT
// signing secret, so the app must not boot without one.
const requiredAlways = ['JWT_SECRET'];
// Only required once the app is actually deployed; local dev can fall
// back to a local Mongo URI (see below).
const requiredInProduction = ['MONGODB_URI'];

/**
 * Parses simple duration strings ("15m", "1h", "7d", "30s") or a plain
 * number of seconds into milliseconds. Used to size the auth cookie's
 * `maxAge` from JWT_EXPIRES_IN without pulling in an extra dependency.
 */
function parseDurationToMs(duration, fallbackMs) {
  if (!duration) return fallbackMs;
  const match = /^(\d+)\s*(ms|s|m|h|d)?$/i.exec(String(duration).trim());
  if (!match) return fallbackMs;
  const value = Number(match[1]);
  const unit = (match[2] || 's').toLowerCase();
  const multipliers = { ms: 1, s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return value * multipliers[unit];
}

const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '15m';

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/customer_review_rating_system',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // JWT auth. No hardcoded secret: JWT_SECRET must be provided via env.
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn,
  jwtExpiresInMs: parseDurationToMs(jwtExpiresIn, 15 * 60 * 1000),
  authCookieName: process.env.AUTH_COOKIE_NAME || 'auth_token',

  // Login endpoint rate limiting (in-memory via express-rate-limit, not Redis).
  loginRateLimit: {
    windowMs: Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.LOGIN_RATE_LIMIT_MAX) || 10,
  },

  // Gemini API key for AI review summaries.
  // Optional in development — cron job will log an error and skip if not set.
  geminiApiKey: process.env.GEMINI_API_KEY || null,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
  geminiMaxRpm: Math.max(1, Number(process.env.GEMINI_MAX_RPM) || 5), // Default 5 requests/min (1 every 12s)
};

export function assertRequiredEnv() {
  const missingAlways = requiredAlways.filter((key) => !process.env[key]);
  if (missingAlways.length > 0) {
    throw new Error(`Missing required environment variables: ${missingAlways.join(', ')}`);
  }

  if (env.nodeEnv === 'production') {
    const missing = requiredInProduction.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
}

export const isProduction = env.nodeEnv === 'production';

export default env;
