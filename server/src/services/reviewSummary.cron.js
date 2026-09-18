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
 * Fetches a stratified sample of its reviews (latest + most helpful),
 * calls the Gemini service, and saves the result back onto the product document.
 *
 * Implements:
 * - Dynamic threshold trigger:
 *     For <= 20 reviews: triggers on >= 1 new review.
 *     For > 20 reviews: triggers on >= 5 new reviews OR after 30 days.
 * - Stratified sample window (up to 25 latest + up to 25 most helpful reviews).
 * - Gibberish detection: suppresses summary if reviews lack meaningful content.
 *
 * @param {{ _id: ObjectId, name: string, ratingStats: { count: number }, aiInsights?: object }} product
 * @returns {Promise<'processed' | 'skipped'>}
 */
async function processProduct(product) {
  const totalCount = product.ratingStats?.count ?? 0;
  if (totalCount === 0) {
    return 'skipped';
  }

  // Dynamic threshold check if a summary has been generated previously
  if (product.aiInsights?.lastGeneratedAt) {
    const THRESHOLD_COUNT = 5;
    const MAX_STALE_DAYS = 30;

    const msSinceLast = Date.now() - new Date(product.aiInsights.lastGeneratedAt).getTime();
    const daysSinceLast = msSinceLast / (1000 * 60 * 60 * 24);

    const newReviewsCount = await Review.countDocuments({
      productId: product._id,
      updatedAt: { $gt: product.aiInsights.lastGeneratedAt },
    });

    if (totalCount > 20) {
      if (newReviewsCount < THRESHOLD_COUNT && daysSinceLast < MAX_STALE_DAYS) {
        console.log(
          `[reviewSummary.cron] Skipping "${product.name}": only ${newReviewsCount} new reviews (threshold ${THRESHOLD_COUNT}) and ${daysSinceLast.toFixed(1)} days since last summary.`
        );
        return 'skipped';
      }
    } else {
      if (newReviewsCount === 0) {
        console.log(`[reviewSummary.cron] Skipping "${product.name}": reviews have not changed since last summary.`);
        return 'skipped';
      }
    }
  }

  // Stratified sample: up to 25 most recent + up to 25 most upvoted reviews
  const [recentReviews, topHelpfulReviews] = await Promise.all([
    Review.find({ productId: product._id })
      .sort({ createdAt: -1 })
      .limit(25)
      .select('rating title body')
      .lean(),
    Review.find({ productId: product._id })
      .sort({ 'voteStats.upvotes': -1, createdAt: -1 })
      .limit(25)
      .select('rating title body')
      .lean(),
  ]);

  // Combine and deduplicate
  const reviewMap = new Map();
  for (const r of [...recentReviews, ...topHelpfulReviews]) {
    reviewMap.set(r._id.toString(), r);
  }
  const reviews = Array.from(reviewMap.values());

  if (!reviews.length) return 'skipped';

  const insights = await generateReviewInsights(reviews);

  await Product.updateOne(
    { _id: product._id },
    {
      $set: {
        'aiInsights.summary': insights.isGibberish ? null : insights.summary,
        'aiInsights.sentiment': insights.sentiment,
        'aiInsights.isGibberish': insights.isGibberish,
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
