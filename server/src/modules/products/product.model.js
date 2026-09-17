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
 * AI-generated sentiment breakdown for admin use only.
 * Values represent percentage (0-100) of reviews in each category.
 * Populated by the nightly Gemini cron job (reviewSummary.cron.js).
 */
const sentimentSchema = new Schema(
  {
    positive: { type: Number, default: 0, min: 0, max: 100 },
    neutral: { type: Number, default: 0, min: 0, max: 100 },
    negative: { type: Number, default: 0, min: 0, max: 100 },
  },
  { _id: false }
);

/**
 * Admin-only AI insights subdocument. Never included in public product
 * responses — the admin service selects it explicitly for its own endpoint.
 */
const aiInsightsSchema = new Schema(
  {
    summary: { type: String, default: null },
    sentiment: { type: sentimentSchema, default: () => ({}) },
    lastGeneratedAt: { type: Date, default: null },
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
    // Admin-only — never included in public product responses.
    aiInsights: {
      type: aiInsightsSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

export const Product = model('Product', productSchema);
export default Product;
