import { asyncHandler } from '../../utils/asyncHandler.js';
import { success } from '../../utils/ApiResponse.js';
import * as notificationService from './notification.service.js';

export const listNotifications = asyncHandler(async (req, res) => {
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const data = await notificationService.listNotifications(req.user.id, limit);
  res.status(200).json(success(data));
});

export const markAsRead = asyncHandler(async (req, res) => {
  const data = await notificationService.markAsRead(req.params.id, req.user.id);
  res.status(200).json(success(data));
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  const data = await notificationService.markAllAsRead(req.user.id);
  res.status(200).json(success(data));
});
