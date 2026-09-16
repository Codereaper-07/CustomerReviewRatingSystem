import 'dotenv/config';

/**
 * Centralized, validated access to environment variables.
 * Fail fast on startup if required configuration is missing,
 * rather than surfacing confusing errors deep in the app.
 */
const requiredInProduction = ['MONGODB_URI'];

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/customer_review_rating_system',
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
};

export function assertRequiredEnv() {
  if (env.nodeEnv === 'production') {
    const missing = requiredInProduction.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
}

export const isProduction = env.nodeEnv === 'production';

export default env;
