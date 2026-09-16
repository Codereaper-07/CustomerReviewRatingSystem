import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const voteSchema = new Schema(
  {
    reviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Review',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['up', 'down'],
      required: true,
    },
  },
  { timestamps: true }
);

// One vote per user per review.
voteSchema.index({ reviewId: 1, userId: 1 }, { unique: true });

export const Vote = model('Vote', voteSchema);
export default Vote;
