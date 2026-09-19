import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const reviewSnapshotSchema = new Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    rating: { type: Number, required: true },
  },
  { _id: false }
);

const reportSchema = new Schema(
  {
    reviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Review',
      required: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reviewAuthorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reviewSnapshot: {
      type: reviewSnapshotSchema,
      required: true,
    },
    reason: {
      type: String,
      enum: ['spam', 'offensive', 'misleading', 'irrelevant', 'other'],
      required: true,
    },
    details: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes
// Fast lookup of user reports within 24h rolling window
reportSchema.index({ reporterId: 1, createdAt: -1 });

// Prevent duplicate reports on the same review by the same user while pending
reportSchema.index({ reviewId: 1, reporterId: 1, status: 1 });

// Admin list filtering by status & recency
reportSchema.index({ status: 1, createdAt: -1 });

export const Report = model('Report', reportSchema);
export default Report;
