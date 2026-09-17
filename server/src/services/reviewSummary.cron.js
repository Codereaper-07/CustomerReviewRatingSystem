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
 * the result back onto the product document.
 *
 * Skips products if no reviews have been added/modified since the last summary.
 *
 * @param {{ _id: ObjectId, name: string, ratingStats: { count: number }, aiInsights?: object }} product
 * @returns {Promise<'processed' | 'skipped'>}
 */
async function processProduct(product) {
  if (!product.ratingStats?.count || product.ratingStats.count === 0) {
    return 'skipped';
  }

  // If a summary already exists, check if any review was created/updated after lastGeneratedAt
  if (product.aiInsights?.lastGeneratedAt && product.aiInsights?.summary) {
    const hasNewerReview = await Review.exists({
      productId: product._id,
      updatedAt: { $gt: product.aiInsights.lastGeneratedAt },
    });

    if (!hasNewerReview) {
      console.log(`[reviewSummary.cron] Skipping "${product.name}": reviews have not changed since last summary.`);
      return 'skipped';
    }
  }

  const reviews = await Review.find({ productId: product._id })
    .select('rating title body')
    .lean();

  if (!reviews.length) return 'skipped';

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

  // Invalidate the product's detail cache so the public detail page
  // picks up fresh data on the next request.
  await deleteCache(`${PRODUCT_DETAIL_CACHE_PREFIX}${product._id}`);
  return 'processed';
}

/**
 * Iterates over every product with reviews and generates/refreshes its AI insights.
 * Automatically rate-limited via gemini.service.js.
 */
export async function runReviewSummaryCron() {
  console.log('[reviewSummary.cron] Starting daily review summary job...');

  // Only products that actually have reviews
  const products = await Product.find(
    { 'ratingStats.count': { $gt: 0 } },
    { _id: 1, name: 1, ratingStats: 1, aiInsights: 1 }
  ).lean();

  console.log(`[reviewSummary.cron] Found ${products.length} product(s) with reviews.`);

  let processed = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`[reviewSummary.cron] [${i + 1}/${products.length}] Checking "${product.name}"...`);

    try {
      const status = await processProduct(product);
      if (status === 'processed') {
        processed++;
        console.log(`[reviewSummary.cron] [${i + 1}/${products.length}] Successfully updated "${product.name}".`);
      } else {
        skipped++;
      }
    } catch (err) {
      failed++;
      console.error(`[reviewSummary.cron] [${i + 1}/${products.length}] Failed for product "${product.name}":`, err.message);
    }
  }

  // Invalidate the admin insights cache so the dashboard reflects the latest data.
  await deleteCache(ADMIN_INSIGHTS_CACHE_KEY);
  // Product list pages embed ratingStats — invalidate them too.
  await deleteCacheByPrefix(PRODUCT_LIST_CACHE_PREFIX);

  console.log(
    `[reviewSummary.cron] Completed. processed=${processed} skipped=${skipped} failed=${failed}`
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
