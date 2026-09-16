import mongoose from 'mongoose';
import Vote from './vote.model.js';
import Review from '../reviews/review.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { deleteCache, deleteCacheByPrefix } from '../../services/cache.service.js';

// Matches the key format review.service.js uses for its own review-list
// cache. Kept as a small local constant (rather than importing from the
// Reviews module) so the two feature modules stay loosely coupled.
const REVIEW_LIST_CACHE_PREFIX = 'reviews:list:';
const ADMIN_DASHBOARD_CACHE_KEY = 'admin:dashboard';

const VOTE_BUCKET_KEYS = { up: 'upvotes', down: 'downvotes' };

function buildReviewListCachePrefixForProduct(productId) {
  return `${REVIEW_LIST_CACHE_PREFIX}product=${productId}:`;
}

async function invalidateReviewListCache(productId) {
  await deleteCacheByPrefix(buildReviewListCachePrefixForProduct(productId));
}

async function invalidateAdminDashboardCache() {
  await deleteCache(ADMIN_DASHBOARD_CACHE_KEY);
}

function isDuplicateVoteError(err) {
  return err?.code === 11000 || err?.cause?.code === 11000;
}

/**
 * Casts/toggles a user's vote on a review, atomically keeping
 * Review.voteStats in sync in the same transaction:
 *  - no existing vote            -> create it, increment the matching bucket.
 *  - existing vote, same type    -> remove it, decrement that bucket.
 *  - existing vote, opposite type -> flip its type, decrement the old
 *    bucket and increment the new one.
 * Bucket counts are always clamped at 0. Product.ratingStats is never
 * touched here — voting has no effect on product ratings.
 */
export async function castVote(reviewId, userId, type) {
  const session = await mongoose.startSession();
  let voteStats;
  let voteState;
  let productId;

  try {
    session.startTransaction();

    const review = await Review.findById(reviewId).session(session);
    if (!review) {
      throw new ApiError(404, 'REVIEW_NOT_FOUND', 'Review not found.');
    }
    productId = review.productId;

    const existingVote = await Vote.findOne({ reviewId, userId }).session(session);
    const newStats = { upvotes: review.voteStats.upvotes, downvotes: review.voteStats.downvotes };

    if (!existingVote) {
      try {
        await Vote.create([{ reviewId, userId, type }], { session });
      } catch (err) {
        if (isDuplicateVoteError(err)) {
          // Relies on the unique { reviewId, userId } index as the final
          // database-level guarantee against a duplicate vote.
          throw new ApiError(409, 'VOTE_ALREADY_EXISTS', 'Vote already recorded. Please retry.');
        }
        throw err;
      }
      const bucketKey = VOTE_BUCKET_KEYS[type];
      newStats[bucketKey] += 1;
      voteState = { type };
    } else if (existingVote.type === type) {
      await Vote.deleteOne({ _id: existingVote._id }).session(session);
      const bucketKey = VOTE_BUCKET_KEYS[type];
      newStats[bucketKey] = Math.max(0, newStats[bucketKey] - 1);
      voteState = null;
    } else {
      const oldBucketKey = VOTE_BUCKET_KEYS[existingVote.type];
      const newBucketKey = VOTE_BUCKET_KEYS[type];
      await Vote.findOneAndUpdate({ _id: existingVote._id }, { $set: { type } }, { session });
      newStats[oldBucketKey] = Math.max(0, newStats[oldBucketKey] - 1);
      newStats[newBucketKey] += 1;
      voteState = { type };
    }

    await Review.updateOne(
      { _id: reviewId },
      { $set: { 'voteStats.upvotes': newStats.upvotes, 'voteStats.downvotes': newStats.downvotes } },
      { session }
    );

    voteStats = newStats;

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }

  await invalidateReviewListCache(productId);
  await invalidateAdminDashboardCache();

  return { reviewId: String(reviewId), vote: voteState, voteStats };
}

export default { castVote };
