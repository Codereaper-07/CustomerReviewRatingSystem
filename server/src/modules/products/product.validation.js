import { z } from 'zod';
import mongoose from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';
import { decodeCursor } from '../../utils/pagination.js';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Shared field rules for create/update. `ratingStats` is deliberately
 * absent — combined with `.strict()` below, any client-supplied
 * `ratingStats` is rejected at the validation layer (the service layer
 * also never copies it, as defense in depth).
 */
const productFieldsSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(200, 'Name is too long.'),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, 'Slug must be at least 2 characters.')
    .max(200, 'Slug is too long.')
    .regex(SLUG_PATTERN, 'Slug must contain only lowercase letters, numbers, and hyphens.'),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters.')
    .max(5000, 'Description is too long.'),
  category: z.string().trim().min(2, 'Category must be at least 2 characters.').max(100, 'Category is too long.'),
  price: z
    .number()
    .finite('Price must be a finite number.')
    .nonnegative('Price cannot be negative.')
    .max(1_000_000, 'Price is too large.'),
  image: z.string().trim().max(2048, 'Image URL is too long.').optional(),
});

export const createProductSchema = productFieldsSchema.strict();

export const updateProductSchema = productFieldsSchema
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided.',
  });

/**
 * Query params for GET /products.
 * `limit` is validated here (1–50). Cursor *format* is validated through
 * the existing pagination utility (`decodeCursor`) in the middleware
 * below, so that decoding logic is not duplicated.
 */
export const productListQuerySchema = z
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

const productIdParamSchema = z
  .object({
    productId: z.string().refine((value) => mongoose.isValidObjectId(value), {
      message: 'Invalid product id.',
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

export function validateProductListQuery(req, res, next) {
  const result = productListQuerySchema.safeParse({
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

export const validateCreateProduct = validateBody(createProductSchema);
export const validateUpdateProduct = validateBody(updateProductSchema);
export const validateProductIdParam = validateParams(productIdParamSchema);
