import { z } from 'zod';
import mongoose from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';

const voteBodySchema = z
  .object({
    type: z.enum(['up', 'down'], { message: 'type must be "up" or "down".' }),
  })
  .strict();

// Module-local param validator (not imported from the Reviews module) to
// keep the two feature modules loosely coupled, same convention already
// used between Products and Reviews.
const reviewIdParamSchema = z
  .object({
    reviewId: z.string().refine((value) => mongoose.isValidObjectId(value), {
      message: 'Invalid review id.',
    }),
  })
  .strict();

function toValidationError(zodError) {
  const details = zodError.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
  return new ApiError(400, 'VALIDATION_ERROR', 'Invalid request data.', details);
}

export function validateVoteBody(req, res, next) {
  const result = voteBodySchema.safeParse(req.body);
  if (!result.success) return next(toValidationError(result.error));
  req.body = result.data;
  next();
}

export function validateReviewIdParam(req, res, next) {
  const result = reviewIdParamSchema.safeParse(req.params);
  if (!result.success) return next(toValidationError(result.error));
  next();
}
