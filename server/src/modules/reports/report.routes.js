import { Router } from 'express';
import { createReport, listReports, actionReport } from './report.controller.js';
import {
  validateCreateReport,
  validateActionReport,
  validateReviewIdParam,
  validateReportIdParam,
} from './report.validation.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireCustomer } from '../../middleware/customer.middleware.js';
import { requireAdmin } from '../../middleware/admin.middleware.js';

/**
 * Route for customers to report a review:
 * POST /api/v1/reviews/:reviewId/report
 */
export const reviewReportRouter = Router();

reviewReportRouter.post(
  '/:reviewId/report',
  authenticate,
  requireCustomer,
  validateReviewIdParam,
  validateCreateReport,
  createReport
);

/**
 * Routes for administrators to moderate reports:
 * GET  /api/v1/admin/reports
 * POST /api/v1/admin/reports/:reportId/action
 */
export const adminReportRouter = Router();

adminReportRouter.use(authenticate, requireAdmin);

adminReportRouter.get('/', listReports);
adminReportRouter.post('/:reportId/action', validateReportIdParam, validateActionReport, actionReport);

export default { reviewReportRouter, adminReportRouter };
