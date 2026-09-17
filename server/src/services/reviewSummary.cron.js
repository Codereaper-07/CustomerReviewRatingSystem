import cron from 'node-cron';
import Product from '../modules/products/product.model.js';
import Review from '../modules/reviews/review.model.js';
import { generateReviewInsights } from './gemini.service.js';
import { deleteCache, deleteCacheByPrefix } from './cache.service.js';

const PRODUCT_DETAIL_CACHE_PREFIX = 'products:detail:';
const PRODUCT_LIST_CACHE_PREFIX = 'products:list:';
// The admin product-insights endpoint has its own cache key.
const ADMIN_INSIGHTS_CACHE_KEY = 'admin:product-insights';

/**
 * Runs the Gemini summary job for a single product.
 * Fetches all its reviews, calls the Gemini service, and saves
 * the result back onto the product document. Skips products that
 * have no reviews.
 *
 * @param {{ _id: ObjectId, name: string, ratingStats: { count: number } }} product
 */
async function processProduct(product) {
  if (!product.ratingStats?.count || product.ratingStats.count === 0) {
    return; // Nothing to summarize.
  }

  const reviews = await Review.find({ productId: product._id })
    .select('rating title body')
    .lean();

  if (!reviews.length) return;

  const insights = await generateReviewInsights(reviews);

  await Product.updateOne(
    { _id: product._id },
    {
      $set: {
        'aiInsights.summary': insights.summary,
        'aiInsights.sentiment': insights.sentiment,
        'aiInsights.lastGeneratedAt': new Date(),
      },
    }
  );

  // Invalidate the product's detail cache so the admin endpoint
  // picks up fresh data on the next request.
  await deleteCache(`${PRODUCT_DETAIL_CACHE_PREFIX}${product._id}`);
}

/**
 * Iterates over every product and generates/refreshes its AI insights.
 * Called by the cron schedule and can also be invoked manually for testing.
 */
export async function runReviewSummaryCron() {
  console.log('[reviewSummary.cron] Starting daily review summary job...');

  const products = await Product.find({}, { _id: 1, name: 1, ratingStats: 1 }).lean();

  let processed = 0;
  let skipped = 0;
  let failed = 0;

  for (const product of products) {
    try {
      await processProduct(product);
      processed++;
    } catch (err) {
      failed++;
      console.error(`[reviewSummary.cron] Failed for product ${product._id} (${product.name}):`, err.message);
    }
  }

  // Invalidate the admin insights cache so the dashboard reflects the latest data.
  await deleteCache(ADMIN_INSIGHTS_CACHE_KEY);
  // Product list pages embed ratingStats — invalidate them too since we may
  // have changed aiInsights on many products.
  await deleteCacheByPrefix(PRODUCT_LIST_CACHE_PREFIX);

  console.log(
    `[reviewSummary.cron] Done. processed=${processed} skipped=${skipped} failed=${failed}`
  );
}

/**
 * Registers the nightly cron schedule (runs once a day at midnight).
 * Call this once after the server starts — it returns the cron task
 * so the caller can stop it during graceful shutdown.
 */
export function startReviewSummaryCron() {
  // '0 0 * * *' → midnight every day (server local time).
  const task = cron.schedule('0 0 * * *', () => {
    runReviewSummaryCron().catch((err) => {
      console.error('[reviewSummary.cron] Unhandled error in cron job:', err);
    });
  });

  console.log('[reviewSummary.cron] Scheduled daily review summary (runs at midnight).');
  return task;
}

export default { startReviewSummaryCron, runReviewSummaryCron };
