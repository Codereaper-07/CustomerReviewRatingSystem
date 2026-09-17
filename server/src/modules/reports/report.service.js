import mongoose from 'mongoose';
import Report from './report.model.js';
import Review from '../reviews/review.model.js';
import Product from '../products/product.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { deleteReviewByAdmin } from '../reviews/review.service.js';
import { createNotification } from '../notifications/notification.service.js';

export const DAILY_REPORT_LIMIT = 5;
const ROLLING_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Creates a report for a review submitted by `reporterId`.
 * Enforces:
 *  - Review must exist.
 *  - Reporter cannot report their own review.
 *  - No duplicate pending report on the same review by this user.
 *  - Maximum 5 reports in a rolling 24-hour window.
 */
export async function createReport(reviewId, reporterId, { reason, details = '' }) {
  const review = await Review.findById(reviewId).lean();
  if (!review) {
    throw new ApiError(404, 'REVIEW_NOT_FOUND', 'The review you are trying to report does not exist.');
  }

  // Self-report prevention
  if (review.userId.toString() === String(reporterId)) {
    throw new ApiError(400, 'SELF_REPORT_FORBIDDEN', 'You cannot report your own review.');
  }

  // Prevent duplicate pending reports
  const existingPending = await Report.findOne({
    reviewId,
    reporterId,
    status: 'pending',
  }).lean();

  if (existingPending) {
    throw new ApiError(
      409,
      'DUPLICATE_REPORT',
      'You have already submitted a pending report for this review.'
    );
  }

  // Check rolling 24-hour limit
  const windowStart = new Date(Date.now() - ROLLING_WINDOW_MS);
  const recentReportsCount = await Report.countDocuments({
    reporterId,
    createdAt: { $gte: windowStart },
  });

  if (recentReportsCount >= DAILY_REPORT_LIMIT) {
    throw new ApiError(
      429,
      'REPORT_LIMIT_EXCEEDED',
      `You have reached the maximum of ${DAILY_REPORT_LIMIT} reports allowed in a 24-hour period. Please try again later.`
    );
  }

  const report = await Report.create({
    reviewId: review._id,
    productId: review.productId,
    reporterId,
    reviewAuthorId: review.userId,
    reviewSnapshot: {
      title: review.title,
      body: review.body,
      rating: review.rating,
    },
    reason,
    details,
  });

  const reportsRemaining = Math.max(0, DAILY_REPORT_LIMIT - (recentReportsCount + 1));

  return {
    id: report._id.toString(),
    status: report.status,
    reason: report.reason,
    reportsRemainingInWindow: reportsRemaining,
    createdAt: report.createdAt,
  };
}

/**
 * Lists reports for the admin moderation dashboard.
 */
export async function listReports(query = {}) {
  const filter = {};
  if (query.status && query.status !== 'all') {
    filter.status = query.status;
  }

  const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
  const page = Math.max(1, Number(query.page) || 1);
  const skip = (page - 1) * limit;

  const [items, total, pendingCount, resolvedCount, dismissedCount] = await Promise.all([
    Report.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('reporterId', 'name email')
      .populate('reviewAuthorId', 'name email')
      .populate('productId', 'name slug image')
      .populate('resolvedBy', 'name')
      .lean(),
    Report.countDocuments(filter),
    Report.countDocuments({ status: 'pending' }),
    Report.countDocuments({ status: 'resolved' }),
    Report.countDocuments({ status: 'dismissed' }),
  ]);

  return {
    items: items.map((r) => ({
      id: r._id.toString(),
      reviewId: r.reviewId?.toString(),
      productId: r.productId?._id?.toString() || r.productId?.toString(),
      productName: r.productId?.name || 'Product',
      productSlug: r.productId?.slug || null,
      reporter: r.reporterId ? { id: r.reporterId._id.toString(), name: r.reporterId.name, email: r.reporterId.email } : null,
      reviewAuthor: r.reviewAuthorId ? { id: r.reviewAuthorId._id.toString(), name: r.reviewAuthorId.name } : null,
      reviewSnapshot: r.reviewSnapshot,
      reason: r.reason,
      details: r.details,
      status: r.status,
      adminNotes: r.adminNotes,
      resolvedBy: r.resolvedBy?.name || null,
      resolvedAt: r.resolvedAt,
      createdAt: r.createdAt,
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
    counts: {
      pending: pendingCount,
      resolved: resolvedCount,
      dismissed: dismissedCount,
      total: pendingCount + resolvedCount + dismissedCount,
    },
  };
}

/**
 * Resolves or dismisses a report by an admin.
 *  - 'approve': Deletes the review, notifies author & reporter, marks resolved.
 *  - 'dismiss': Keeps review, notifies reporter, marks dismissed.
 */
export async function actionReport(reportId, adminId, { action, notes = '' }) {
  const report = await Report.findById(reportId);
  if (!report) {
    throw new ApiError(404, 'REPORT_NOT_FOUND', 'Report not found.');
  }

  if (report.status !== 'pending') {
    throw new ApiError(400, 'REPORT_ALREADY_PROCESSED', `This report has already been marked as ${report.status}.`);
  }

  // Fetch product for notification text
  const product = await Product.findById(report.productId).select('name').lean();
  const productName = product?.name || 'the product';

  if (action === 'approve') {
    // 1. Delete review administratively
    await deleteReviewByAdmin(report.reviewId);

    // 2. Mark report as resolved
    report.status = 'resolved';
    report.resolvedBy = adminId;
    report.resolvedAt = new Date();
    report.adminNotes = notes || 'Violated community review guidelines.';
    await report.save();

    // 3. Notify review author
    await createNotification({
      userId: report.reviewAuthorId,
      type: 'review_removed',
      title: 'Review Removed by Moderator',
      message: `Your review for "${productName}" was removed after being flagged for violating community review guidelines.`,
      link: `/products/${report.productId}`,
    });

    // 4. Notify reporter
    await createNotification({
      userId: report.reporterId,
      type: 'report_approved',
      title: 'Report Approved',
      message: `Thank you for keeping our community safe. Your report for the review on "${productName}" was approved, and the review has been removed.`,
      link: `/products/${report.productId}`,
    });
  } else if (action === 'dismiss') {
    // 1. Mark report as dismissed
    report.status = 'dismissed';
    report.resolvedBy = adminId;
    report.resolvedAt = new Date();
    report.adminNotes = notes || 'Review determined compliant with community guidelines.';
    await report.save();

    // 2. Notify reporter
    await createNotification({
      userId: report.reporterId,
      type: 'report_dismissed',
      title: 'Report Reviewed',
      message: `We investigated your report for the review on "${productName}" and determined the review does not violate our community policies. The review remains published.`,
      link: `/products/${report.productId}`,
    });
  }

  return {
    id: report._id.toString(),
    status: report.status,
    adminNotes: report.adminNotes,
    resolvedAt: report.resolvedAt,
  };
}

export default {
  createReport,
  listReports,
  actionReport,
  DAILY_REPORT_LIMIT,
};
