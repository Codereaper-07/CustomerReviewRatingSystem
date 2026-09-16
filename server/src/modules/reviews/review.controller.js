import { asyncHandler } from '../../utils/asyncHandler.js';
import { success, paginated } from '../../utils/ApiResponse.js';
import * as reviewService from './review.service.js';

export const listReviews = asyncHandler(async (req, res) => {
  const { items, pagination } = await reviewService.listReviews(req.params.productId, req.query);
  res.status(200).json(paginated(items, pagination));
});

export const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(req.params.productId, req.user.id, req.body);
  res.status(201).json(success(review));
});

export const updateReview = asyncHandler(async (req, res) => {
  const review = await reviewService.updateReview(req.params.reviewId, req.user.id, req.body);
  res.status(200).json(success(review));
});

export const deleteReview = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(req.params.reviewId, req.user.id);
  res.status(200).json(success({ id: req.params.reviewId, deleted: true }));
});
