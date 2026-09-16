import app from './app.js';
import env, { assertRequiredEnv } from './config/env.js';
import { connectDB } from './config/db.js';
import { connectRedis } from './config/redis.js';

async function start() {
  assertRequiredEnv();

  await connectDB();
  await connectRedis();

  app.listen(env.port, () => {
    console.log(`[server] Listening on port ${env.port} (${env.nodeEnv})`);
  });
}

start().catch((err) => {
  console.error('[server] Failed to start:', err);
  process.exit(1);
});
