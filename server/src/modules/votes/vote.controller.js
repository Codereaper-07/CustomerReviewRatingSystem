import { asyncHandler } from '../../utils/asyncHandler.js';
import { success } from '../../utils/ApiResponse.js';
import * as voteService from './vote.service.js';

export const castVote = asyncHandler(async (req, res) => {
  const result = await voteService.castVote(req.params.reviewId, req.user.id, req.body.type);
  res.status(200).json(success(result));
});
