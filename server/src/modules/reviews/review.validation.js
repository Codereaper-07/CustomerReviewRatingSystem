import { z } from 'zod';
import mongoose from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';
import { decodeCursor } from '../../utils/pagination.js';

/**
 * Shared field rules for create/update. Deliberately no `productId`/`userId`
 * here — productId comes from the route param, userId is always derived
 * from `req.user` in the service layer, never from client input.
 */
const reviewFieldsSchema = z.object({
  rating: z
    .number()
    .int('Rating must be an integer.')
    .min(1, 'Rating must be between 1 and 5.')
    .max(5, 'Rating must be between 1 and 5.'),
  title: z.string().trim().min(2, 'Title must be at least 2 characters.').max(150, 'Title is too long.'),
  body: z.string().trim().min(10, 'Body must be at least 10 characters.').max(5000, 'Body is too long.'),
});

export const createReviewSchema = reviewFieldsSchema.strict();

export const updateReviewSchema = reviewFieldsSchema
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided.',
  });

/**
 * Query params for GET /products/:productId/reviews. Mirrors the Product
 * module's list-query validation: `limit` is checked here (1–50), cursor
 * *format* is validated via the existing pagination utility below so that
 * decoding logic isn't duplicated.
 */
export const reviewListQuerySchema = z
  .object({
    limit: z
      .string()
      .trim()
      .regex(/^[0-9]+$/, 'limit must be a positive integer.')
      .refine((value) => {
        const parsed = Number(value);
        return parsed >= 1 && parsed <= 50;
      }, 'limit must be between 1 and 50.')
      .optional(),
    cursor: z.string().trim().min(1).optional(),
  })
  .strict();

// Small, module-local param validators (not imported from the Products
// module) to keep the two feature modules loosely coupled.
const productIdParamSchema = z
  .object({
    productId: z.string().refine((value) => mongoose.isValidObjectId(value), {
      message: 'Invalid product id.',
    }),
  })
  .strict();

const reviewIdParamSchema = z
  .object({
    reviewId: z.string().refine((value) => mongoose.isValidObjectId(value), {
      message: 'Invalid review id.',
    }),
  })
  .strict();

function emptyToUndefined(value) {
  return value === '' || value === undefined || value === null ? undefined : value;
}

function toValidationError(zodError) {
  const details = zodError.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
  return new ApiError(400, 'VALIDATION_ERROR', 'Invalid request data.', details);
}

/** Validates `req.body` and replaces it with the parsed/normalized data. */
function validateBody(schema) {
  return function validate(req, res, next) {
    const result = schema.safeParse(req.body);
    if (!result.success) return next(toValidationError(result.error));
    req.body = result.data;
    next();
  };
}

function validateParams(schema) {
  return function validate(req, res, next) {
    const result = schema.safeParse(req.params);
    if (!result.success) return next(toValidationError(result.error));
    next();
  };
}

export function validateReviewListQuery(req, res, next) {
  const result = reviewListQuerySchema.safeParse({
    limit: emptyToUndefined(req.query.limit),
    cursor: emptyToUndefined(req.query.cursor),
  });

  if (!result.success) return next(toValidationError(result.error));

  try {
    // Cursor format lives in the pagination utility — invalid cursors
    // surface as a clean 400 INVALID_CURSOR, not a Zod internals dump.
    decodeCursor(result.data.cursor);
  } catch (err) {
    return next(err);
  }

  next();
}

export const validateCreateReview = validateBody(createReviewSchema);
export const validateUpdateReview = validateBody(updateReviewSchema);
export const validateProductIdParam = validateParams(productIdParamSchema);
export const validateReviewIdParam = validateParams(reviewIdParamSchema);
