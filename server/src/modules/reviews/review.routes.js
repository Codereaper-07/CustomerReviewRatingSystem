import { Router } from 'express';
import { listReviews, createReview, updateReview, deleteReview } from './review.controller.js';
import {
  validateReviewListQuery,
  validateProductIdParam,
  validateReviewIdParam,
  validateCreateReview,
  validateUpdateReview,
} from './review.validation.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireCustomer } from '../../middleware/customer.middleware.js';

/**
 * Nested product-review routes. Mounted at the same base path as the
 * Products module's router (`/api/v1/products`) — Express falls through
 * to this router for any request that router's own routes (`/`,
 * `/:productId`) don't match, so `/:productId/reviews` resolves here
 * without touching product.routes.js.
 */
export const productReviewsRouter = Router();

// Public read.
productReviewsRouter.get('/:productId/reviews', validateProductIdParam, validateReviewListQuery, listReviews);

// Customers only: authenticate -> requireCustomer -> validation -> controller.
productReviewsRouter.post(
  '/:productId/reviews',
  authenticate,
  requireCustomer,
  validateProductIdParam,
  validateCreateReview,
  createReview
);

/** Direct review-by-id mutations. Mounted at `/api/v1/reviews`. */
export const reviewsRouter = Router();

reviewsRouter.patch('/:reviewId', authenticate, validateReviewIdParam, validateUpdateReview, updateReview);
reviewsRouter.delete('/:reviewId', authenticate, validateReviewIdParam, deleteReview);

export default { productReviewsRouter, reviewsRouter };
