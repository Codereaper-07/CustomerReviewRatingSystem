import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * Rating distribution buckets (count of reviews per star rating).
 * Subdocument only — no rating aggregation logic lives here; the
 * reviews module's service layer is responsible for keeping these
 * counters in sync when reviews are created/updated/deleted.
 */
const ratingDistributionSchema = new Schema(
  {
    one: { type: Number, default: 0, min: 0 },
    two: { type: Number, default: 0, min: 0 },
    three: { type: Number, default: 0, min: 0 },
    four: { type: Number, default: 0, min: 0 },
    five: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

/**
 * Denormalized rating statistics stored on the product so reads don't
 * need to aggregate the reviews collection. See ratingDistributionSchema.
 */
const ratingStatsSchema = new Schema(
  {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0, min: 0 },
    distribution: { type: ratingDistributionSchema, default: () => ({}) },
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      trim: true,
    },
    ratingStats: {
      type: ratingStatsSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

export const Product = model('Product', productSchema);
export default Product;
