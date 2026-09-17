import React, { useState } from 'react';
import { X, Flag, AlertTriangle } from 'lucide-react';
import Button from '../../../components/ui/Button.jsx';
import { useReportMutation } from '../hooks/useReportMutation.js';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or commercial advertisement' },
  { value: 'offensive', label: 'Offensive, abusive, or hate speech' },
  { value: 'misleading', label: 'False or misleading information' },
  { value: 'irrelevant', label: 'Irrelevant to this product' },
  { value: 'other', label: 'Other community guideline violation' },
];

export function ReportReviewModal({ isOpen, onClose, review }) {
  const [reason, setReason] = useState('spam');
  const [details, setDetails] = useState('');
  const reportMutation = useReportMutation();

  if (!isOpen || !review) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await reportMutation.mutateAsync({
        reviewId: review._id || review.id,
        data: { reason, details },
      });
      setDetails('');
      setReason('spam');
      onClose();
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg neo-card p-0 bg-white shadow-[6px_6px_0_0_#000] overflow-hidden">
        {/* Header */}
        <div className="bg-rose-300 border-b-2.5 border-black p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0_0_#000]">
              <Flag className="w-4 h-4 text-rose-600 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900 leading-tight">
                Report This Review
              </h3>
              <p className="text-[11px] font-bold text-slate-700">
                Help our moderation team keep feedback honest and safe
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 border-2 border-black rounded-md bg-white hover:bg-rose-100 transition-colors shadow-[1px_1px_0_0_#000]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Review Snippet Context */}
          <div className="p-3 bg-slate-50 border-2 border-black rounded-lg space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500">Flagging review by:</span>
              <span className="font-black text-slate-900">{review.user?.name || 'Customer'}</span>
            </div>
            <div className="font-bold text-xs text-slate-800 line-clamp-1 italic">
              "{review.title}"
            </div>
          </div>

          {/* Reason Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              Reason for reporting <span className="text-rose-600">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full neo-input text-xs font-bold py-2 px-3 bg-white"
            >
              {REPORT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Optional Details Textarea */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                Additional context <span className="text-slate-400 font-bold">(optional)</span>
              </label>
              <span className="text-[10px] font-bold text-slate-400">{details.length}/500</span>
            </div>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value.slice(0, 500))}
              placeholder="Provide any specific details that will help moderators evaluate this review..."
              className="w-full neo-input text-xs font-medium p-3 resize-none"
            />
          </div>

          {/* Limit Notice */}
          <div className="flex items-start gap-2 p-2.5 bg-amber-50 border-1.5 border-black rounded text-[11px] font-semibold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              Users may submit at most <strong>5 reports per 24 hours</strong>. False or abusive reporting may result in account restrictions.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="text-xs py-2 px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              isLoading={reportMutation.isPending}
              className="text-xs py-2 px-4 shadow-[3px_3px_0_0_#000]"
            >
              <Flag className="w-3.5 h-3.5 mr-1.5 stroke-[2.5]" />
              Submit Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportReviewModal;
