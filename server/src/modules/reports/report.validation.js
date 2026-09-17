import { z } from 'zod';
import mongoose from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';

export const createReportSchema = z.object({
  reason: z.enum(['spam', 'offensive', 'misleading', 'irrelevant', 'other'], {
    errorMap: () => ({ message: 'Please select a valid reason for reporting.' }),
  }),
  details: z.string().trim().max(500, 'Details cannot exceed 500 characters.').optional().default(''),
}).strict();

export const actionReportSchema = z.object({
  action: z.enum(['approve', 'dismiss'], {
    errorMap: () => ({ message: 'Action must be either "approve" or "dismiss".' }),
  }),
  notes: z.string().trim().max(500, 'Notes cannot exceed 500 characters.').optional().default(''),
}).strict();

export const listReportsQuerySchema = z.object({
  status: z.enum(['pending', 'resolved', 'dismissed', 'all']).optional().default('pending'),
  limit: z
    .string()
    .trim()
    .regex(/^[0-9]+$/, 'limit must be a positive integer.')
    .refine((val) => Number(val) >= 1 && Number(val) <= 50, 'limit must be between 1 and 50.')
    .optional(),
  page: z
    .string()
    .trim()
    .regex(/^[0-9]+$/, 'page must be a positive integer.')
    .optional(),
});

function toValidationError(zodError) {
  const details = zodError.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
  return new ApiError(400, 'VALIDATION_ERROR', 'Invalid request data.', details);
}

export function validateCreateReport(req, res, next) {
  const result = createReportSchema.safeParse(req.body);
  if (!result.success) return next(toValidationError(result.error));
  req.body = result.data;
  next();
}

export function validateActionReport(req, res, next) {
  const result = actionReportSchema.safeParse(req.body);
  if (!result.success) return next(toValidationError(result.error));
  req.body = result.data;
  next();
}

export function validateReviewIdParam(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.reviewId)) {
    return next(new ApiError(400, 'INVALID_ID', 'Invalid review id.'));
  }
  next();
}

export function validateReportIdParam(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.reportId)) {
    return next(new ApiError(400, 'INVALID_ID', 'Invalid report id.'));
  }
  next();
}
