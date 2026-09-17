import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Flag,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Shield,
  Trash2,
  Check,
  RefreshCw,
} from 'lucide-react';
import { useAdminReports } from '../../reports/hooks/useAdminReports.js';
import Button from '../../../components/ui/Button.jsx';
import Skeleton from '../../../components/ui/Skeleton.jsx';
import MetricCard from '../components/MetricCard.jsx';
import { formatRelativeTime } from '../../../utils/formatters.js';

const REASON_LABELS = {
  spam: { label: 'Spam / Promo', color: 'bg-purple-200 text-purple-900 border-purple-900' },
  offensive: { label: 'Offensive / Hate', color: 'bg-rose-200 text-rose-900 border-rose-900' },
  misleading: { label: 'Misleading', color: 'bg-amber-200 text-amber-900 border-amber-900' },
  irrelevant: { label: 'Irrelevant', color: 'bg-slate-200 text-slate-800 border-slate-800' },
  other: { label: 'Other', color: 'bg-slate-200 text-slate-800 border-slate-800' },
};

export function AdminReportsPage() {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const { reports, counts, pagination, isLoading, isError, error, refetch, actionReport, isProcessing } =
    useAdminReports({ status: statusFilter, page, limit: 10 });

  const handleAction = async (reportId, action) => {
    const isApprove = action === 'approve';
    const confirmMessage = isApprove
      ? 'Are you sure you want to approve this report? The review will be permanently deleted from the store, rating statistics updated, and both parties notified.'
      : 'Are you sure you want to dismiss this report? The review will remain published and the reporter notified.';

    if (window.confirm(confirmMessage)) {
      await actionReport({ reportId, data: { action } });
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <Flag className="w-7 h-7 text-rose-600" />
            Review Moderation &amp; Reports
          </h1>
          <p className="text-xs font-bold text-slate-500 mt-1">
            Review flagged customer content, verify community guideline compliance, and take moderation actions
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => refetch()}
          className="text-xs py-2 px-3"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Pending Action"
          value={counts.pending}
          subtitle="Awaiting moderation"
          icon={AlertTriangle}
          color="bg-rose-300"
        />
        <MetricCard
          title="Resolved"
          value={counts.resolved}
          subtitle="Reviews removed"
          icon={CheckCircle2}
          color="bg-emerald-300"
        />
        <MetricCard
          title="Dismissed"
          value={counts.dismissed}
          subtitle="Deemed compliant"
          icon={XCircle}
          color="bg-slate-300"
        />
        <MetricCard
          title="Total Reports"
          value={counts.total}
          subtitle="Historical submissions"
          icon={Flag}
          color="bg-amber-300"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b-2.5 border-black pb-3">
        {[
          { key: 'pending', label: 'Pending', count: counts.pending, color: 'bg-rose-400' },
          { key: 'resolved', label: 'Resolved', count: counts.resolved, color: 'bg-emerald-400' },
          { key: 'dismissed', label: 'Dismissed', count: counts.dismissed, color: 'bg-slate-400' },
          { key: 'all', label: 'All Reports', count: counts.total, color: 'bg-amber-400' },
        ].map(({ key, label, count, color }) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setStatusFilter(key);
              setPage(1);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black border-2 border-black rounded-md transition-colors shadow-[2px_2px_0_0_#000] cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
              statusFilter === key
                ? 'bg-black text-white'
                : 'bg-white text-slate-800 hover:bg-slate-100'
            }`}
          >
            <span>{label}</span>
            <span
              className={`px-1.5 py-0.2 text-[10px] rounded font-black ${
                statusFilter === key ? `${color} text-black` : 'bg-slate-100 text-slate-700'
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Reports Feed */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="neo-card p-10 bg-rose-100 text-center space-y-3">
          <p className="font-black text-sm text-rose-900">
            {error?.response?.data?.error?.message || 'Failed to load moderation reports.'}
          </p>
          <Button variant="danger" onClick={() => refetch()} className="text-xs">
            Retry
          </Button>
        </div>
      ) : reports.length === 0 ? (
        <div className="neo-card p-12 bg-white text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="text-lg font-black text-slate-900">No reports found</h3>
          <p className="text-xs font-bold text-slate-500 max-w-sm mx-auto">
            {statusFilter === 'pending'
              ? 'Great news! All reported reviews have been reviewed by moderators.'
              : 'No reports match this status filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {reports.map((report) => {
            const reasonConfig = REASON_LABELS[report.reason] || REASON_LABELS.other;

            return (
              <div key={report.id} className="neo-card p-6 bg-white space-y-4">
                {/* Header: Reason, Product, Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${reasonConfig.color}`}
                    >
                      {reasonConfig.label}
                    </span>

                    <span className="text-xs font-bold text-slate-500">•</span>

                    <span className="text-xs font-bold text-slate-700">
                      Product:{' '}
                      <Link
                        to={`/products/${report.productId}`}
                        className="font-black text-slate-900 hover:underline inline-flex items-center gap-1"
                      >
                        {report.productName} <ExternalLink className="w-3 h-3 inline" />
                      </Link>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Reported {formatRelativeTime(report.createdAt)}</span>
                  </div>
                </div>

                {/* Body: Reported Review Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  {/* Left 2 Cols: The Review Snapshot */}
                  <div className="lg:col-span-2 p-4 bg-slate-50 border-2 border-black rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-500">
                        Review by:{' '}
                        <span className="font-black text-slate-900">
                          {report.reviewAuthor?.name || 'Customer'}
                        </span>
                      </div>
                      <div className="text-amber-500 font-black text-xs">
                        {'★'.repeat(report.reviewSnapshot?.rating || 0)}
                        {'☆'.repeat(5 - (report.reviewSnapshot?.rating || 0))}
                      </div>
                    </div>

                    <h4 className="font-black text-sm text-slate-900">
                      "{report.reviewSnapshot?.title}"
                    </h4>
                    <p className="text-xs font-medium text-slate-700 leading-relaxed whitespace-pre-line">
                      {report.reviewSnapshot?.body}
                    </p>
                  </div>

                  {/* Right 1 Col: Reporter Info & Context */}
                  <div className="p-4 neo-card-sm bg-amber-50/50 space-y-2 text-xs">
                    <span className="font-black uppercase tracking-wider text-slate-500 block text-[10px]">
                      Reporter Details
                    </span>
                    <div className="font-bold text-slate-800">
                      {report.reporter?.name || 'Anonymous User'}
                    </div>
                    {report.reporter?.email && (
                      <div className="text-slate-500 font-medium text-[11px] truncate">
                        {report.reporter.email}
                      </div>
                    )}

                    {report.details ? (
                      <div className="pt-2 border-t border-amber-200">
                        <span className="font-bold text-slate-600 block text-[11px]">Note from reporter:</span>
                        <p className="text-slate-800 font-medium italic mt-0.5">
                          "{report.details}"
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Footer Actions or Status Banner */}
                <div className="pt-3 border-t-2 border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {report.status === 'pending' ? (
                    <>
                      <div className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>Requires moderator decision</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => handleAction(report.id, 'dismiss')}
                          disabled={isProcessing}
                          className="text-xs py-1.5 px-3"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Dismiss (Keep Review)
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleAction(report.id, 'approve')}
                          disabled={isProcessing}
                          className="text-xs py-1.5 px-3 shadow-[2px_2px_0_0_#000]"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Delete Review (Accept)
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600">
                      <div className="flex items-center gap-1.5">
                        {report.status === 'resolved' ? (
                          <span className="neo-badge bg-emerald-200 text-emerald-950 text-[11px]">
                            <Check className="w-3 h-3 mr-1 inline" /> Review Removed
                          </span>
                        ) : (
                          <span className="neo-badge bg-slate-200 text-slate-800 text-[11px]">
                            <XCircle className="w-3 h-3 mr-1 inline" /> Dismissed
                          </span>
                        )}
                        {report.resolvedBy && (
                          <span className="text-slate-500">
                            by {report.resolvedBy} • {formatRelativeTime(report.resolvedAt)}
                          </span>
                        )}
                      </div>

                      {report.adminNotes && (
                        <span className="text-slate-500 italic text-[11px]">
                          Note: {report.adminNotes}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="text-xs py-1.5 px-3"
              >
                Previous
              </Button>
              <span className="text-xs font-black text-slate-700">
                Page {page} of {pagination.totalPages}
              </span>
              <Button
                variant="secondary"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="text-xs py-1.5 px-3"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminReportsPage;
