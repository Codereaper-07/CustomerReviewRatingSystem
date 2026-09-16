import Product from '../products/product.model.js';
import Review from '../reviews/review.model.js';
import User from '../users/user.model.js';
import { getCache, setCache } from '../../services/cache.service.js';

const DASHBOARD_CACHE_KEY = 'admin:dashboard';
const RECENT_LIMIT = 5;

function round2(value) {
  return Math.round(value * 100) / 100;
}

/** Maps a Product document (or `.lean()` object) to its dashboard shape. */
function toRecentProduct(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    price: doc.price,
    ratingStats: doc.ratingStats,
    createdAt: doc.createdAt,
  };
}

/**
 * Maps a Review document (with `userId` populated with just `{ _id, name
 * }`) to its dashboard shape. Never exposes passwordHash — only `name`
 * is ever selected on the populated user.
 */
function toRecentReview(doc) {
  const rawUser = doc.userId;
  const userIsPopulated = rawUser && typeof rawUser === 'object' && rawUser.name !== undefined;
  const user = userIsPopulated ? { id: rawUser._id.toString(), name: rawUser.name } : { id: rawUser?.toString() };

  return {
    id: doc._id.toString(),
    productId: doc.productId.toString(),
    user,
    rating: doc.rating,
    title: doc.title,
    createdAt: doc.createdAt,
  };
}

/**
 * Builds the admin dashboard from count/aggregation queries only — never
 * loads the full Product/Review/User collections into memory. The
 * result is cached as a single blob under `admin:dashboard`; the
 * Products, Reviews, and Votes modules each invalidate this key whenever
 * they mutate data the dashboard depends on.
 */
export async function getDashboard() {
  const cached = await getCache(DASHBOARD_CACHE_KEY);
  if (cached) return cached;

  const [[productAgg], [reviewAgg], totalCustomers, recentProductsRaw, recentReviewsRaw] = await Promise.all([
    Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          weightedRatingSum: { $sum: { $multiply: ['$ratingStats.average', '$ratingStats.count'] } },
          totalRatingCount: { $sum: '$ratingStats.count' },
          distOne: { $sum: '$ratingStats.distribution.one' },
          distTwo: { $sum: '$ratingStats.distribution.two' },
          distThree: { $sum: '$ratingStats.distribution.three' },
          distFour: { $sum: '$ratingStats.distribution.four' },
          distFive: { $sum: '$ratingStats.distribution.five' },
        },
      },
    ]),
    Review.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          totalUpvotes: { $sum: '$voteStats.upvotes' },
          totalDownvotes: { $sum: '$voteStats.downvotes' },
        },
      },
    ]),
    User.countDocuments({ role: 'customer' }),
    Product.find().sort({ createdAt: -1 }).limit(RECENT_LIMIT).lean(),
    Review.find().sort({ createdAt: -1 }).limit(RECENT_LIMIT).populate('userId', 'name').lean(),
  ]);

  const totalRatingCount = productAgg?.totalRatingCount ?? 0;
  const averageProductRating =
    totalRatingCount > 0 ? round2((productAgg?.weightedRatingSum ?? 0) / totalRatingCount) : 0;

  const dashboard = {
    totals: {
      products: productAgg?.totalProducts ?? 0,
      reviews: reviewAgg?.totalReviews ?? 0,
      customers: totalCustomers,
    },
    averageProductRating,
    votes: {
      upvotes: reviewAgg?.totalUpvotes ?? 0,
      downvotes: reviewAgg?.totalDownvotes ?? 0,
    },
    ratingDistribution: {
      one: productAgg?.distOne ?? 0,
      two: productAgg?.distTwo ?? 0,
      three: productAgg?.distThree ?? 0,
      four: productAgg?.distFour ?? 0,
      five: productAgg?.distFive ?? 0,
    },
    recentProducts: recentProductsRaw.map(toRecentProduct),
    recentReviews: recentReviewsRaw.map(toRecentReview),
  };

  await setCache(DASHBOARD_CACHE_KEY, dashboard);
  return dashboard;
}

export default { getDashboard };
