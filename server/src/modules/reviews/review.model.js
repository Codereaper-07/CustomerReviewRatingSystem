import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * Denormalized vote counters, kept in sync by the votes module's service
 * layer. No vote-tallying logic lives here.
 */
const voteStatsSchema = new Schema(
  {
    upvotes: { type: Number, default: 0, min: 0 },
    downvotes: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const reviewSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: 'rating must be an integer between 1 and 5',
      },
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    voteStats: {
      type: voteStatsSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

// A customer may only review a given product once.
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

// Supports fetching a product's reviews newest-first.
reviewSchema.index({ productId: 1, createdAt: -1 });

export const Review = model('Review', reviewSchema);
export default Review;
