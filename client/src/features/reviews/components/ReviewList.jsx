import React, { useMemo, useState } from 'react';
import { MessageSquarePlus, RefreshCw, Star } from 'lucide-react';
import { useInfiniteReviews } from '../hooks/useReviews.js';
import { useReviewMutations } from '../hooks/useReviewMutations.js';
import { useVoteMutation } from '../../votes/hooks/useVoteMutation.js';
import { useAuth } from '../../auth/hooks/useAuth.js';
import ReviewItem from './ReviewItem.jsx';
import Button from '../../../components/ui/Button.jsx';
import Skeleton from '../../../components/ui/Skeleton.jsx';

export function ReviewList({
  productId,
  onOpenWriteModal,
  onOpenEditModal,
}) {
  const { user } = useAuth();
  const currentUserId = user?.id;

  // Star filter state: null = "All", 1-5 = specific star rating.
  const [starFilter, setStarFilter] = useState(null);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteReviews(productId, 10);

  const { deleteReview, isDeleting } = useReviewMutations(productId);
  const voteMutation = useVoteMutation(productId);

  // All reviews across all fetched pages.
  const allReviews = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => (Array.isArray(page?.data) ? page.data : page?.data?.items ?? []));
  }, [data]);

  // Count of reviews per star rating (for the filter badge).
  const starCounts = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of allReviews) {
      if (r.rating >= 1 && r.rating <= 5) counts[r.rating]++;
    }
    return counts;
  }, [allReviews]);

  // Reviews visible after applying the star filter.
  const reviews = useMemo(() => {
    if (starFilter === null) return allReviews;
    return allReviews.filter((r) => r.rating === starFilter);
  }, [allReviews, starFilter]);

  // Check if current user already submitted a review for this product.
  const userReview = useMemo(() => {
    if (!currentUserId) return null;
    return allReviews.find(
      (r) =>
        String(r.user?.id || r.user?._id || r.userId || r.user) === String(currentUserId)
    );
  }, [allReviews, currentUserId]);

  const handleDelete = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete your review?')) {
      await deleteReview(reviewId);
    }
  };

  const handleVote = (votePayload) => {
    voteMutation.mutate(votePayload);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="neo-card p-6 space-y-4 bg-white">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="neo-card p-6 bg-rose-100 text-center space-y-3">
        <p className="font-bold text-rose-800 text-sm">
          {error?.response?.data?.error?.message || 'Failed to load reviews.'}
        </p>
        <Button variant="danger" onClick={() => refetch()} className="text-xs py-1.5 px-3">
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Review Counter & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2.5 border-black">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Customer Reviews ({allReviews.length})
          </h3>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Verified ratings and feedback from actual users
          </p>
        </div>

        {userReview ? (
          <Button
            variant="accent"
            onClick={() => onOpenEditModal(userReview)}
            className="text-xs py-2 px-4"
          >
            Edit Your Review
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={onOpenWriteModal}
            className="text-xs py-2 px-4 shadow-[3px_3px_0_0_#000]"
          >
            <MessageSquarePlus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            Write a Review
          </Button>
        )}
      </div>

      {/* Star Rating Filter Bar */}
      {allReviews.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Filter:</span>
          {/* "All" button */}
          <button
            onClick={() => setStarFilter(null)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-black border-2 border-black rounded-md transition-colors shadow-[2px_2px_0_0_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${
              starFilter === null
                ? 'bg-black text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            All
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${starFilter === null ? 'bg-white text-black' : 'bg-slate-100 text-slate-600'}`}>
              {allReviews.length}
            </span>
          </button>
          {/* 5 → 1 star buttons */}
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              onClick={() => setStarFilter(starFilter === star ? null : star)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-black border-2 border-black rounded-md transition-colors shadow-[2px_2px_0_0_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${
                starFilter === star
                  ? 'bg-amber-400 text-black'
                  : 'bg-white text-slate-700 hover:bg-amber-50'
              }`}
            >
              <Star className="w-3 h-3 fill-current" />
              {star}
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${starFilter === star ? 'bg-black text-white' : 'bg-slate-100 text-slate-600'}`}>
                {starCounts[star]}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Review List Items */}
      {reviews.length === 0 ? (
        <div className="neo-card p-10 bg-white text-center space-y-4">
          <div className="w-12 h-12 bg-amber-100 border-2 border-black rounded-lg flex items-center justify-center mx-auto shadow-[2px_2px_0_0_#000]">
            <MessageSquarePlus className="w-6 h-6 text-amber-700" />
          </div>
          <div className="space-y-1">
            {starFilter !== null ? (
              <>
                <h4 className="font-black text-lg text-slate-900">No {starFilter}★ reviews</h4>
                <p className="text-xs font-bold text-slate-500 max-w-sm mx-auto">
                  No reviews with this rating yet.{' '}
                  <button
                    onClick={() => setStarFilter(null)}
                    className="underline text-amber-600 font-black"
                  >
                    Show all reviews
                  </button>
                </p>
              </>
            ) : (
              <>
                <h4 className="font-black text-lg text-slate-900">No reviews yet</h4>
                <p className="text-xs font-bold text-slate-500 max-w-sm mx-auto">
                  Be the first to share your thoughts and help others make an informed decision!
                </p>
              </>
            )}
          </div>
          {starFilter === null && (
            <Button variant="primary" onClick={onOpenWriteModal} className="text-xs py-2 px-4">
              Write First Review
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewItem
              key={review._id}
              review={review}
              currentUserId={currentUserId}
              onEdit={onOpenEditModal}
              onDelete={handleDelete}
              onVote={handleVote}
              isDeleting={isDeleting}
            />
          ))}

          {/* Cursor Pagination "Load More" — only show when not filtering */}
          {starFilter === null && hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="secondary"
                onClick={() => fetchNextPage()}
                isLoading={isFetchingNextPage}
                className="px-6 py-2.5 text-xs font-black shadow-[3px_3px_0_0_#000]"
              >
                Load More Reviews
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ReviewList;
