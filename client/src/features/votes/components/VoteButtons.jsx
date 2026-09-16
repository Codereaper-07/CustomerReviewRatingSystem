import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { useToast } from '../../../context/ToastContext.jsx';

export function VoteButtons({
  reviewId,
  voteStats,
  currentUserVote,
  onVote,
  disabled = false,
}) {
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const upvotes = voteStats?.upvotes ?? 0;
  const downvotes = voteStats?.downvotes ?? 0;

  const handleVoteClick = (type) => {
    if (!isAuthenticated) {
      toast.info('Please sign in to upvote or downvote reviews.', 'Authentication Required');
      return;
    }
    onVote({ reviewId, type, currentVote: currentUserVote });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Upvote Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => handleVoteClick('up')}
        className={`neo-vote-btn ${currentUserVote === 'up' ? 'active-up' : ''}`}
        title="Helpful review"
      >
        <ThumbsUp className={`w-3.5 h-3.5 stroke-[2.5] ${currentUserVote === 'up' ? 'fill-current' : ''}`} />
        <span>{upvotes}</span>
      </button>

      {/* Downvote Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => handleVoteClick('down')}
        className={`neo-vote-btn ${currentUserVote === 'down' ? 'active-down' : ''}`}
        title="Unhelpful review"
      >
        <ThumbsDown className={`w-3.5 h-3.5 stroke-[2.5] ${currentUserVote === 'down' ? 'fill-current' : ''}`} />
        <span>{downvotes}</span>
      </button>
    </div>
  );
}

export default VoteButtons;
