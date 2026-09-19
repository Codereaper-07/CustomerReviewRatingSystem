import app from './app.js';
import env, { assertRequiredEnv } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { connectRedis, disconnectRedis } from './config/redis.js';
import { runReviewSummaryCron, startReviewSummaryCron } from './services/reviewSummary.cron.js';
// import { runReviewSummaryCron } from './services/review-summary.cron.js';

const SHUTDOWN_TIMEOUT_MS = 10_000;

async function start() {
  assertRequiredEnv();

  // Infrastructure must be ready before the HTTP server starts accepting traffic.
  await connectDB();
  await connectRedis();

  const httpServer = app.listen(env.port, () => {
    console.log(`[server] Listening on port ${env.port} (${env.nodeEnv})`);
  });

  // Start the nightly AI review summary cron job.
  const cronTask = startReviewSummaryCron();

  // Run initial review summary check in background after infrastructure is ready
  runReviewSummaryCron().catch((err) => {
    console.error('[server] Initial review summary run error:', err.message);
  });

  registerGracefulShutdown(httpServer, cronTask);
}

/**
 * Stops accepting new HTTP connections, then closes the MongoDB and Redis
 * connections before exiting. Forces an exit if shutdown hangs.
 */
function registerGracefulShutdown(httpServer, cronTask) {
  let shuttingDown = false;

  async function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log(`[server] ${signal} received, shutting down gracefully...`);
    const forceExitTimer = setTimeout(() => {
      console.error(`[server] Shutdown timed out after ${SHUTDOWN_TIMEOUT_MS}ms, forcing exit`);
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);

    try {
      // Stop the cron job from firing again during shutdown.
      if (cronTask) cronTask.stop();

      await new Promise((resolve, reject) => {
        httpServer.close((err) => (err ? reject(err) : resolve()));
      });
      console.log('[server] HTTP server closed');

      await disconnectDB();
      console.log('[server] MongoDB connection closed');

      await disconnectRedis();
      console.log('[server] Redis connection closed');

      clearTimeout(forceExitTimer);
      process.exit(0);
    } catch (err) {
      console.error('[server] Error during graceful shutdown:', err);
      clearTimeout(forceExitTimer);
      process.exit(1);
    }
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
  console.error('[server] Failed to start:', err);
  process.exit(1);
});