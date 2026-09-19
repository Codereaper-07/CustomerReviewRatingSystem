import { asyncHandler } from '../../utils/asyncHandler.js';
import { success } from '../../utils/ApiResponse.js';
import * as adminService from './admin.service.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await adminService.getDashboard();
  res.status(200).json(success(dashboard));
});

export const getProductInsights = asyncHandler(async (req, res) => {
  const insights = await adminService.getProductInsights();
  res.status(200).json(success(insights));
});
