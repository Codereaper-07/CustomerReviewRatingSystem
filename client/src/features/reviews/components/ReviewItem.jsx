import React from 'react';
import { Edit2, Trash2, Flag } from 'lucide-react';
import { formatRelativeTime } from '../../../utils/formatters.js';
import StarRating from '../../../components/ui/StarRating.jsx';
import VoteButtons from '../../votes/components/VoteButtons.jsx';

export function ReviewItem({
  review,
  currentUserId,
  onEdit,
  onDelete,
  onVote,
  onReport,
  isDeleting = false,
}) {
  const isOwner =
    Boolean(currentUserId) &&
    (String(review.user?.id || review.user?._id || review.userId || review.user) ===
      String(currentUserId));

  return (
    <div className="neo-card p-6 bg-white space-y-4">
      {/* Header: Author Info, Rating & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-black bg-amber-300 flex items-center justify-center font-black text-xs shadow-[1.5px_1.5px_0_0_#000]">
            {review.user?.name ? review.user.name.substring(0, 2).toUpperCase() : 'CU'}
          </div>
          <div>
            <div className="font-black text-sm text-slate-900">
              {review.user?.name || 'Customer'}
            </div>
            <div className="text-xs font-semibold text-slate-500">
              {formatRelativeTime(review.createdAt)}
            </div>
          </div>
        </div>

        {/* Rating Stars & Owner Controls */}
        <div className="flex items-center gap-3">
          <StarRating rating={review.rating} size="sm" />

          {isOwner && (
            <div className="flex items-center gap-1.5 ml-2 pl-3 border-l-2 border-slate-300">
              <button
                type="button"
                onClick={() => onEdit(review)}
                className="p-1.5 border-1.5 border-black rounded bg-amber-100 hover:bg-amber-300 transition-colors cursor-pointer shadow-[1px_1px_0_0_#000]"
                title="Edit your review"
              >
                <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => onDelete(review._id)}
                className="p-1.5 border-1.5 border-black rounded bg-rose-100 hover:bg-rose-300 transition-colors cursor-pointer shadow-[1px_1px_0_0_#000]"
                title="Delete your review"
              >
                <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Review Content */}
      <div className="space-y-1.5">
        <h4 className="font-black text-base text-slate-900 tracking-tight">{review.title}</h4>
        <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-line">
          {review.body}
        </p>
      </div>

      {/* Footer: Helpful Vote Buttons & Report Action */}
      <div className="pt-3 border-t-2 border-black flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Was this review helpful?
          </span>
          <VoteButtons
            reviewId={review._id}
            voteStats={review.voteStats}
            currentUserVote={review.currentUserVote}
            onVote={onVote}
          />
        </div>

        {!isOwner && onReport && (
          <button
            type="button"
            onClick={() => onReport(review)}
            className="inline-flex items-center gap-1 text-[11px] font-black text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
            title="Report this review"
          >
            <Flag className="w-3 h-3 stroke-[2.5]" />
            <span className="hidden sm:inline">Report</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default ReviewItem;
