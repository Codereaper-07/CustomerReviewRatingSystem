import { asyncHandler } from '../../utils/asyncHandler.js';
import { success } from '../../utils/ApiResponse.js';
import * as reportService from './report.service.js';

export const createReport = asyncHandler(async (req, res) => {
  const result = await reportService.createReport(req.params.reviewId, req.user.id, req.body);
  res.status(201).json(success(result));
});

export const listReports = asyncHandler(async (req, res) => {
  const result = await reportService.listReports(req.query);
  res.status(200).json(success(result));
});

export const actionReport = asyncHandler(async (req, res) => {
  const result = await reportService.actionReport(req.params.reportId, req.user.id, req.body);
  res.status(200).json(success(result));
});
