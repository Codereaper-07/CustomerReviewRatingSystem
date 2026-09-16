import { Router } from 'express';
import { castVote } from './vote.controller.js';
import { validateReviewIdParam, validateVoteBody } from './vote.validation.js';
import { authenticate } from '../../middleware/auth.middleware.js';

/**
 * Mounted at `/api/v1/reviews` alongside review.routes.js's `reviewsRouter`.
 * `/:reviewId/vote` doesn't overlap with that router's `/:reviewId` route,
 * so both can be mounted at the same base path without conflict.
 */
const router = Router();

router.put('/:reviewId/vote', authenticate, validateReviewIdParam, validateVoteBody, castVote);

export default router;
